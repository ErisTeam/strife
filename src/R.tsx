import { invoke } from '@tauri-apps/api';
import { Component, ErrorBoundary, Show, Suspense, createEffect, createResource, createSignal } from 'solid-js';
import Loading from './Components/Loading/Loading';
import { AppState } from './types';
import { useTrans } from './Translation';
import Dev from './Components/Dev/Dev';
import API from './API';

interface Props {
	state: AppState;
	force?: boolean;
	component: Component;
}

const TimeLeft = 10;
//TODO: change name
const R = (props: Props) => {
	const [t] = useTrans();

	const [error, setError] = createSignal<Error | null>(null);

	const [a, { refetch }] = createResource(async () => {
		console.log('aaaaaaaaa');
		const res = await invoke('set_state', { newState: props.state, force: props.force });
		console.log('bbbbbbbbbb');
		console.log('res', res);
		if (props.state === 'Application') {
			await API.activateUser();
		}
		return res;
	});
	const [timeLeft, setTimeLeft] = createSignal(0);
	createEffect(() => {
		if (a.error) {
			console.log(a.error);
			setError(a.error);
			startTimer(() => {
				refetch();
			});
		}
	}, a);

	function startTimer(onEnd: () => void) {
		setTimeLeft(TimeLeft);
		const r = setInterval(() => {
			if (timeLeft() == 0) {
				onEnd();
				clearInterval(r);
				return;
			}
			setTimeLeft((v) => v - 1);
		}, 1000);
	}

	return (
		<>
			<Dev>
				<h1>changeState response {a() as any}</h1>
			</Dev>
			<Show
				when={!a.loading && !a.error && error() == null}
				fallback={
					<Loading
						message={
							error() && (
								<>
									<h3>{error().toString()}</h3>
									<h3>{t.error({ time: timeLeft() })}</h3>
								</>
							)
						}
					/>
				}
			>
				{/* <ErrorBoundary
					fallback={(error) => {
						setError(error);
						startTimer(() => {
							setError(null);
							if (props.force) {
								refetch();
							}
						});
						return <div>Gami to Furras. You shouldn't be seeing this message: {error.toString()}</div>;
					}}
				> */}
				<props.component />
				{/* </ErrorBoundary> */}
			</Show>
		</>
	);
};
export default R;
