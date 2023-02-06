import { createSignal, createContext, useContext } from 'solid-js';
import { GuildType } from './discord';
import { ChannelType } from './discord';
const [userToken, setUserToken] = createSignal('');
const [userID, setUserID] = createSignal('');

const [userGuilds, setUserGuilds] = createSignal([] as GuildType[]);
const [currentGuildChannels, setCurrentGuildChannels] = createSignal(
	[] as ChannelType[]
);
const AppState = createContext({
	userToken,
	setUserToken,
	userGuilds,
	setUserGuilds,
	currentGuildChannels,
	setCurrentGuildChannels,
	userID,
	setUserID,
});

export function AppStateProvider(props: any) {
	return (
		<AppState.Provider
			value={{
				userToken,
				setUserToken,
				userGuilds,
				setUserGuilds,
				currentGuildChannels,
				setCurrentGuildChannels,
				userID,
				setUserID,
			}}
		>
			{props.children}
		</AppState.Provider>
	);
}

export function useAppState() {
	return useContext(AppState);
}
