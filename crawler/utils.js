function parseDate(dateString) {
	const today = new Date()
	const d = dateString.split(' ')

	const time = d[1].split(':')
	const day = d[0].split('-').length
		? d[0].split('-')
		: [
			today.getFullYear(),
			today.getMonth() + 1,
			today.getDate()
		]

	const list = [
		...day,
		...time
	]

	return new Date(list[0], parseInt(list[1]) - 1, list[2], list[3], list[4], list[5]).getTime()
}

module.exports = {parseDate}