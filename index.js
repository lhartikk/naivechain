let outputTag=$("#output")[0];
let index=1;

getStatus=({status})=>{
    outputTag.value=`${outputTag.value}=> response status: ${status}\n`;
    outputTag.value=`${outputTag.value}${index.toString().padEnd(20,'=')}\n`;
    outputTag.scrollTop = outputTag.scrollHeight;
    index++;
    return status;
}
//=================
//    send Data
//=================
Rx.Observable.fromEvent($("#sendBtn")[0],'click')
.mergeMap(()=>{
    let host=$("#host")[0].value;
    let port=$("#port")[0].value;
    let data=$("#sendData")[0].value;
    
    outputTag.value=
    `${outputTag.value}<= send to http://${host}:${port}/mineBlock,\n`
    +`<= mothod: POST,\n`
    +`<= body: {"data":"${data}"}\n\n`;

    outputTag.scrollTop = outputTag.scrollHeight;

    return Rx.Observable.ajax({url:`http://${host}:${port}/mineBlock`, method: 'POST', headers: {
        'Content-Type': 'application/json',
      } ,body:{data:data}});
})
.catch((error,obs)=>{
    return Rx.Observable.of(error)
})
.map(getStatus).repeat()
.subscribe({next:(data)=>{
        console.log(data);
    }
});

//=================
//    add Peer
//=================
Rx.Observable.fromEvent($("#addPeerBtn")[0],'click')
.mergeMap(()=>{
    let host=$("#host")[0].value;
    let port=$("#port")[0].value;
    let peeripport=$("#peeripport")[0].value;
    
    outputTag.value=
    `${outputTag.value}<= send to http://${host}:${port}/addPeer,\n`
    +`<= mothod: POST,\n`
    +`<= body: {"peer":"ws://${peeripport}"}\n\n`;

    outputTag.scrollTop = outputTag.scrollHeight;

    return Rx.Observable.ajax({url:`http://${host}:${port}/addPeer`, method: 'POST', headers: {
        'Content-Type': 'application/json',
      } ,body:{peer:`ws://${peeripport}`}});
}).catch((error)=>{
    console.log(error)
    return Rx.Observable.of(error)
}).map(getStatus).repeat()
.subscribe({next:(data)=>{
        console.log(data);
    }
});

//=================
//    get info
//=================
Rx.Observable.interval(1000).mergeMap(()=>{
    let host=$("#host")[0].value;
    let port=$("#port")[0].value;
    let getblock=Rx.Observable.ajax(`http://${host}:${port}/blocks`);
    return getblock
}).catch((error)=>{
    error.response=[]
    return Rx.Observable.of(error)
}).mergeMap(({response})=>{
    response.reverse();
    console.log(response)
    $("#blockchain")[0].value=JSON.stringify(response||[],null,3)
    let host=$("#host")[0].value;
    let port=$("#port")[0].value;
    let getPeer=Rx.Observable.ajax(`http://${host}:${port}/peers`);
    return getPeer;
}).catch((error)=>{
    error.response=[]
    return Rx.Observable.of(error)
}).repeat().subscribe({
    next:({response})=>{
        $("#peers")[0].value=JSON.stringify(response,null,3)
    }
});















