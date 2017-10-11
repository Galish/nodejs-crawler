const amqp = require('amqplib/callback_api')
const config = require('../config')

class Worker {
	constructor(storage) {
		this.channel = null
		this.sendMessage = this.sendMessage.bind(this)
	}

	init() {
		return new Promise((resolve, reject) => {
			amqp.connect(config.amqpServer, (err, conn) => {
				if (err) {
					console.log('> AMQP error:', err)
					reject(err)
					return
				}

				console.log('> AMQP connected')

				conn.createChannel((err, ch) => {
					if (err) {
						console.log('> AMQP channel can\'t be created:', err)
						reject(err)
						return
					}

					console.log('> AMQP channel is created')
					resolve(ch)

					ch.assertQueue(config.queueName, {durable: false})
					this.channel = ch
				})
			})
		})
	}

	sendMessage(message) {
		if (!this.channel) {
			console.log('> ERR: AMQP message can\'t be send')
			return
		}

		console.log('> AMQP sent message #' + message.id)
		this.channel.sendToQueue(config.queueName, new Buffer(JSON.stringify(message)))
	}
}

module.exports = Worker