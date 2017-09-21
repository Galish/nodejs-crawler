const amqp = require('amqplib/callback_api')
const queue = 'crawler_task'

amqp.connect('amqp://localhost', (err, conn) => {
	if (err) return

	conn.createChannel((err, ch) => {
		ch.assertQueue(queue, {durable: false})

		setTimeout(() => {
			const data = {
				title: 'Message title',
				text: 'Some sample text'
			}
			ch.sendToQueue(queue, new Buffer(JSON.stringify(data)))
		}, 3000)

		// setTimeout(function () {
		// 	// Note: on Node 6 Buffer.from(msg) should be used
		// 	ch.sendToQueue(q, new Buffer('Hello World!'));
		// 	console.log(" [x] Sent 'Hello World!'");
		// }, 1000);
		//
		// setTimeout(function () {
		// 	// Note: on Node 6 Buffer.from(msg) should be used
		// 	ch.sendToQueue(q, new Buffer('Hello World 2'));
		// 	console.log(" [x] Sent 'Hello World 2'");
		// }, 2000);
		//
		// setTimeout(function () {
		// 	// Note: on Node 6 Buffer.from(msg) should be used
		// 	ch.sendToQueue(q, new Buffer('Hello World 3'));
		// 	console.log(" [x] Sent 'Hello World 3'");
		// }, 3000);


	})
})