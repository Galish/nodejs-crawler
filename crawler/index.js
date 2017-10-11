const Crawler = require('./crawler')
const Worker = require('./worker')

const messagesWorker = new Worker()
const crawlerTask = new Crawler(
	'http://x7bwsmcore5fmx56.onion/',
	messagesWorker.sendMessage
)

messagesWorker.init()
	.then(() =>
		crawlerTask.run()
	)