export default class Form extends React.PureComponent {
	constructor(props) {
		super(props)

		this.state = {
			input: ''
		}
	}

	onClick = () => {
		this.props.onSend({message: this.state.input})
		this.setState({input: ''})
	}

	onTextInput = (e) => {
		this.setState({input: e.target.value})
	}

	render() {
		return (
			<div>
				<textarea value={this.state.input}
					onChange={this.onTextInput} />

				<button onClick={this.onClick}>
					Submit
				</button>
			</div>
		)
	}
}