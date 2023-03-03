// SolidJS
import { render } from 'solid-js/web';
import { Routes, Route, Router, Link } from '@solidjs/router';
import {
	Component,
	createResource,
	Match,
	onMount,
	Show,
	Switch,
} from 'solid-js';

// API
import { AppStateProvider, useAppState } from './AppState';

// Components
import ApplicationWrapper from './Components/ApplicationWrapper/ApplicationWrapper';
import Application from './Routes/App/Application';
import Prev from './Prev';
import Login from './Routes/Login/Login';

// Style
import './style.css';

const App: Component = () => {
	const AppState: any = useAppState();

	const [id] = createResource(async () => {
		let id: string = await invoke('get_last_user', {});
		console.log(id);
		AppState.setUserID(id);
		return id;
	});

	return (
		<Router>
			<Show fallback={<h1>Loading...</h1>} when={!id.loading}>
				<Show fallback={<h1>USE TAURI</h1>} when={!!window.__TAURI_IPC__}>
					<AppStateProvider>
						<Routes>
							<Route path="/" component={Prev}></Route>

							<Route path="/messagetest" component={MessageTest} />

							<Route path={'/login'} component={Login}></Route>

							<Route path="/app" component={ApplicationWrapper}>
								<Route path="/" component={Application} />
								<Route path="/:guildId" component={Application}>
									<Route path="/:channelId" component={Application} />
								</Route>
							</Route>
							<Route path="*" component={Error} />
						</Routes>
					</AppStateProvider>
				</Show>
			</Show>
		</Router>
	);
};

import { attachDevtoolsOverlay } from '@solid-devtools/overlay';
import MessageTest from './Routes/Messages/MessageTest';
import { invoke } from '@tauri-apps/api';
import Error from './Routes/Error/Error';

attachDevtoolsOverlay();

render(() => <App />, document.getElementById('root') as HTMLElement);
