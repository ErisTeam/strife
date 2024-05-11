import { invoke } from '@tauri-apps/api';
import { Component, Show, createEffect, createResource, createSignal } from 'solid-js';
import Loading from './Components/Loading/Loading';
import { AppState } from './types';
import Dev from './Components/Dev/Dev';
import { useAppState } from './AppState';
import { activateUser } from './API/User';

const TIME_UNTIL_REFETCH = 10;

type Props = {
	state: AppState;
	force?: boolean;
	component: Component;
};

const StateSetter = (props: Props) => {
	const AppState = useAppState();
	const [error, setError] = createSignal<Error | null>(null);

	const [a, { refetch }] = createResource(async () => {
		const res = await invoke('set_state', { newState: props.state, force: props.force });
		console.log('res', res);
		if (props.state === 'Application') {
			try {
				await activateUser(AppState.userId());
			} catch (err) {
				setError(err as Error);
				startTimer(() => {
					refetch();
				});
			}
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
		setTimeLeft(TIME_UNTIL_REFETCH);
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
				<h1>changeState response {a() as string}</h1>
			</Dev>
			<Show
				when={!a.loading && !a.error && error() == null}
				fallback={
					<Loading
						message={
							error() && (
								<>
									<h3>{error().toString()}</h3>
									{/* TODO: FIX */}
									{/* <h3>{t.error({ time: timeLeft() })}</h3> */}
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
export default StateSetter;
