// SolidJS
import { render } from 'solid-js/web';
import { Routes, Route, Router, Outlet } from '@solidjs/router';
import { Component, createResource, DEV, Show } from 'solid-js';
import { TransProvider } from './Translation';
import { attachDevtoolsOverlay } from '@solid-devtools/overlay';

// API
import { AppStateProvider, useAppState } from './AppState';

// Components
import ApplicationWrapper from './Components/ApplicationWrapper/ApplicationWrapper';
import Application from './Routes/App/Application';
import Prev from './Routes/Dev/Prev';
import Login from './Routes/Login/Login';
import LoadingTest from './Routes/Dev/LoadingTest/LoadingTest';
import Error from './Routes/Error/Error';
import Dev from './Components/Dev/Dev';
import TranslationTest from './Routes/Dev/Translation/TranslationTest';
import MessageTest from './Routes/Dev/MessageTest/MessageTest';

// Style
import './style.css';

import { invoke } from '@tauri-apps/api';
import R from './R';
import Loading from './Components/Loading/Loading';
import Test from './Routes/Dev/ContextMenu/ContextMenuTest';
import Channel from './Components/Messages/Chat';
import LayoutTest from './Routes/Dev/LayoutTest/LayoutTest';

const App: Component = () => {
	const AppState = useAppState();
	const [id] = createResource(async () => {
		const users: { userId: string }[] = await invoke('get_users', {});
		console.log(users);
		AppState.setUserID(users[0].userId);

		await invoke('close_splashscreen');
	});

	console.log(DEV);

	return (
		<Router>
			<TransProvider>
				<Show fallback={<h1>USE TAURI</h1>} when={!!window.__TAURI_IPC__}>
					<Show when={!id.loading} fallback={<Loading />}>
						<AppStateProvider>
							<Dev />

							<Routes>
								{/* <Redirect /> */}
								<Route path="/dev" element={<R state={'Dev'} component={Outlet} />}>
									<Route path="/translationtest" component={TranslationTest} />
									<Route path="/loadingtest" component={LoadingTest} />
								</Route>

								<Route path="/login" element={<R state={'LoginScreen'} force={true} component={Login} />} />

								<Route path="/" element={<R state={'Dev'} force={true} component={Prev} />}></Route>

								<Route path="/dev" element={<R state={'Dev'} force={true} component={Outlet} />}>
									<Route path="/test" component={Test} />
									<Route path="/messagetest" component={MessageTest} />
									<Route path="/loadingtest" component={LoadingTest} />
									<Route path="/login" component={Prev} />
								</Route>

								<Route path="/login" component={Login} />

								<Route path="/app" element={<R state={'Application'} force={true} component={ApplicationWrapper} />}>
									<Route path="/" component={Channel} />
									<Route path="/:guildId" component={Channel}>
										<Route path="/:channelId" component={Channel} />
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

render(() => <App />, document.getElementById('root'));
