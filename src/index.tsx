// SolidJS
import { render } from 'solid-js/web';
import { Routes, Route, Router, Link, A } from '@solidjs/router';
import { Component, createResource, DEV, Match, onMount, Show, Switch } from 'solid-js';
import { useTrans, TransProvider } from './Translation';
import { attachDevtoolsOverlay } from '@solid-devtools/overlay';

// API
import { AppStateProvider, useAppState } from './AppState';

// Components
import ApplicationWrapper from './Components/ApplicationWrapper/ApplicationWrapper';
import Application from './Routes/App/Application';
import Prev from './Prev';
import Login from './Routes/Login/Login';
import Main from './Routes/Main/Main';
import LoadingTest from './Routes/Dev/LoadingTest/LoadingTest';
import Error from './Routes/Error/Error';
import Anchor from './Components/Anchor/Anchor';
import Dev from './Components/Dev/Dev';
import TranslationTest from './Routes/Dev/Translation/TranslationTest';
import MessageTest from './Routes/Messages/MessageTest';

// Style
import './style.css';

import Redirect from './Redirect';
import API from './API';

import { invoke } from '@tauri-apps/api';
import { useRoute } from '@solidjs/router/dist/routing';
import R from './R';
import ChangeState from './Components/ChangeState/ChangeState';
import DevTools from './Components/DevTools/DevTools';

const App: Component = () => {
	const AppState: any = useAppState();
	const [id] = createResource(async () => {
		const id: string = await invoke('get_last_user', {});
		console.log(id);
		AppState.setUserID(id);
		invoke('close_splashscreen');
		return id;
	});

	console.log(DEV);

	return (
		<Router>
			<TransProvider>
				<Show fallback={<h1>USE TAURI</h1>} when={!!window.__TAURI_IPC__}>
					<Show when={!id.loading}>
						<AppStateProvider>
							<Dev>
								<DevTools />
							</Dev>

							<Routes>
								{/* <Redirect /> */}
								<Route path="/dev" element={<ChangeState state={'Dev'} />}>
									<Route path="/translationtest" component={TranslationTest} />
									<Route path="/loadingtest" component={LoadingTest} />
								</Route>

								<Route path="/login" element={<R state={'LoginScreen'} force={true} component={Login} />} />

								<Route path="/" element={<R state={'LoginScreen'} force={true} component={Prev} />}></Route>

								<Route path="/dev" element={<ChangeState state={'Application'} />}>
									<Route path="/main" component={Main} />
								</Route>
								<Route path="/messagetest" component={MessageTest} />

								<Route path="/login" component={Login} />

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
			</TransProvider>
		</Router>
	);
};

attachDevtoolsOverlay();

render(() => <App />, document.getElementById('root') as HTMLElement);
