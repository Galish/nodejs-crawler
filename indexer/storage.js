const redis = require('redis')
const searchIndex = require('search-index')

class Storage {
	constructor(key) {
		this.key = key
		this.client = null
		this.dataIndex = null

		this.searchIndexOptions = {
			batchSize: 1000
		}
		this.batchOptions = {
			title: {
				compositeField: true,
				fieldOptions: {
					preserveCase: false
				}
			},
			text: {
				compositeField: true,
				fieldOptions: {
					preserveCase: false
				}
			}
		}
	}

	init() {
		this.initRedis()
		this.initIndex()
		this.indexData()
	}

	initRedis() {
		this.client = redis.createClient()
		this.client.on('error', (err) => {
			console.log('Redis error ' + err)
		})
	}

	initIndex() {
		searchIndex(this.searchIndexOptions, (err, index) => {
			if (err) {
				console.log(err)
				return
			}

			this.dataIndex = index
		})
	}

	pushItem(data) {
		this.client.rpush(this.key, JSON.stringify(data), (err, reply) => {
			console.log('REDIS:', reply)
		})
		this.addToIndex([data])
	}

	getList() {
		return new Promise((resolve, reject) => {
			this.client.lrange(this.key, 0, -1, (err, list) => {
				if (err) {
					reject(err)
					return
				}

				resolve(list.map(item => JSON.parse(item)))
			})
		})
	}

	clearList() {
		this.client.del(this.key)
	}

	indexData() {
		this.getList().then(data => {
			// console.log('!!!!!!!', data);
			if (data && data.size) {
				this.addToIndex(data)
			}
		})
	}

	addToIndex(data) {
		this.dataIndex.concurrentAdd(this.batchOptions, data, function(err) {})
	}

	searchIndex(search) {
		const query = [
			{
				AND: {'text': [search.split(' ')]}
			},
			{
				AND: {'title': [search.split(' ')]}
			}
		]

		// console.log('query:', JSON.stringify(query))

		// this.dataIndex.countDocs(function (err, count) {
		// 	console.log(' >>>>> this index contains ' + count + ' documents')
		// })

		return new Promise((resolve, reject) => {
			const data = []
			this.dataIndex.search({query})
				.on('data', ({document}) => {
					data.push(document)
				})
				.on('end', () => {
					resolve(data)
				})
		})
	}
}

module.exports = Storage