const amqp = require('amqplib/callback_api')
const config = require('../config')

class Worker {
	constructor(storage) {
		this.storage = storage
	}

	init() {
		amqp.connect(config.amqpServer, (err, conn) => {
			conn.createChannel((err, ch) => {
				ch.assertQueue(config.queueName, {durable: false})

				this.storage.clearList()

				ch.consume(config.queueName, ({content}) => {
					this.storage.pushItem(JSON.parse(content))
				}, {noAck: true})
			})
		})
	}
}

module.exports = Worker