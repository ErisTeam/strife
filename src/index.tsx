// SolidJS
import { render } from 'solid-js/web';
import { Routes, Route, Router, Link } from '@solidjs/router';
import { Component, createResource, DEV, Match, onMount, Show, Switch } from 'solid-js';
import { useTrans, TransProvider } from './Translation';

// API
import { AppStateProvider, useAppState } from './AppState';

// Components
import ApplicationWrapper from './Components/ApplicationWrapper/ApplicationWrapper';
import Application from './Routes/App/Application';
import Prev from './Prev';
import Login from './Routes/Login/Login';
import Main from './Routes/Main/Main';
import Loading from './Routes/Loading/Loading';

// Style
import './style.css';

import Redirect from './Redirect';
import API from './API';

const App: Component = () => {
	const AppState: any = useAppState();
	const [id] = createResource(async () => {
		let id: string = await invoke('get_last_user', {});
		console.log(id);
		AppState.setUserID(id);
		return id;
	});

	invoke('close_splashscreen');

	console.log(DEV);

	return (
		<Router>
			<TransProvider>
				<Show fallback={<h1>USE TAURI</h1>} when={!!window.__TAURI_IPC__}>
					<AppStateProvider>
						<Dev>
							<div class="dev">
								<Anchor state="LoginScreen" href="/">
									Prev
								</Anchor>
							</div>
						</Dev>

						<Routes>
							{/* <Redirect /> */}
							<Route path="/dev">
								<Route path="/translationtest" component={TranslationTest}></Route>
							</Route>

							<Route path="/" component={Prev}></Route>

							<Route path="/messagetest" component={MessageTest} />

							<Route path={'/loadingtest'} component={Loading} />

							<Route path={'/login'} component={Login}></Route>

							<Route path={'/main'} component={Main}></Route>

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
			</TransProvider>
		</Router>
	);
};

import { attachDevtoolsOverlay } from '@solid-devtools/overlay';
import MessageTest from './Routes/Messages/MessageTest';
import { invoke } from '@tauri-apps/api';
import Error from './Routes/Error/Error';
import Anchor from './Components/Anchor/Anchor';
import Dev from './Dev';
import TranslationTest from './Routes/Dev/TranslationTest';

attachDevtoolsOverlay();

render(() => <App />, document.getElementById('root') as HTMLElement);
