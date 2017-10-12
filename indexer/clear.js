const Storage = require('./storage')
const messagesStorage = new Storage('messages')

messagesStorage.clear().then(
	() => {
		process.exit()
	},
	() => {
		process.exit(1)
	}
)