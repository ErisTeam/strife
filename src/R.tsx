import { Outlet, Route, RouteProps } from '@solidjs/router';
import { invoke } from '@tauri-apps/api';
import { Component, JSXElement, Show, Suspense, createResource } from 'solid-js';
import Loading from './Components/Loading/Loading';
import { AppState } from './types';

interface Props {
	state: AppState;
	force?: boolean;
	component: Component;
}
//TODO: change name
const R = (props: Props) => {
	let [a, b] = createResource(async () => {
		await invoke('set_state', { newState: props.state, force: props.force });
	});
	return (
		<Show when={!a.loading} fallback={<Loading />}>
			<props.component />
		</Show>
	);
};
export default R;
