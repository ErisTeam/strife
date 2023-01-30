import { createSignal, createContext, useContext } from 'solid-js';
import { Guild } from './discord';
const [userToken, setUserToken] = createSignal('');

const [userGuilds, setUserGuilds] = createSignal([] as Guild[]);
const AppState = createContext({
	userToken,
	setUserToken,
	userGuilds,
	setUserGuilds,
});

export function AppStateProvider(props: any) {
	return (
		<AppState.Provider
			value={{ userToken, setUserToken, userGuilds, setUserGuilds }}
		>
			{props.children}
		</AppState.Provider>
	);
}

export function useAppState() {
	return useContext(AppState);
}
