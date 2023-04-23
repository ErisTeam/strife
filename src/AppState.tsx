// SolidJS
import { createSignal, createContext, useContext } from 'solid-js';

// API
import { Relationship, Tab, Guild, Channel } from './types';

const [userID, setUserID] = createSignal<string | null>(null);

const [userGuilds, setUserGuilds] = createSignal<Guild[]>([]);
const [relationships, setRelationships] = createSignal<Relationship[]>([]);
const [tabs, setTabs] = createSignal<Tab[]>([]);
const [currentGuild, setCurrentGuild] = createSignal<Guild | null>(null); //Used to display correct channels after being decoupled set to null to hide

const AppState = createContext({
	userGuilds,
	setUserGuilds,

	relationships,
	setRelationships,
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
				setRelationships,
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
