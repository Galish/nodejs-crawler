import Board from './board'
import Form from './form'
import WSController from './wscontroller'

class Content extends React.PureComponent {
	render() {
		return (
			<div>
				<Form {...this.props} />
				<Board {...this.props} />
			</div>
		)
	}
}

class App extends React.PureComponent {
	render() {
		return (
			<div>
				<WSController url="ws://localhost:8080/">
					<Content />
				</WSController>
			</div>
		)
	}
}

ReactDOM.render(
	<App />,
	document.getElementById('app')
)