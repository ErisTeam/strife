// SolidJS
import { JSX, createContext, createSignal, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
// API
import { Locale } from './Translation';
import { Guild, Relationship } from './discord';
import { Tab } from './types';

const userId = '';
const [basicUserData, setBasicUserData] = createSignal<any>(null); //display name, avatar, login status

const [userGuilds, setUserGuilds] = createStore<Guild[]>([]);

const [currentState, setCurrentState] = createSignal<'text' | 'voice' | null>('voice');
const [relationships, setRelationships] = createStore<Relationship[]>([]);
const [channelsSize, setChannelsSize] = createSignal<number>(250);

const [tabsOrder, setTabsOrder] = createSignal<number[]>([]);
const [tabs, setTabs] = createStore<Tab[]>([]);
const [locale, setLocale] = createSignal<Locale>('en_US');

const [currentTabIdx, setCurrentTabIdx] = createSignal<number>(-1); //TODO: CHANGE TO USE index

const [currentGuild, setCurrentGuild] = createSignal<Guild | null | 'friends'>(null); //Used to display correct channels after being decoupled set to null to hide
const localeJsFormat = () => {
	const locale = useAppState().locale();

	return locale.replace('_', '-');
};
const ContextValue = {
	userGuilds,
	setUserGuilds,

	relationships,
	setRelationships,
	userId,

	tabs,
	setTabs,
	tabsOrder,
	setTabsOrder,
	locale,
	setLocale,
	currentTabIndex: currentTabIdx,
	setCurrentTabIndex: setCurrentTabIdx,
	localeJsFormat,

	currentGuild,
	setCurrentGuild,
	currentState,
	setCurrentState,
	channelsSize,
	setChannelsSize,
};
const AppState = createContext(ContextValue);

export function AppStateProvider({ userId, children }: { userId: string; children: JSX.Element[] | JSX.Element }) {
	ContextValue.userId = userId;
	return <AppState.Provider value={ContextValue}>{children}</AppState.Provider>;
}

export function useAppState() {
	return useContext(AppState);
}
