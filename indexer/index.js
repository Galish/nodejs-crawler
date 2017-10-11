const Storage = require('./storage')
const Worker = require('./worker')
const WebSocketsServer = require('./wsserver')

const messagesStorage = new Storage('messages')
const messagesWorker = new Worker(messagesStorage)
const wsServer = new WebSocketsServer(messagesStorage)

messagesStorage.init()
	.then(() =>
		messagesStorage.indexData()
	)
	.then(() => {
		messagesWorker.init()
		wsServer.init()
	})