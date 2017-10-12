import config from '../../config'
import Content from './content'
import WSController from './wscontroller'

export default class App extends React.PureComponent {
	render() {
		return (
			<div>
				<WSController url={`ws://localhost:${config.websocketsPort}/`}>
					<Content />
				</WSController>
			</div>
		)
	}
}