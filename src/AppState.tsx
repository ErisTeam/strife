// SolidJS
import { createSignal, createContext, useContext } from 'solid-js';

// API
import { GuildType, Relationship, ChannelType } from './discord';

const [userID, setUserID] = createSignal('');

const [userGuilds, setUserGuilds] = createSignal<GuildType[]>([]);
const [currentGuildChannels, setCurrentGuildChannels] = createSignal<
	ChannelType[]
>([]);
const [relationships, setRelationshpis] = createSignal<Relationship[]>([]);

const AppState = createContext({
	userGuilds,
	setUserGuilds,
	currentGuildChannels,
	setCurrentGuildChannels,
	relationships,
	setRelationshpis,
	userID,
	setUserID,
});

export function AppStateProvider(props: any) {
	return (
		<AppState.Provider
			value={{
				userGuilds,
				setUserGuilds,
				currentGuildChannels,
				setCurrentGuildChannels,
				relationships,
				setRelationshpis,
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
