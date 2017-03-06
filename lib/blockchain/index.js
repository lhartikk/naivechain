'use strict'

const Block = require('../block')
const { message } = require('../p2p/message')
const CryptoJS = require('crypto-js')

class Blockchain {
  constructor () {
    this.blockchain = [Block.genesis]
  }

  get () {
    return this.blockchain
  }

  get latestBlock () {
    return this.blockchain[this.blockchain.length - 1]
  }

  replaceChain (newBlocks) {
    if (!this.isValidChain(newBlocks) || newBlocks.length <= this.blockchain.length) {
      console.log('Received blockchain invalid')
      return
    }

    console.log('Received blockchain is valid. Replacing current blockchain with received blockchain')
    this.blockchain = newBlocks
    this.broadcast(message.responseLatestMsg())
  }

  isValidChain (blockchainToValidate) {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(Block.genesis)) {
      return false
    }

    const tempBlocks = [blockchainToValidate[0]]
    for (let i = 1; i < blockchainToValidate.length; i++) {
      if (this.isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
        tempBlocks.push(blockchainToValidate[i])
      } else {
        return false
      }
    }
    return true
  }

  addBlock (newBlock) {
    if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
      this.blockchain.push(newBlock)
    }
  }

  calculateHashForBlock (block) {
    return this.calculateHash(block.index, block.previousHash, block.timestamp, block.data)
  }

  calculateHash (index, previousHash, timestamp, data) {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString()
  }

  isValidNewBlock (newBlock, previousBlock) {
    const blockHash = this.calculateHashForBlock(newBlock)

    if (previousBlock.index + 1 !== newBlock.index) {
      console.log('invalid index')
      return false
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log('invalid previoushash')
      return false
    } else if (blockHash !== newBlock.hash) {
      console.log(typeof (newBlock.hash) + ' ' + typeof blockHash)
      console.log(`invalid hash: ${blockHash} ${newBlock.hash}`)
      return false
    }
    return true
  }

  generateNextBlock (blockData) {
    const previousBlock = this.latestBlock
    const nextIndex = previousBlock.index + 1
    const nextTimestamp = new Date().getTime() / 1000
    const nextHash = this.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData)
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash)
  }
}

module.exports = new Blockchain()
