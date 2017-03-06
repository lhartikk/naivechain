'use strict'

const httpServer = require('./lib/server')
const blockchain = require('./lib/blockchain')
const peerToPeer = require('./lib/p2p')

peerToPeer.bootstrap(blockchain)
httpServer.bootstrap(peerToPeer, blockchain)
