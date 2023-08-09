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
} from 'solid-js';
import { SetStoreFunction, StoreSetter, createStore, produce } from 'solid-js/store';
// API
import { Guild, Relationship } from './discord';
import { Tab } from './types';

export type tabStoreType<T = {}> = Tab<T> & { visible?: boolean; order?: number };

const AppState = createContext(null);

type ContextValue = {
	userId: Accessor<string | null>;
	setUserId: Setter<string | null>;

	// basicUserData: Accessor<any>;
	// setBasicUserData: Setter<any>;

	userGuilds: Guild[];
	setUserGuilds: SetStoreFunction<Guild[]>;
	currentGuild: Accessor<Guild | null | 'friends'>;
	setCurrentGuild: Setter<Guild | null | 'friends'>;

	currentState: Accessor<'text' | 'voice' | null>; //TODO: find a better way to do this
	setCurrentState: Setter<'text' | 'voice' | null>; //TODO: find a better way to do this

	relationships: Relationship[];
	setRelationships: SetStoreFunction<Relationship[]>;

	channelsSize: Accessor<number>; //TODO: find a better way to do this
	setChannelsSize: Setter<number>;

	Tabs: {
		tabs: tabStoreType<any>[];
		currentTab: Accessor<number>;

		orderedTabs: () => tabStoreType<any>[];

		changeOrder: (index1: number, index2: number) => void;

		setCurrentTab: (tab: number | tabStoreType) => void;
		removeTab: (index: number) => void;
		addTab: (tab: tabStoreType) => void;
	};
	setTabs: SetStoreFunction<tabStoreType<any>[]>;
};

interface AppStateProviderProps {
	children: JSX.Element[] | JSX.Element;

	userId: string | null;
}
export function AppStateProvider(props: AppStateProviderProps) {
	console.log('id: ', props.userId);
	const [userId, setUserId] = createSignal<string | null>(props.userId);
	const [basicUserData, setBasicUserData] = createSignal<any>(null); //display name, avatar, login status

	const [userGuilds, setUserGuilds] = createStore<Guild[]>([]);

	const [currentState, setCurrentState] = createSignal<'text' | 'voice' | null>('voice');
	const [relationships, setRelationships] = createStore<Relationship[]>([]);
	const [channelsSize, setChannelsSize] = createSignal<number>(250);

	const [tabs, setTabs] = createStore<tabStoreType<any>[]>([]);
	const [currentTab, setCurrentTab] = createSignal<number>(-1);

	const [currentGuild, setCurrentGuild] = createSignal<Guild | null | 'friends'>(null); //Used to display correct channels after being decoupled set to null to hide

	const orderedTabs = createMemo(() =>
		tabs
			.map((t, index) => ({ order: t.order, index }))
			.sort((a, b) => a.order - b.order)
			.map((t) => tabs[t.index]),
	);

	const Tabs = {
		tabs,
		currentTab,

		orderedTabs,

		changeOrder(index1: number, index2: number) {
			// setTabs(
			// 	[index1, index2],
			// 	produce((tab) => {
			// 		tab.order = tab.order == tabs[index1].order ? tabs[index2].order : tabs[index1].order;
			// 	}),
			// );

			const order1 = tabs[index1].order;
			const order2 = tabs[index2].order;
			setTabs(
				index1,
				produce((tab) => (tab.order = order2)),
			);
			setTabs(
				index2,
				produce((tab) => (tab.order = order1)),
			);
		},

		setCurrentTab: (tab: number | tabStoreType) => {
			if (typeof tab == 'number') {
				setCurrentTab(tab);
			} else {
				setCurrentTab(tabs.indexOf(tab));
			}
		},
		removeTab: (index: number) => {
			const order = tabs[index].order;

			const i = orderedTabs().findIndex((tab) => tab.order == order);
			if (i != 0) {
				setCurrentTab(i - 1);
			} else if (tabs.length > 1) {
				setCurrentTab(0);
			} else {
				setCurrentTab(-1);
			}
			setTabs(produce((tabs) => tabs.splice(index, 1)));
			// const tabBehind = tabs.findIndex((tab) => tab.order < order);
			// if (index == currentTab()) {
			// 	if (tabs.length > 0) {
			// 		setCurrentTab(0);
			// 	} else {
			// 		setCurrentTab(-1);
			// 	}
			// } else if (currentTab() > index) {
			// 	setCurrentTab(currentTab() - 1);
			// }
		},
		addTab: function <T>(tab: Tab<T>, setAsCurrent?: boolean) {
			console.log('adding tab', tab, tabs);

			const t = tab as tabStoreType<T>;
			const orderedTabs = this.orderedTabs();
			if (orderedTabs.length > 0) {
				t.order = orderedTabs[tabs.length - 1].order + 1;
			} else {
				t.order = 0;
			}

			if (setAsCurrent) {
				setCurrentTab(t.order);
				t.visible = true;
			}
			setTabs(tabs.length, t);
		},
		replaceTab: function <T>(oldTab: number, newTab: Tab<T>) {
			console.log(tabs, oldTab, newTab);
			console.log(oldTab, newTab);

			const tab = newTab as tabStoreType<T>;
			tab.order = tabs[oldTab].order;
			const c = currentTab();

			setTabs(produce((tabs) => tabs.splice(oldTab, 1)));

			setTabs(tabs.length, tab);
			console.log(tabs);
			if (oldTab == c) {
				setCurrentTab(tabs.length - 1);
			}
		},
	};
	const contextValue: ContextValue = {
		userGuilds,
		setUserGuilds,

		relationships,
		setRelationships,
		userId,
		setUserId,
		Tabs,
		setTabs,
		currentGuild,
		setCurrentGuild,
		currentState,
		setCurrentState,
		channelsSize,
		setChannelsSize,
	};

	return <AppState.Provider value={contextValue}>{props.children}</AppState.Provider>;
}

export function useAppState() {
	return useContext(AppState as Context<ContextValue>);
}
