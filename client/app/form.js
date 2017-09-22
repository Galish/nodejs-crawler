export default class Form extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			input: ''
		}
	}

	onClick = () => {
		const {input} = this.state

		if (!input) return

		this.props.onSend({
			search: input.toLowerCase()
		})
		this.setState({input: ''})
	}

	onTextInput = (e) => {
		this.setState({input: e.target.value})
	}

	render() {
		return (
			<div>
				<input type="text"
					value={this.state.input}
					onChange={this.onTextInput} />

				<button onClick={this.onClick}>
					Submit
				</button>
			</div>
		)
	}
}