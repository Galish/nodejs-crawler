export default class Board extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			messages: []
		}
	}

	componentWillReceiveProps({update}) {
		if (update) {
			console.log({update});
			if (update.message) {
				this.setState({
					messages: [
						...this.state.messages,
						{
							text: update.message,
							timestamp: update.timestamp,
							receivedAt: (+new Date)
						}
					]
				})
			}
		}
	}

	render() {
		return (
			<div>
				{this.state.messages.map(({text, receivedAt}, i) =>
					<div className="message"
						key={i}>
						{text}
						<small>{moment(receivedAt).format('LLL')}</small>
					</div>
				)}
			</div>
		)
	}
}