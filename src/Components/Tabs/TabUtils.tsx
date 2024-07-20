import { type JSX, createContext, useContext } from 'solid-js';
import type { Tab } from '../../types';
import type { Channel } from '../../types/Channel';
import { getGuildIconFromChannel } from '@/API/Guilds';
import { AppStateType } from '@/AppState';

export function createTextChannelTab(
  AppState: AppStateType,
  channel: Channel
): Tab {
  // const { emoji, newName } = API.getChannelIcon(channel);
  console.log('chuj');
  return {
    title: channel.name,
    icon: getGuildIconFromChannel(AppState, channel),

    component: 'textChannel',
    channelId: channel.id,
    guildId: channel.guild_id,
  };
}

const TabContext = createContext<Tab>();

export function TabContextProvider(props: {
  tab: Tab;
  children: JSX.Element | JSX.Element[];
}) {
  return (
    <TabContext.Provider value={props.tab}>
      {props.children}
    </TabContext.Provider>
  );
}

export function useTabContext<T = unknown>() {
  return useContext(TabContext) as Tab & T;
}
