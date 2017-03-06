'use strict'

const { message, MessageType } = require('./message')
const WebSocket = require('ws')
const port = process.env.P2P_PORT || 6001

class PeerToPeer {
  constructor () {
    this.sockets = []
    this.peers = process.env.PEERS ? process.env.PEERS.split(',') : []
  }

  bootstrap (blockchain) {
    this.blockchain = blockchain
    var server = new WebSocket.Server({ port })
    server.on('connection', this.initConnection)
    console.log(`listening websocket p2p port on: ${port}`)
    this.connectToPeers(this.peers)
  }

  connectToPeers (newPeers) {
    newPeers.forEach((peer) => {
      const ws = new WebSocket(peer)
      ws.on('open', () => this.initConnection(ws))
      ws.on('error', () => {
        console.log('connection failed')
      })
    })
  }

  initConnection (ws) {
    this.sockets.push(ws)
    this.initMessageHandler(ws)
    this.initErrorHandler(ws)
    this.write(ws, message.getQueryChainLengthMsg())
  }

  write (ws, message) {
    ws.send(JSON.stringify(message))
  }

  broadcast (message) {
    this.sockets.forEach(socket => this.write(socket, message))
  }

  initMessageHandler (ws) {
    ws.on('message', (data) => {
      const message = JSON.parse(data)
      console.log(`Received message ${JSON.stringify(message)}`)
      switch (message.type) {
        case MessageType.QUERY_LATEST:
          this.write(ws, message.responseLatestMsg())
          break
        case MessageType.QUERY_ALL:
          this.write(ws, message.getResponseChainMsg(this.blockchain))
          break
        case MessageType.RESPONSE_BLOCKCHAIN:
          this.handleBlockchainResponse(message)
          break
        default:
          console.log(`Received unknown message type ${message.type}`)
      }
    })
  }

  closeConnection (ws) {
    console.log(`connection failed to peer: ${ws.url}`)
    this.sockets.splice(this.sockets.indexOf(ws), 1)
  }

  initErrorHandler (ws) {
    ws.on('close', () => this.closeConnection(ws))
    ws.on('error', () => this.closeConnection(ws))
  }

  handleBlockchainResponse (message) {
    const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index > b2.index))
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1]
    const latestBlockHeld = this.blockchain.latestBlock

    if (latestBlockReceived.index <= latestBlockHeld.index) {
      console.log('received blockchain is not longer than received blockchain. Do nothing')
      return
    }

    console.log(`blockchain possibly behind. We got: ${latestBlockHeld.index}, Peer got: ${latestBlockReceived.index}`)
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
      console.log('We can append the received block to our chain')
      this.blockchain.addBlock(latestBlockReceived)
      this.broadcast(message.getResponseLatestMsg())
    } else if (receivedBlocks.length === 1) {
      console.log('We have to query the chain from our peer')
      this.broadcast(message.getQueryAllMsg())
    } else {
      console.log('Received blockchain is longer than current blockchain')
      this.blockchain.replaceChain(receivedBlocks)
    }
  }
}

module.exports = new PeerToPeer()
