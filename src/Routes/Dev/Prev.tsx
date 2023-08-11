/* eslint-disable @typescript-eslint/ban-ts-comment */
// SolidJS
import { createResource, createSignal, Show } from 'solid-js';
import { A } from '@solidjs/router';

// Tauri
import { invoke } from '@tauri-apps/api/tauri';
import { emit } from '@tauri-apps/api/event';

// API
import API from '../../API';
import { changeState } from '../../test';
import { useAppState } from '../../AppState';

// Style
import style from './prev.module.css';
import buttons from '../../Styles/Buttons.module.css';
import inputs from './Styles/Inputs.module.css';
import SplashText from '../../Components/Dev/SplashText';
import { AppState } from '../../types';
import { useTrans } from '../../Translation';
import Switch from '../../Components/Switch/Switch';

function Prev() {
	const [t, { setLocale }] = useTrans();

	const [a] = createResource(async () => {
		throw new Error('test');
	});

	console.log('Prev');

	const [image, setImage] = createSignal('');

	const [state, setState] = createSignal<AppState>('Dev');

	const AppState = useAppState();
	console.log('appState', AppState);

	return (
		<div class={style.container}>
			<h1>{AppState.userId}</h1>
			<div class={style.b}>
				<div>
					<h2>Links</h2>
					<A class={buttons.default} href="/login">
						Better Login
					</A>
					<A class={buttons.default} href="/app">
						Application
					</A>
					<A class={buttons.default} href="/messagetest">
						message test
					</A>
					<A class={buttons.default} href="/shugsgsrolfdghdflgddid">
						Error Page
					</A>
					<h2>Dev</h2>
					<A class={buttons.default} href="/dev/loadingtest">
						Loading Test
					</A>

					<A class={buttons.default} href="/dev/test">
						Context Menu Test
					</A>

					<A class={buttons.default} href="/dev/translationtest">
						Translation Test
					</A>
					<A class={buttons.default} href="/dev/guildtest">
						Guild Test
					</A>
				</div>
				<div>
					<h2>Buttons</h2>
					<button
						style={{ 'margin-top': '0.5rem' }}
						class={buttons.default}
						onClick={async () => {
							await changeState('Application');
						}}
					>
						change state to main
					</button>

					<SplashText text="REQUIRED">
						<button
							class={buttons.default + ' ' + style.fill}
							onClick={async (e) => {
								console.log(`activating user ${AppState.userId}`);
								const r = await invoke('activate_user', { userId: AppState.userId });
								console.log(r);
							}}
						>
							Activate User
						</button>
					</SplashText>
					<button
						class={buttons.default}
						onclick={() => {
							setImage('aa');
						}}
					>
						Error Test
					</button>
					<button
						class={buttons.default}
						onClick={async (e) => {
							await invoke('test', {});
						}}
					>
						Notification Test
					</button>
					<button
						class={buttons.default}
						onClick={async (e) => {
							await emit('testReconnecting', { user_id: AppState.userId });
						}}
					>
						Test Reconnecting (Broken)
					</button>
				</div>
				<div>
					<h2>Commands and Events Tests</h2>
					<button
						class={buttons.default}
						onclick={async (e) => {
							console.log(await API.getRelationships(AppState.userId));
						}}
					>
						Get Relationships
					</button>
					<button
						class={buttons.default}
						onclick={async (e) => {
							console.log(await API.updateGuilds());
						}}
					>
						Update Guilds
					</button>
					<button
						class={buttons.default}
						onclick={async () => {
							console.log(await invoke('get_users', {}));
						}}
					>
						Get Users
					</button>
					<div>
						<h2>States</h2>
						<select
							class={buttons.default}
							style={{ width: '100%' }}
							onchange={(e) => {
								setState(e.currentTarget.value as AppState);
							}}
						>
							<option value="Application">Main app</option>
							<option value="LoginScreen">Login</option>
							<option value="Dev">Dev</option>
							<option value="fdhkmffh">Error Test</option>
						</select>
						<button
							onclick={() => {
								changeState(state());
							}}
							class={buttons.default}
						>
							Change to Selected
						</button>
					</div>
					<div>
						<h2>Set locale</h2>
						<select
							class={buttons.default}
							style={{ width: '100%' }}
							onchange={(e) => {
								// @ts-ignore
								setLocale(e.currentTarget.value);
							}}
						>
							<option value="en_US">en_US</option>
							<option value="pl_PL">pl_PL</option>
						</select>
						<span>{t.hello({ name: 'Test' })}</span>
					</div>
				</div>
			</div>
			<Show when={image() == 'aa'}>
				{(() => {
					return <div>{a()}</div>;
				})()}
			</Show>
		</div>
	);
}

export default Prev;
