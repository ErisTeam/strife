import { Outlet } from '@solidjs/router';
import { invoke } from '@tauri-apps/api';
import { Show, createResource } from 'solid-js';
import Loading from '../Loading/Loading';
import { AppState } from '../../types';

interface Props {
	state: AppState;
	force?: boolean;
}
export default (props: Props) => {
	const [r, _] = createResource(async () => {
		await invoke('set_state', { newState: props.state, force: props.force });
	});
	return (
		<Show when={!r.loading} fallback={<Loading />}>
			<Outlet />
		</Show>
	);
};
