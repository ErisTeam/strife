// SolidJS
import { Accessor, Context, JSX, Setter, createContext, createSignal, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
// API
import { Locale } from './Translation';

import { Tab } from './types';
import { SettingsCategory, SettingsEntry } from './Components/Settings/SettingsTypes';
import { defaultSettings } from '@api/Settings';
import { Relationship } from './types/User';
import { Guild } from './types/Guild';

const [basicUserData, setBasicUserData] = createSignal<any>(null); //display name, avatar, login status

const [userGuilds, setUserGuilds] = createStore<Guild[]>([]);

const [currentState, setCurrentState] = createSignal<'text' | 'voice' | null>('voice');
const [relationships, setRelationships] = createStore<Relationship[]>([]);
const [channelsSize, setChannelsSize] = createSignal<number>(250);

// value is the index of the tab in the tabs array
const [tabsOrder, setTabsOrder] = createSignal<number[]>([]);
const [tabs, setTabs] = createStore<Tab[]>([]);
const [locale, setLocale] = createSignal<Locale>('en_US');

const [currentTabIdx, setCurrentTabIdx] = createSignal<number>(-1);

const [currentGuild, setCurrentGuild] = createSignal<Guild | null | 'friends'>(null); //Used to display correct channelsset to null to hide
const localeJsFormat = () => {
	const locale = useAppState().locale();

	return locale.replace('_', '-');
};

const [settingsCategories, setSettingsCategories] = createStore<SettingsCategory[]>(defaultSettings.categories);
const [settingsEntries, setSettingsEntries] = createStore<SettingsEntry[]>([]);

const ContextValue = {
	userGuilds,
	setUserGuilds,

	relationships,
	setRelationships,

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

	settings: {
		categories: settingsCategories,
		setCategories: setSettingsCategories,
		entries: settingsEntries,
		setEntries: setSettingsEntries,
	},
};
const AppState = createContext(ContextValue);

export function AppStateProvider(props: { userId: string; children: JSX.Element[] | JSX.Element }) {
	const [userId, setUserId] = createSignal(props.userId);
	console.log('UserId', userId(), props);
	return (
		<AppState.Provider
			value={
				{
					...ContextValue,
					userId,
					setUserId,
				} as any
			}
		>
			{props.children}
		</AppState.Provider>
	);
}

export function useAppState() {
	return useContext(AppState) as typeof ContextValue & { userId: Accessor<string>; setUserId: Setter<string> };
}
