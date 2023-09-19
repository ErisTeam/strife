// SolidJS
import { attachDevtoolsOverlay } from '@solid-devtools/overlay';
import { Outlet, Route, Router, Routes } from '@solidjs/router';
import { invoke } from '@tauri-apps/api';
import { Component, DEV, Show, createResource } from 'solid-js';
import { render } from 'solid-js/web';
import { AppStateProvider } from './AppState';
import Application from './Components/Application/Application';
import Dev from './Components/Dev/Dev';
import Loading from './Components/Loading/Loading';
import WindowDecoration from './Components/WindowDecoration/WindowDecoration';
import R from './R';
import ContextMenuTest from './Routes/Dev/ContextMenu/ContextMenuTest';
import LoadingTest from './Routes/Dev/LoadingTest/LoadingTest';
import MessageTest from './Routes/Dev/MessageTest/MessageTest';
import Prev from './Routes/Dev/Prev';
import Error from './Routes/Error/Error';
import Login from './Routes/Login/Login';
import './style.css';

const App: Component = () => {
	const [id] = createResource(async () => {
		const users: { userId: string }[] = await invoke('get_users', {});
		console.log(users);
		if (users.length == 0) return null;
		await invoke('close_splashscreen');
		return users[0].userId;
	});

	function changeZoom(e: KeyboardEvent) {
		const root = document.querySelector(':root');
		const fontSize = window.getComputedStyle(root, null).getPropertyValue('font-size');
		if (e.ctrlKey && e.key === '=') {
			let newFontSize = parseInt(fontSize) + 1;
			if (newFontSize > 20) {
				newFontSize = 20;
			}
			root.style.setProperty('font-size', newFontSize + 'px');
		}
		if (e.ctrlKey && e.key === '-') {
			let newFontSize = parseInt(fontSize) - 1;
			if (newFontSize < 8) {
				newFontSize = 8;
			}
			root.style.setProperty('font-size', newFontSize + 'px');
		}
	}

	document.addEventListener('keydown', changeZoom);

	console.log(DEV);

	return (
		<Router>
			<WindowDecoration />

			<Show fallback={<h1>USE TAURI</h1>} when={!!window.__TAURI_IPC__}>
				<Show when={!id.loading} fallback={<Loading />}>
					<AppStateProvider userId={id()}>
						<Dev />

						<Routes>
							{/* <Redirect /> */}
							<Route path="/dev" element={<R state={'Dev'} component={Outlet} />}>
								<Route path="/loadingtest" component={LoadingTest} />
							</Route>

							<Route path="/login" element={<R state={'LoginScreen'} force={true} component={Login} />} />

							<Route path="/" element={<R state={'Dev'} force={true} component={Prev} />}></Route>

							<Route path="/dev" element={<R state={'Dev'} force={true} component={Outlet} />}>
								<Route path="/contextmenutest" component={ContextMenuTest} />
								<Route path="/messagetest" component={MessageTest} />
								<Route path="/loadingtest" component={LoadingTest} />
								<Route path="/login" component={Prev} />
								<Route path="/test" component={ContextMenuTest} />
							</Route>

							<Route path="/login" component={Login} />

							<Route path="/app" element={<R state={'Application'} force={true} component={Application} />}></Route>
							<Route path="*" component={Error} />
						</Routes>
					</AppStateProvider>
				</Show>
			</Show>
		</Router>
	);
};

attachDevtoolsOverlay();

render(() => <App />, document.getElementById('root'));
