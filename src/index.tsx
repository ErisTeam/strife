// SolidJS
import { render } from 'solid-js/web';
import { Routes, Route, Router, Link } from '@solidjs/router';
import { Component, Match, onMount, Switch } from 'solid-js';

// API
import { LoginStateProvider } from './Routes/Login/LoginState';
import { AppStateProvider, useAppState } from './AppState';

// Components
import ApplicationWrapper from './Components/ApplicationWrapper/ApplicationWrapper';
import Application from './Routes/App/Application';
import Tests from './Tests';
import Main from './Routes/Login/Main';
import MFA from './Routes/Login/MFA';
import Prev from './Prev';
import LoginPage from './LoginPage';

// Style
import './style.css';

const App: Component = () => {
	const AppState: any = useAppState();

	onMount(async () => {
		let id: string = await invoke('get_last_user', {});
		AppState.setUserID(id);
	});

	return (
		<Router>
			<Switch fallback={<h1>USE TAURI</h1>}>
				<Match when={!!window.__TAURI_IPC__}>
					<AppStateProvider>
						<Routes>
							<Route path="/" component={Prev}></Route>

							<Route path="/messagetest" component={MessageTest} />

							<Route path="/test" component={Tests} />

							<Route path={'/loginpage'} component={LoginPage}></Route>

							<Route
								path={'/gamitofurras'}
								element={
									<div>
										<h1>gami to furras</h1>
										<Link href="/">t</Link>
									</div>
								}
							></Route>

							<Route path="/app" component={ApplicationWrapper}>
								<Route path="/" component={Application} />
								<Route path="/:guildId" component={Application}>
									<Route path="/:channelId" component={Application} />
								</Route>
							</Route>

							<Route path="/login">
								<LoginStateProvider>
									<Route path="/" component={Main} />
									<Route path="/mfa" component={MFA} />
								</LoginStateProvider>
							</Route>
							<Route path="*" component={Err} />
						</Routes>
					</AppStateProvider>
				</Match>
			</Switch>
		</Router>
	);
};

import { attachDevtoolsOverlay } from '@solid-devtools/overlay';
import MessageTest from './MessageTest';
import { invoke } from '@tauri-apps/api';
import Err from './Err';

attachDevtoolsOverlay();

render(() => <App />, document.getElementById('root') as HTMLElement);
