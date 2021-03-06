const amqp = require('amqplib/callback_api')
const config = require('../config')

class Worker {
	constructor(storage) {
		this.storage = storage
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

					ch.assertQueue(config.queueName, {durable: false})
					console.log('> AMQP channel is created')

					resolve(ch)

					ch.consume(config.queueName, ({content}) => {
						const message = JSON.parse(content)

						console.log('> AMQP got message #' + message.id)
						this.storage.pushItem(message)
					}, {noAck: true})
				})
			})
		})
	}
}

module.exports = Worker