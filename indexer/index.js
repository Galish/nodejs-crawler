const Storage = require('./storage')
const Worker = require('./worker')
const WebSocketsServer = require('./wsserver')

const messagesStorage = new Storage('messages')
messagesStorage.init()

const messagesWorker = new Worker(messagesStorage)
messagesWorker.init()

const wsServer = new WebSocketsServer(messagesStorage)
wsServer.init()