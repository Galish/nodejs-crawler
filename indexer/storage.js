const redis = require('redis')
const searchIndex = require('search-index')
const {batchOptions, batchSize} = require('../config')

class Storage {
	constructor(key) {
		this.key = key
		this.client = null
		this.dataIndex = null

		this.searchIndexOptions = {
			batchSize: 1000
		}
		this.batchOptions = batchOptions
	}

	init() {
		return Promise.all([this.initRedis(), this.initIndex()])
			.then(values => {
				console.log('> Storage init is done')
			})
	}

	initRedis() {
		return new Promise((resolve, reject) => {
			this.client = redis.createClient()
			console.log('> Redis is initialized')
			resolve(this.client)

			this.client.on('error', (err) => {
				reject(err)
				console.log('... Redis error ' + err)
			})
		})
	}

	initIndex() {
		return new Promise((resolve, reject) => {
			searchIndex(this.searchIndexOptions, (err, index) => {
				if (err) {
					console.log('... Index error:', err)
					reject(err)
					return
				}

				this.dataIndex = index
				console.log('> Index is initialized')
				resolve(index)
			})
		})
	}

	clear() {
		return this.init().then(() =>
			Promise.all([this.clearRedis(), this.clearIndex()])
		)
	}

	clearIndex() {
		return new Promise((resolve, reject) => {
			this.dataIndex.flush((err) => {
				if (err) {
					console.log('> Index can\'t be deleted', err)
					reject(err)
					return
				}

				console.log('> Index was deleted successfully')
				resolve()
			})
		})
	}

	clearRedis() {
		return new Promise((resolve, reject) => {
			this.client.del(this.key, (err, res) => {
				if (err) {
					console.log('Redis key can\'t be deleted', err)
					reject(err)
					return
				}
				if (res === 1) {
					console.log('> Redis key was deleted successfully')
					resolve()
					return
				}
				console.log('> Redis key was\'t created yet')
				resolve()
			})
		})
	}

	pushItem(data) {
		this.client.rpush(this.key, JSON.stringify(data), (err, reply) => {
			// console.log('REDIS:', reply)
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

	indexData() {
		return this.getList().then(data => {
			if (data && data.length) {
				console.log('> Loaded data to Index from Redis -', data.length, 'items')
				this.addToIndex(data)
				return data
			} else {
				return []
			}
		})
	}

	addToIndex(data) {
		this.dataIndex.concurrentAdd(this.batchOptions, data, function(err) {})
	}

	searchIndex(search) {
		const query = [
			{
				AND: {'text': [...search.split(' ')]}
			},
			{
				AND: {'title': [...search.split(' ')]}
			}
		]

		console.log('> Search for', search)

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