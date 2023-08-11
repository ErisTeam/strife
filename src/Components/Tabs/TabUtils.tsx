import { tabStoreType, useAppState } from '../../AppState';

import style from './Tabs.module.css';
import {
	Accessor,
	Context,
	For,
	Match,
	Show,
	Suspense,
	Switch,
	createContext,
	createMemo,
	createSignal,
	lazy,
	useContext,
} from 'solid-js';
import { useTrans } from '../../Translation';
import { Tab, TextChannelTab as TextChannelTabType } from '../../types';
import { Dynamic, classList } from 'solid-js/web';
import { X } from 'lucide-solid';
import { Channel } from '../../discord';

import API from '../../API';

export function createTextChannelTab(channel: Channel): Tab {
	const { emoji, newName } = API.getChannelIcon(channel);

	return {
		title: newName,
		icon: emoji,

		component: 'textChannel',
		id: channel.id,
		guildId: channel.guild_id,
	};
}

const TabContext = createContext<{ tab: Tab }>();

export function TabContextProvider(props: { tab: Tab; children: JSX.Element | JSX.Element[] }) {
	return <TabContext.Provider value={{ tab: props.tab }}>{props.children}</TabContext.Provider>;
}

export function useTabContext() {
	return useContext(TabContext);
}
