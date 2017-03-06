'use strict'

const {
  QUERY_LATEST,
  QUERY_ALL,
  RESPONSE_BLOCKCHAIN
} = require('./message-type')

class Messages {
  getQueryChainLengthMsg () {
    return {
      type: QUERY_LATEST
    }
  }

  getQueryAllMsg () {
    return {
      type: QUERY_ALL
    }
  }

  getResponseChainMsg (blockchain) {
    return {
      type: RESPONSE_BLOCKCHAIN,
      data: JSON.stringify(blockchain.get())
    }
  }

  getResponseLatestMsg (blockchain) {
    return {
      type: RESPONSE_BLOCKCHAIN,
      data: JSON.stringify([
        blockchain.latestBlock
      ])
    }
  }
}

const messages = new Messages()
module.exports = messages
