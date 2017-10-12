const NodeCrawler = require('crawler')
const {parseDate} = require('./utils')

class Crawler {
	constructor(uri, onSendMessage) {
		this.uri = uri
		this.onSendMessage = onSendMessage

		this.crawler = new NodeCrawler({
			maxConnections: 10,
			rateLimit: 1000,
			proxy: 'http://localhost:8123',
			jQuery: true
		})
		this.forums = []
		this.topics = []
		this.messages = []
		this.topicIndex = 0
		this.postIndex = 0
	}

	run() {
		this.crawlForum()
			.then(forums => {
				console.log('> Crawling topics')
				return this.crawlForums(true)
			})
			.then(() =>
				this.crawlForums(false)
			)
			.then(() => {
				console.log('> Crawling posts')

				return this.crawlTopics(true)
			})
			.then(() =>
				this.crawlTopics(false)
			)
			.then(() => {
				console.log('> Crawling done!!!')
				console.log('  topics:', this.topicIndex)
				console.log('  posts:', this.postIndex)
				process.exit()
			})
			.catch((err) => {
				console.log('> Crawling error:', err)
				process.exit(1)
			})
	}

	crawlForum() {
		return new Promise((resolve, reject) => {
			this.crawler.queue([
				{
					uri: this.uri,
					callback: (err, res, done) => {
						if (err) {
							console.log(err)
							reject(err)
							return
						}

						const onDone = (data) => {
							resolve(data)
							done()
						}

						this.parseForums(err, res, onDone)
					}
				}
			])
		})
	}

	crawlForums(firstPage) {
		const queue = []

		this.forums.forEach(uri => {
			queue.push(
				this.crawlForumPage(uri, firstPage)
			)
		})

		return Promise.all(queue)
	}

	crawlForumPage(uri, firstPage) {
		return new Promise((resolve, reject) => {
			this.crawler.queue([
				{
					uri,
					callback: (err, res, done) => {
						if (err) {
							console.log(err)
							reject(err)
							return
						}

						const onDone = () => {
							if (firstPage) {
								this.forums = this.forums.filter(forumUri => forumUri !== uri)
							}
							resolve()
							done()
						}

						this.parseForumPage(err, res, onDone, firstPage)
					}
				}
			])
		})
	}

	crawlTopics(firstPage) {
		const queue = []

		this.topics.forEach(uri => {
			queue.push(
				this.crawlTopic(uri, firstPage)
			)
		})

		return Promise.all(queue)
	}

	crawlTopic(uri, firstPage) {
		return new Promise((resolve, reject) => {
			this.crawler.queue([
				{
					uri,
					callback: (err, res, done) => {
						if (err) {
							console.log(err)
							reject(err)
							return
						}

						const onDone = () => {
							if (firstPage) {
								this.topics = this.topics.filter(topicUri => topicUri !== uri)
							}
							resolve()
							done()
						}

						this.parseTopicPage(err, res, onDone, firstPage)
					}
				}
			])
		})
	}

	parseForums(err, res, done) {
		if (err) {
			console.log(err)
			return
		}

		this.fetchForums(res.$)

		done(this.forums)
	}

	parseForumPage(err, res, done, firstPage) {
		if (err) {
			console.log(err)
			return
		}

		this.fetchTopics(res.$)

		if (firstPage) {
			this.fetchForumPages(res.$)
		}

		done()
	}

	parseTopicPage(err, res, done, firstPage) {
		if (err) {
			console.log(err)
			return
		}

		this.fetchPosts(res.$)

		if (firstPage) {
			this.fetchTopicPages(res.$)
		}

		done()
	}

	fetchForums($) {
		$('#brd-main .item-subject a').each((index, link) => {
			const uri = $(link).attr('href')

			if (uri && !~this.forums.indexOf(uri)) {
				this.forums.push(uri)
			}
		})
	}

	fetchTopics($) {
		$('.main-content.main-forum.forum-views .main-item').each((index, item) => {
			const uri = $(item).find('.item-subject a').attr('href')

			if (uri) {
				if (!~this.topics.indexOf(uri)) {
					this.topics.push(uri)
				}
				this.topicIndex++
			}
		})
	}

	fetchForumPages($) {
		$('.main-pagepost .paging a').each((index, link) => {
			const uri = $(link).attr('href')

			if (uri && !~this.forums.indexOf(uri)) {
				this.forums.push(uri)
			}
		})
	}

	fetchTopicPages($) {
		$('.main-pagepost .paging a').each((index, link) => {
			const uri = $(link).attr('href')

			if (uri && !~this.topics.indexOf(uri)) {
				this.topics.push(uri)
			}
		})
	}

	fetchPosts($) {
		$('.post').each((index, item) => {
			const permalink = $(item).find('.posthead .post-link a.permalink')
			const avatarImg = $(item).find('.postbody .post-author .author-ident .useravatar img')
			const link = $(permalink).attr('href')
			const id = parseInt(link.split('pid=')[1].split('#')[0])
			const content = $(item).find('.postbody .post-entry .entry-content')
			const message = {
				id,
				index: this.postIndex++,
				author: $(item).find('.posthead .post-byline strong').text(),
				date: parseDate($(permalink).text().trim()),
				link,
				avatar: !!avatarImg.length && avatarImg.attr('src') || '',
				title: $(item).find('.postbody .post-entry .entry-title').text(),
				html: $(content).html(),
				text: $(content).text()
			}

			if (id && !~this.messages.indexOf(id)) {
				this.messages.push(id)
				this.onSendMessage(message)
			}
		})
	}
}

module.exports = Crawler