/* eslint-disable @typescript-eslint/ban-ts-comment */
// SolidJS
import { createSignal, createContext, useContext, JSX } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
// API
import { Guild, Relationship } from './discord';
import { Tab } from './types';

const [userId, setUserId] = createSignal<string | null>(null);
const [basicUserData, setBasicUserData] = createSignal<any>(null); //display name, avatar, login status

const [userGuilds, setUserGuilds] = createStore<Guild[]>([]);

const [currentState, setCurrentState] = createSignal<'text' | 'voice' | null>('voice');
const [relationships, setRelationships] = createStore<Relationship[]>([]);

export type tabStoreType<T = {}> = Tab<T>;

const [tabs, setTabs] = createStore<tabStoreType<any>[]>([]);
const [currentTab, setCurrentTab] = createSignal<number>(-1);

const [currentGuild, setCurrentGuild] = createSignal<Guild | null | 'friends'>(null); //Used to display correct channels after being decoupled set to null to hide

const Tabs = {
	tabs,
	currentTab,

	setCurrentTab,
	removeTab: (index: number) => {
		setTabs(produce((tabs) => tabs.splice(index, 1)));
		if (index == currentTab()) {
			if (tabs.length > 0) {
				setCurrentTab(tabs.length - 1);
			} else {
				setCurrentTab(-1);
			}
		} else if (currentTab() > index) {
			setCurrentTab(currentTab() - 1);
		}
	},
	addTab: function <T>(tab: Tab<T>, setAsCurrent?: boolean) {
		console.log('adding tab', tab, tabs);
		setTabs(tabs.length, tab);
		if (setAsCurrent) {
			setCurrentTab(tabs.length - 1);
		}
	},
	replaceTab: function <T>(oldTab: number, newTab: Tab<T>) {
		console.log(tabs, oldTab, newTab);
		console.log(oldTab, newTab);

		const tab = newTab as tabStoreType<T>;

		const c = currentTab();

		this.removeTab(oldTab);
		setTabs(oldTab, tab);
		if (oldTab == c) {
			setCurrentTab(oldTab);
		}
	},
};
const contextValue = {
	userGuilds,
	setUserGuilds,

	relationships,
	setRelationships,
	userId,
	setUserID: setUserId,
	Tabs,
	setTabs,
	currentGuild,
	setCurrentGuild,
	currentState,
	setCurrentState,
};

const AppState = createContext(contextValue);

export function AppStateProvider({ children }: { children: JSX.Element[] | JSX.Element }) {
	//@ts-ignore
	return <AppState.Provider>{children}</AppState.Provider>;
}

export function useAppState() {
	return useContext(AppState);
}
