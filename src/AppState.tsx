// SolidJS
import { createSignal, createContext, useContext } from 'solid-js';

// API
import { Relationship, Tab, GuildType, ChannelType } from './types';

const [userID, setUserID] = createSignal<string | null>(null);

const [userGuilds, setUserGuilds] = createSignal<GuildType[]>([]);
const [relationships, setRelationshpis] = createSignal<Relationship[]>([]);
const [tabs, setTabs] = createSignal<Tab[]>([]);
const [currentGuild, setCurrentGuild] = createSignal<GuildType | null>(null); //Used to display correct channels after being decoupled set to null to hide

const AppState = createContext({
	userGuilds,
	setUserGuilds,

	relationships,
	setRelationshpis,
	userID,
	setUserID,
	tabs,
	setTabs,
	currentGuild,
	setCurrentGuild,
});

export function AppStateProvider(props: any) {
	return (
		<AppState.Provider
			value={{
				userGuilds,
				setUserGuilds,

				relationships,
				setRelationshpis,
				userID,
				setUserID,
				tabs,
				setTabs,
				currentGuild,
				setCurrentGuild,
			}}
		>
			{props.children}
		</AppState.Provider>
	);
}

export function useAppState() {
	return useContext(AppState);
}
