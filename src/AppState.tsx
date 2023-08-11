/* eslint-disable @typescript-eslint/ban-ts-comment */
// SolidJS
import {
	createSignal,
	createContext,
	useContext,
	JSX,
	Component,
	createMemo,
	Context,
	Accessor,
	Setter,
	onMount,
} from 'solid-js';
import { SetStoreFunction, StoreSetter, createStore, produce } from 'solid-js/store';
// API
import { Guild, Relationship } from './discord';
import { Tab } from './types';

const userId = '';
const [basicUserData, setBasicUserData] = createSignal<any>(null); //display name, avatar, login status

const [userGuilds, setUserGuilds] = createStore<Guild[]>([]);

const [currentState, setCurrentState] = createSignal<'text' | 'voice' | null>('voice');
const [relationships, setRelationships] = createStore<Relationship[]>([]);
const [channelsSize, setChannelsSize] = createSignal<number>(250);

const [tabs, setTabs] = createStore<Tab[]>([]);
const [currentTabIdx, setCurrentTabIdx] = createSignal<number>(-1);

const [currentGuild, setCurrentGuild] = createSignal<Guild | null | 'friends'>(null); //Used to display correct channels after being decoupled set to null to hide

const ContextValue = {
	userGuilds,
	setUserGuilds,

	relationships,
	setRelationships,
	userId,

	tabs,
	setTabs,
	currentTabIdx,
	setCurrentTabIdx,

	currentGuild,
	setCurrentGuild,
	currentState,
	setCurrentState,
	channelsSize,
	setChannelsSize,
};
const AppState = createContext(ContextValue);

export function AppStateProvider({ userId, children }: { userId: string; children: JSX.Element[] | JSX.Element }) {
	//@ts-ignore
	ContextValue.userId = userId;

	return <AppState.Provider value={ContextValue}>{children}</AppState.Provider>;
}

export function useAppState() {
	return useContext(AppState);
}
