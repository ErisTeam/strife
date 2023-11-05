import { JSX, createContext, useContext } from 'solid-js';
import { Tab } from '../../types';
import { Channel } from '../../types/Channel';
import { getGuildIconFromChannel } from '@/API/Guilds';

export function createTextChannelTab(channel: Channel): Tab {
	// const { emoji, newName } = API.getChannelIcon(channel);

	return {
		title: channel.name,
		icon: getGuildIconFromChannel(channel),

		component: 'textChannel',
		channelId: channel.id,
		guildId: channel.guild_id,
	};
}

const TabContext = createContext<Tab>();

export function TabContextProvider(props: { tab: Tab; children: JSX.Element | JSX.Element[] }) {
	return <TabContext.Provider value={props.tab}>{props.children}</TabContext.Provider>;
}

export function useTabContext() {
	return useContext(TabContext);
}
