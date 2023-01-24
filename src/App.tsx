import { render } from 'solid-js/web';
import { Routes, Route, Router } from '@solidjs/router';
import { Component, createSignal } from 'solid-js';

import './style.css';
import Main from './Routes/Login/Main';
import MFA from './Routes/Login/MFA';
import Prev from './Prev';
import { LoginStateProvider } from './Routes/Login/LoginState';

const App: Component = () => {
	const [ticket, setTicket] = createSignal('');
	const [token, setToken] = createSignal('');
	return (
		<>
			<div>test</div>

			<Routes>
				<Route path="/" component={(<Prev />) as Component} />
				<Route path="/app" />

				<Route path="/login">
					<LoginStateProvider>
						<Route path="/" component={(<Main />) as Component} />
						<Route path="/mfa" component={(<MFA />) as Component} />
					</LoginStateProvider>
				</Route>
			</Routes>
		</>
	);
};

export default App;
