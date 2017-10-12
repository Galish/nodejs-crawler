module.exports = {
	clientPort: 8000,
	websocketsPort: 8080,
	queueName: 'crawler_task',
	amqpServer: 'amqp://localhost',
	batchSize: 1000,
	batchOptions: {
		title: {
			compositeField: false,
			fieldOptions: {
				preserveCase: false
			}
		},
		text: {
			compositeField: false,
			fieldOptions: {
				preserveCase: false
			}
		}
	}
}