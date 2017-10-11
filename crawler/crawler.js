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
		this.topicIndex = 0
		this.postIndex = 0
	}

	run() {
		this.crawlForum()
			.then(forums => {
				console.log('> Crawling topics')
				return this.crawlForums(this.crawlForumPage, true)
			})
			.then(() =>
				this.crawlForums(this.crawlForumPage, false)
			)
			.then(() => {
				console.log('Forum length:', this.forums.length);
				console.log('> Crawling posts')

				return this.crawlTopics()
			})
			.then(() => {
				console.log('> Crawling done!!!')
				console.log('  topics:', this.topicIndex)
				console.log('  posts:', this.postIndex)
			})
			.catch((err) => {
				console.log('> Crawling error:', err)
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

	crawlForums(crawler, firstPage) {
		const queue = []

		this.forums.forEach(uri => {
			queue.push(
				crawler.call(this, uri, firstPage)
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

	crawlTopics() {
		const queue = []

		this.topics.forEach(uri => {
			queue.push(
				this.crawlTopic(uri)
			)
		})

		return Promise.all(queue)
	}

	crawlTopic(uri) {
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

						const onDone = (forums, topics) => {
							resolve()
							done()
						}

						this.parseTopicPage(err, res, onDone)
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

	parseTopicPage(err, res, done) {
		if (err) {
			console.log(err)
			return
		}

		this.fetchPosts(res.$)

		done(this.topics)
	}

	fetchForums($) {
		$('#brd-main .item-subject a').each((index, link) => {
			const uri = $(link).attr('href')

			if (uri && !~this.forums.indexOf(uri)) {
				this.forums.push(uri)
				this.topicIndex++
			}
		})
	}

	fetchTopics($) {
		$('.main-content.main-forum.forum-views .main-item').each((index, item) => {
			const uri = $(item).find('.item-subject a').attr('href')
			if (uri && !~this.topics.indexOf(uri)) {
				this.topics.push(uri)
			}
		})
	}

	fetchForumPages($) {
		$('.main-pagepost .paging a').each((index, link) => {
			const uri = $(link).attr('href')

			if (uri && !~this.forums.indexOf(uri)) {
				this.forums.push(uri)
				this.topicIndex++
			}
		})
	}

	fetchPosts($) {
		$('.post').each((index, item) => {
			const permalink = $(item).find('.posthead .post-link a.permalink')
			const avatarImg = $(item).find('.postbody .post-author .author-ident .useravatar img')
			const link = $(permalink).attr('href')
			const id = parseInt(link.split('pid=')[1].split('#')[0])

			const message = {
				id,
				index: this.postIndex++,
				author: $(item).find('.posthead .post-byline strong').text(),
				date: parseDate($(permalink).text().trim()),
				link,
				avatar: !!avatarImg.length && avatarImg.attr('src') || '',
				title: $(item).find('.postbody .post-entry .entry-title').text(),
				content: $(item).find('.postbody .post-entry .entry-content').text()
			}

			this.onSendMessage(message)
		})
	}
}

module.exports = Crawler