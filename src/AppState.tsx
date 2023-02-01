import { createSignal, createContext, useContext } from 'solid-js';
import { GuildType } from './discord';
const [userToken, setUserToken] = createSignal('');

const [userGuilds, setUserGuilds] = createSignal([] as GuildType[]);
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
