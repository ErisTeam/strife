/* eslint-disable @typescript-eslint/ban-ts-comment */
// SolidJS
import { createSignal, createContext, useContext, JSX } from 'solid-js';
import { createStore } from 'solid-js/store';
// API
import { Guild, Relationship } from './discord';
import { ContextMenuData, Tab } from './types';

const [userId, setUserId] = createSignal<string | null>(null);
const [basicUserData, setBasicUserData] = createSignal<any>(null); //display name, avatar, login status

const [userGuilds, setUserGuilds] = createStore<Guild[]>([]);
const [contextMenuData, setContextMenuData] = createStore<ContextMenuData>({
	type: 'channel',
	x: 0,
	y: 0,
	isShow: false,
});
const [currentState, setCurrentState] = createSignal<'text' | 'voice' | null>('voice');
const [relationships, setRelationships] = createStore<Relationship[]>([]);
const [tabs, setTabs] = createStore<Tab[]>([]);
const [currentGuild, setCurrentGuild] = createSignal<Guild | null | 'friends'>(null); //Used to display correct channels after being decoupled set to null to hide

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
	currentState,
	setCurrentState,
});

export function AppStateProvider({ children }: { children: JSX.Element[] | JSX.Element }) {
	//@ts-ignore
	return <AppState.Provider>{children}</AppState.Provider>;
}

export function useAppState() {
	return useContext(AppState);
}
export const TEST = userId;
