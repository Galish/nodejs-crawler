const amqp = require('amqplib/callback_api')
const config = require('../config')
const dummyData = require('./dummydata')

amqp.connect(config.amqpServer, (err, conn) => {
	if (err) return

	conn.createChannel((err, ch) => {
		ch.assertQueue(config.queueName, {durable: false})

		setTimeout(function () {
			dummyData.forEach(message => {
				ch.sendToQueue(config.queueName, new Buffer(JSON.stringify(message)))
			})
		}, 3000)

		// setTimeout(() => {
		// 	const data = {
		// 		title: 'Message title',
		// 		text: 'Some sample text'
		// 	}
		// 	ch.sendToQueue(config.queueName, new Buffer(JSON.stringify(data)))
		// }, 3000)
	})
})