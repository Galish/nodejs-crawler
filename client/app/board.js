export default class Board extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			messages: []
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

	render() {
		return (
			<div>
				{this.state.messages.map(({text, title, receivedAt}, i) =>
					<div className="message"
						key={i}>
						<big>{title}</big>
						{text}
						<small>{moment(receivedAt).format('LLL')}</small>
					</div>
				)}
			</div>
		)
	}
}