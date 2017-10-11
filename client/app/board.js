export default class Board extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			messages: null
		}
	}

	componentWillReceiveProps({update}) {
		if (update) {
			if (update.messages) {
				this.setState({
					messages: update.messages
				})
			}
		}
	}

	get messages() {
		return (this.state.messages || []).sort(this.sortByDate)
	}

	sortByDate(itemA, itemB) {
		return itemA.date === itemB.date
			? 0
			: (itemA.date > itemB.date
				? -1
				: 1
			)
	}

	renderNotification = () => {
		const {messages} = this.state

		if (messages && !messages.length) {
			return (
				<div>
					No messages found
				</div>
			)
		}

		return null
	}

	render() {
		return (
			<div>
				{this.renderNotification()}

				{this.messages.map((message, i) =>
					<div className="message"
						key={i}>
						<div className="message__date">
							{moment(message.date).format('LLL')}
						</div>
						<div className="message__title">
							{message.title}
						</div>
						<div className="message__content"
							dangerouslySetInnerHTML={{
								__html: message.content
							}} />
						<div className="message__author">
							{/*<img src={message.avatar} />*/}
							Author: <b>{message.author}</b>
						</div>

						<a className="message__link"
							href={message.link}
							target="_blank">
							{message.link}
						</a>
					</div>
				)}
			</div>
		)
	}
}