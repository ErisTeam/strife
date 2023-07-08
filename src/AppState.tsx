// SolidJS
import { createSignal, createContext, useContext, Accessor, JSX } from 'solid-js';
import { createStore } from 'solid-js/store';
// API
import { Guild, Relationship } from './discord';
import { ContextMenuData, Tab } from './types';
import { useTrans } from './Translation';

const [userId, setUserId] = createSignal<string | null>(null);

const [userGuilds, setUserGuilds] = createStore<Guild[]>([]);
const [contextMenuData, setContextMenuData] = createStore<ContextMenuData>({
	type: 'channel',
	x: 0,
	y: 0,
	isShow: false,
});
const [relationships, setRelationships] = createStore<Relationship[]>([]);
const [tabs, setTabs] = createStore<Tab[]>([]);
const [currentGuild, setCurrentGuild] = createSignal<Guild | null | 'friends'>(null); //Used to display correct channels after being decoupled set to null to hide
const [t, a] = useTrans();

const AppState = createContext({
	userGuilds,
	setUserGuilds,
	contextMenuData,
	setContextMenuData,

	relationships,
	setRelationships,
	userId,
	setUserID: setUserId,
	tabs,
	setTabs,
	currentGuild,
	setCurrentGuild,
	t,
	translation: a,
});

export function AppStateProvider({ children }: { children: JSX.Element[] | JSX.Element }) {
	//@ts-ignore
	return <AppState.Provider>{children}</AppState.Provider>;
}

export function useAppState() {
	return useContext(AppState);
}
export const TEST = userId;
