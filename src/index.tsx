import { render } from 'solid-js/web';
import {
	Routes,
	Route,
	Router,
	hashIntegration,
	Outlet,
	A,
	Navigate,
} from '@solidjs/router';
import { Component, createSignal, onMount } from 'solid-js';
import Application from './Routes/App/Application';
import Tests from './Tests';
import './style.css';
import Main from './Routes/Login/Main';
import MFA from './Routes/Login/MFA';
import GuildList from './Components/GuildList/GuildList';
import Prev from './Prev';
import { LoginStateProvider } from './Routes/Login/LoginState';
import { AppStateProvider } from './AppState';
import { useAppState } from './AppState';
import ApplicationWrapper from './Components/ApplicationWrapper/ApplicationWrapper';

const App: Component = () => {
	const AppState: any = useAppState();
	onMount(async () => {
		AppState.setUserToken(localStorage.getItem('userToken'));
	});
	return (
		<AppStateProvider>
			<Router source={hashIntegration()}>
				<Routes>
					<Route path="/" component={Prev}></Route>

					<Route path="/test" component={Tests} />

					<Route
						path={'/gamitofurras'}
						element={
							<div>
								<h1>gami to furras</h1>
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
				</Routes>
			</Router>
		</AppStateProvider>
	);
};

render(() => <App />, document.getElementById('root') as HTMLElement);
