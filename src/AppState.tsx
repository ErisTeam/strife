// SolidJS
import { createSignal, createContext, useContext, Accessor } from 'solid-js';
import { createStore } from 'solid-js/store';
// API
import { Guild, Relationship } from './discord';
import { Tab } from './types';
import { useTrans } from './Translation';

const [userID, setUserID] = createSignal<string | null>(null);

const [userGuilds, setUserGuilds] = createSignal<Guild[]>([]);
const [relationships, setRelationships] = createSignal<Relationship[]>([]);
const [tabs, setTabs] = createStore<Tab[]>([]);
const [currentGuild, setCurrentGuild] = createSignal<Guild | null>(null); //Used to display correct channels after being decoupled set to null to hide
const [t] = useTrans();

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
	t,
});

export function AppStateProvider({ children }: { children: Node }) {
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
				t,
			}}
		>
			{children}
		</AppState.Provider>
	);
}

export function useAppState() {
	return useContext(AppState);
}
