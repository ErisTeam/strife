// SolidJS
import { createResource, createSignal, Match, onCleanup, onMount, Show } from 'solid-js';
import { A, Link, useBeforeLeave } from '@solidjs/router';
import HCaptcha from 'solid-hcaptcha';

// Tauri
import { invoke } from '@tauri-apps/api/tauri';
import { emit } from '@tauri-apps/api/event';

// API
import API from './API';
import { changeState, useTaurListener, useTaurListenerOld } from './test';
import { useAppState } from './AppState';
import qrcode from 'qrcode';

// Style
import style from './prev.module.css';
import buttons from './Styles/Buttons.module.css';
import inputs from './Styles/Inputs.module.css';
import { info } from 'tauri-plugin-log-api';
import SplashText from './Components/Dev/SplashText';

// TODO: Clean up this mess, also, Gami to Furras
function Prev() {
	const [a] = createResource(async () => {
		throw new Error('test');
	});

	console.log('Prev');

	const [image, setImage] = createSignal('');

	const AppState = useAppState();

	return (
		<div class={style.container}>
			<h1>{AppState.userId()}</h1>
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
					<A class={buttons.default} href="/dev/loadingtest">
						Loading Test
					</A>
					<SplashText text="Check It Out" settings={{ noWrap: true }}>
						<A class={buttons.default} href="/dev/test">
							Context Menu Test
						</A>
					</SplashText>
					<A class={buttons.default} href="/dev/translationtest">
						Translation Test
					</A>
					<A class={buttons.default} href="/dev/guildtest">
						Guild Test
					</A>
					<A class={buttons.default} href="/shugsgsrolfdghdflgddid">
						Error Page
					</A>
				</div>
				<div>
					<h2>Buttons</h2>
					<button
						class={buttons.default}
						onClick={async () => {
							changeState('Application');
						}}
					>
						change state to main
					</button>
					<SplashText text="REQUIRED (In future)">
						<button
							class={buttons.default + ' ' + style.fill}
							onClick={async (e) => {
								console.log(`activating user ${AppState.userId()}`);
								const r = await invoke('activate_user', { userId: AppState.userId() });
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
							await emit('testReconnecting', { user_id: AppState.userId() });
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
							console.log(AppState.userId());
							console.log(await API.getUserData(AppState.userId() as string));
						}}
					>
						Get User Data
					</button>
					<button
						class={buttons.default}
						onclick={async (e) => {
							console.log(await API.getRelationships(AppState.userId() as string));
						}}
					>
						Get Relationships
					</button>
					<button
						class={buttons.default}
						onclick={async (e) => {
							console.log(API.updateGuilds());
						}}
					>
						Update Guilds
					</button>
					<button
						class={buttons.default}
						onclick={async (e) => {
							console.log(await invoke('get_users', {}));
						}}
					>
						Get Users
					</button>
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
