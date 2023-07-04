import { Outlet } from '@solidjs/router';
import { invoke } from '@tauri-apps/api';
import { JSX, Show, children, createResource } from 'solid-js';
import Loading from '../Loading/Loading';
import { AppState } from '../../types';
import R from '../../R';

interface Props {
	state: AppState;
	force?: boolean;
	children?: JSX.Element | JSX.Element[];
}
export default (props: Props) => {
	const [result, { mutate, refetch }] = createResource(async () => {
		const res = await invoke('set_state', { newState: props.state, force: props.force });
		console.log('changed state');
		return res;
	});
	const c = children(() => props.children);
	return <>{c()}</>;
};
