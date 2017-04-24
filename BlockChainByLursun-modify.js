'use strict';
var CryptoJS = require("crypto-js");
var express = require("express");
var bodyParser = require('body-parser');
var WebSocket = require("ws");

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

//區塊鏈結構
class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
    }
}
//socker 陣列
var sockets = [];
//peer 清單
var peers = [];
var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2,
    QUERY_PEERS:4,
    RESPONSE_PEERS:5,
    RESPONSE_YOUSELF:6
};

//產生創世區塊
var getGenesisBlock = () => {
    return new Block(0, "0", 1465154705, "my genesis block!!", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
};

//區塊鏈 陣列
var blockchain = [getGenesisBlock()];

//初始化web 服務器
var initHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());
    //取的區塊鍊訊息
    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain)));
    //發出transaction 產生區塊
    app.post('/mineBlock', (req, res) => {
        var newBlock = generateNextBlock(req.body.data);
        addBlock(newBlock);
        broadcast(responseLatestMsg());
        console.log('block added: ' + JSON.stringify(newBlock));
        res.send();
    });
    //查詢socket
    app.get('/sockets', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    //查詢peers
    app.get('/peers', (req, res) => {
        res.send(JSON.stringify(peers));
    });
    //增加節點:主動向外增加
    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });
    //http 開port聆聽
    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};

//被動連線:開port領聽連線
var initP2PServer = () => {
    //相當於 Java SocketServer
    var server = new WebSocket.Server({port: p2p_port});

    //如果收到練線則初始化連線
    server.on('connection', ws => initConnection(ws));
    console.log('listening websocket p2p port on: ' + p2p_port);

};

//初始化連線 增加自己 sockets 清單 -> 初始化get訊息事件,初始化發生關閉或錯誤事件 -> 查詢對方最後區塊
var initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
    write(ws, queryAllPeers())
    broadcast(responsePeers())
};

//初始化收到訊息事件 -> 如果收到 查詢最後區塊訊息則 返回最後區塊
//                -> 如果收到 查詢所有區塊訊息則 返回所有區塊
//                -> 如果收到 查詢結果則        處理收到區塊訊息
var initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        var message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        console.log(message.type)
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.QUERY_PEERS:
                write(ws, responsePeers());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
            case MessageType.RESPONSE_PEERS:
                write(ws,responseYouself(ws._socket.remoteAddress));
                handlePeersResponse(message);
                break;
            case MessageType.RESPONSE_YOUSELF:
                //被動連線時取得自己ip 並放入 peers[] 並廣播
                var peer=message.data+":"+p2p_port;
                if(peers.indexOf(peer)==-1){
                    peers.push(peer)
                    broadcast(responsePeers())
                }
                break;
        }
    });
};

//初始化發生關閉或複寫錯誤事件
var initErrorHandler = (ws) => {
    var closeConnection = (ws) => {
        console.log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

//生成下個區塊 : 先取得最後一個區塊,得到區塊 index,hash 和 時間 與 資料 Hash 產生區塊
var generateNextBlock = (blockData) => {
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
};

//為Block計算Hash -> 計算Hash
var calculateHashForBlock = (block) => {
    return calculateHash(block.index, block.previousHash, block.timestamp, block.data);
};
//計算Hash
var calculateHash = (index, previousHash, timestamp, data) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};
//增加區塊 -> 先驗證區塊是否為 上個區塊的下個區塊 -> 在存入區塊鏈中
var addBlock = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
};
//驗證新區塊 index
var isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
        console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
        return false;
    }
    return true;
};
//主動連線至新節點
var connectToPeers = (newPeers) => {
    newPeers.forEach((peer) => {
        peer=peer.replace("localhost","127.0.0.1")
        //連線物件,相當 Java Socket
        var ws = new WebSocket(peer);
        
        //連線成功時事件
        ws.on('open', () => {peers.indexOf(peer)==-1? peers.push(peer):0; initConnection(ws)});

        //連線失敗時錯誤事件
        ws.on('error', () => {
            console.log('connection failed')
        });
    });
};


var handlePeersResponse = (message) => {
    var receivedPeers=JSON.parse(message.data);
    
    if(receivedPeers.length>0){
        receivedPeers.forEach((ipAndPort)=>{
            if(peers.indexOf(ipAndPort)==-1){
                peers.push(ipAndPort);
                connectToPeers([ipAndPort]);
            }
            
        })
    }
}
//收到區塊訊息時的處理
var handleBlockchainResponse = (message) => {

    // 依index排序返回陣列的區塊鏈(Array)
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));

    // 查詢 返回的區塊鍊 最後一個區塊 (form other peer)
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];

    // 查詢 自己的區塊鏈 最後一個區塊
    var latestBlockHeld = getLatestBlock();

    // 比較自己和 返回的區塊 高度,如果返回的區塊比較高 則...
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);

        //比較 當前最後區塊 是否為 返回的區塊 的前一個區塊
        //如果是 則為自己區塊鏈 增加此區塊,並繼續廣播此區塊
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received block to our chain");
            blockchain.push(latestBlockReceived);
            broadcast(responseLatestMsg());
        
        //如果返回的區塊,高度比自己高超過2,則向已知peer查詢全部區塊(鍊)
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());

        //如果返回的是區塊鍊,高度比自己高,驗證後,以對方的區塊鏈,取代自己區塊鏈
        } else {
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlocks);
        }
    } else {
        //收到的區塊鏈高度不超過自己,不做事
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
};
//驗證後,以newBlocks,取代自己的區塊鏈
var replaceChain = (newBlocks) => {
    //驗證 && 對方區塊鏈高度>自己區塊鏈高度
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('Received blockchain invalid');
    }
};

//驗證
var isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
        return false;
    }
    //暫時的區塊鏈(比對用)
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        //依序驗證每一個區塊 ##新改原BUG
        if (blockchain[i]!=null && blockchain[i].hash === blockchainToValidate[i].hash && isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            return false;
        }
    }
    return true;
};
//得到最後一個區塊
var getLatestBlock = () => blockchain[blockchain.length - 1];
//生成查詢最後區塊的請求資料
var queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});
//生成查詢所有區塊的請求資料
var queryAllMsg = () => ({'type': MessageType.QUERY_ALL});
//生成查詢所有peers的請求資料
var queryAllPeers = () => ({'type': MessageType.QUERY_PEERS});
//生成返回所有區塊的請求資料
var responseChainMsg = () =>({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockchain)
});
//生成返回最後區塊的請求資料 以陣列toSting 表示 ,以便handleBlockchainResponset處理
var responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
});
//生成返回目前 peers 清單
var responsePeers = () => ({
    'type': MessageType.RESPONSE_PEERS,
    'data': JSON.stringify(peers),
    
});
//生成返回請求者自身ip
var responseYouself = (address) => ({
    'type': MessageType.RESPONSE_YOUSELF,
    'data':'ws://'+address
})

//送出資料至socket(peer)
var write = (ws, message) => ws.send(JSON.stringify(message));
//廣播:傳送訊息至所有 socket(peers)
var broadcast = (message) => sockets.forEach(socket => write(socket, message));

//主動向外增加節點
connectToPeers(initialPeers);
initHttpServer();
initP2PServer();