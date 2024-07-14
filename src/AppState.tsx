// SolidJS
import {
  type Accessor,
  type JSX,
  type Setter,
  createContext,
  createSignal,
  useContext,
} from 'solid-js';
import { createStore, produce, SetStoreFunction } from 'solid-js/store';
// API
import type { Locales } from './Translation';

import type { Tab } from './types';
import type {
  SettingsCategory,
  SettingsEntry,
} from './Components/Settings/SettingsTypes';
import { defaultSettings } from '@api/Settings';
import type { Relationship } from './types/User';
import type { Guild, GuildListUpdate } from './types/Guild';

type AppStateType = {
  userId: Accessor<string>;
  setUserId: Setter<string>;
  userGuilds: Guild[];
  setUserGuilds: SetStoreFunction<Guild[]>;
  relationships: Relationship[];
  setRelationships: SetStoreFunction<Relationship[]>;
  channelsSize: Accessor<number>;
  setChannelsSize: Setter<number>;
  openedGuildsAdditionalData: Record<string, Record<string, GuildListUpdate>>;
  setOpenedGuildsAdditionalData: SetStoreFunction<
    Record<string, Record<string, GuildListUpdate>>
  >;
  tabsOrder: Accessor<number[]>;
  setTabsOrder: Setter<number[]>;
  tabs: Tab[];
  setTabs: SetStoreFunction<Tab[]>;
  locale: Accessor<Locales>;
  setLocale: Setter<Locales>;
  currentTabIdx: Accessor<number>;
  setCurrentTabIdx: Setter<number>;
  currentGuild: Accessor<Guild | null | 'friends'>;
  setCurrentGuild: Setter<Guild | null | 'friends'>;
  settingsCategories: SettingsCategory[];
  setSettingsCategories: SetStoreFunction<SettingsCategory[]>;
  settingsEntries: SettingsEntry[];
  setSettingsEntries: SetStoreFunction<SettingsEntry[]>;
};

const AppState = createContext<AppStateType>();

export function AppStateProvider(props: {
  userId: string;
  children: JSX.Element[] | JSX.Element;
}) {
  const [userGuilds, setUserGuilds] = createStore<Guild[]>([]);
  const [relationships, setRelationships] = createStore<Relationship[]>([]);
  const [channelsSize, setChannelsSize] = createSignal<number>(250);
  const [openedGuildsAdditionalData, setOpenedGuildsAdditionalData] =
    createStore<Record<string, Record<string, GuildListUpdate>>>();
  // value is the index of the tab in the tabs array
  const [tabsOrder, setTabsOrder] = createSignal<number[]>([]);
  const [tabs, setTabs] = createStore<Tab[]>([]);
  const [locale, setLocale] = createSignal<Locales>('en-US');

  const [currentTabIdx, setCurrentTabIdx] = createSignal<number>(-1);

  const [currentGuild, setCurrentGuild] = createSignal<
    Guild | null | 'friends'
  >(null); //Used to display correct channelsset to null to hide

  const [settingsCategories, setSettingsCategories] = createStore<
    SettingsCategory[]
  >(defaultSettings.categories);
  const [settingsEntries, setSettingsEntries] = createStore<SettingsEntry[]>(
    []
  );
  const [userId, setUserId] = createSignal(props.userId);

  return (
    <AppState.Provider
      value={{
        userGuilds,
        setUserGuilds,
        relationships,
        setRelationships,
        channelsSize,
        setChannelsSize,
        openedGuildsAdditionalData,
        setOpenedGuildsAdditionalData,
        tabsOrder,
        setTabsOrder,
        tabs,
        setTabs,
        locale,
        setLocale,
        currentTabIdx,
        setCurrentTabIdx,
        currentGuild,
        setCurrentGuild,
        settingsCategories,
        setSettingsCategories,
        settingsEntries,
        setSettingsEntries,
        userId,
        setUserId,
      }}
    >
      {props.children}
    </AppState.Provider>
  );
}

export function useAppState() {
  const a = useContext(AppState);
  if (!a) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return a;
}
