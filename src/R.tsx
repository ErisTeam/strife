import { Outlet, Route, RouteProps } from '@solidjs/router';
import { invoke } from '@tauri-apps/api';
import {
	Component,
	JSXElement,
	Show,
	Suspense,
	catchError,
	createEffect,
	createResource,
	createSignal,
} from 'solid-js';
import Loading from './Components/Loading/Loading';
import { AppState } from './types';
import { useTrans } from './Translation';

interface Props {
	state: AppState;
	force?: boolean;
	component: Component;
}

const TimeLeft = 10;
//TODO: change name
const R = (props: Props) => {
	const [t] = useTrans();

	const [a, { mutate, refetch }] = createResource(async () => {
		console.log('aaaaaaaaa');
		const res = await invoke('set_state', { newState: props.state, force: props.force });
		console.log('bbbbbbbbbb');
		console.log('res', res);
		return res;
	});
	const [timeLeft, setTimeLeft] = createSignal(0);
	createEffect(() => {
		if (a.error) {
			console.log(a.error);
			setTimeLeft(TimeLeft);
			const r = setInterval(() => {
				if (timeLeft() == 0) {
					refetch();
					clearInterval(r);
					return;
				}
				setTimeLeft((v) => v - 1);
			}, 1000);
		}
	}, a);

	return (
		<Show
			when={!a.loading && !a.error}
			fallback={
				<Loading
					message={
						a.error && (
							<>
								<h3>{a.error.toString()}</h3>
								<h3>{t.error({ time: timeLeft() })}</h3>
							</>
						)
					}
				/>
			}
		>
			<props.component />
		</Show>
	);
};
export default R;
