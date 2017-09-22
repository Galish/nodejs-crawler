const config = require('../config')
const http = require('http')
const wsServer = require('websocket').server

class WebSocketsServer {
	constructor(storage) {
		this.storage = storage
		this.server = null
		this.connection = null
	}

	init() {
		const server = http.createServer((request, response) => {
			console.log((new Date()) + ' Received request for ' + request.url)
			response.writeHead(404)
			response.end()
		})

		server.listen(config.websocketsPort, function() {
			console.log(`${(new Date())} Server is listening on port ${config.websocketsPort}`)
		})

		this.server = new wsServer({
				httpServer: server,
				autoAcceptConnections: false
			}).on('request', this.onRequest.bind(this))
	}

	originIsAllowed(origin) {
		// put logic here to detect whether the specified origin is allowed.
		return true
	}

	onRequest(request) {
		if (!this.originIsAllowed(request.origin)) {
			// Make sure we only accept requests from an allowed origin
			request.reject()
			console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.')
			return
		}

		this.connection = request.accept('echo-protocol', request.origin)
		console.log(`${(new Date())} Connection accepted.`)

		this.connection.on('message', this.onMessage.bind(this))
		this.connection.on('close', this.onCloseConnection.bind(this))
	}

	onMessage(message) {
		if (message.type === 'utf8') {
			// console.log(' >>>> Received Message: ' + message.utf8Data)
			const {search} = JSON.parse(message.utf8Data)

			if (search) {
				console.log(' >>>> Search for ' + search)
				this.storage.searchIndex(search)
					.then(messages => {
						this.connection.sendUTF(JSON.stringify({messages}))
					})
			}
			// this.storage.getList().then(messages => {
			// 	this.connection.sendUTF(JSON.stringify({messages}))
			// })
			// this.storage.searchIndex()
		}
	}

	onCloseConnection(reasonCode, description) {
		console.log((new Date()) + ' Peer ' + this.connection.remoteAddress + ' disconnected.')
	}
}

module.exports = WebSocketsServer