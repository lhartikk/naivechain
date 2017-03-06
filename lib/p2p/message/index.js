'use strict'

const MessageType = {
  QUERY_LATEST: 0,
  QUERY_ALL: 1,
  RESPONSE_BLOCKCHAIN: 2
}

// TODO: Msg -> Message
class Message {
  getQueryChainLengthMessage () {
    return {
      type: MessageType.QUERY_LATEST
    }
  }

  getQueryAllMsg () {
    return {
      type: MessageType.QUERY_ALL
    }
  }

  getResponseChainMsg (blockchain) {
    return {
      type: MessageType.RESPONSE_BLOCKCHAIN,
      data: JSON.stringify(blockchain.get())
    }
  }

  getResponseLatestMsg (blockchain) {
    return {
      type: MessageType.RESPONSE_BLOCKCHAIN,
      data: JSON.stringify([
        blockchain.latestBlock
      ])
    }
  }
}

const message = new Message()
module.exports = { MessageType, message }
