import { render } from 'solid-js/web';
import {
	Routes,
	Route,
	Router,
	hashIntegration,
	Outlet,
} from '@solidjs/router';
import { Component, createSignal } from 'solid-js';
import Application from './Routes/App/Application';
import Tests from './Tests';
import './style.css';
import Main from './Routes/Login/Main';
import MFA from './Routes/Login/MFA';
import GuildList from './Components/ServerList/GuildList';
import Prev from './Prev';
import { LoginStateProvider } from './Routes/Login/LoginState';
import { AppStateProvider } from './AppState';

const App: Component = () => {
	return (
		<AppStateProvider>
			<Router source={hashIntegration()}>
				<div>test</div>

				<Routes>
					<Route path="/" component={(<Prev />) as Component} />
					<Route path="/test" component={(<Tests />) as Component} />

					<Route
						path="/app"
						element={
							<>
								<GuildList /> <Outlet />
							</>
						}
					>
						<Route path="/" component={(<Application />) as Component} />
					</Route>

					<Route path="/login">
						<LoginStateProvider>
							<Route path="/" component={(<Main />) as Component} />
							<Route path="/mfa" component={(<MFA />) as Component} />
						</LoginStateProvider>
					</Route>
				</Routes>
			</Router>
		</AppStateProvider>
	);
};

render(() => <App />, document.getElementById('root') as HTMLElement);
