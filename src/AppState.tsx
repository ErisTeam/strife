import {
  type Accessor,
  type JSX,
  type Setter,
  createContext,
  createSignal,
  useContext,
} from 'solid-js';
import { createStore, produce, SetStoreFunction } from 'solid-js/store';

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
  userGuilds: Guild[];
  setUserGuilds: SetStoreFunction<Guild[]>;

  relationships: Relationship[];
  setRelationships: SetStoreFunction<Relationship[]>;

  tabs: Tab[];
  setTabs: SetStoreFunction<Tab[]>;
  tabsOrder: Accessor<number[]>;
  setTabsOrder: Setter<number[]>;

  locale: Accessor<Locales>;
  setLocale: Setter<Locales>;

  currentTabIndex: Accessor<number>;
  setCurrentTabIndex: (index: number) => void;

  currentGuild: Accessor<Guild | null | 'friends'>;
  setCurrentGuild: Setter<Guild | null | 'friends'>;

  currentState: Accessor<'text' | 'voice' | null>;
  setCurrentState: Setter<'text' | 'voice' | null>;

  channelsSize: Accessor<number>;
  setChannelsSize: Setter<number>;

  openedGuildsAdditionalData: Record<string, Record<string, GuildListUpdate>>;
  setOpenedGuildsAdditionalData: SetStoreFunction<
    Record<string, Record<string, GuildListUpdate>>
  >;

  settingsCategories: SettingsCategory[];
  setSettingsCategories: SetStoreFunction<SettingsCategory[]>;
  settingsEntries: SettingsEntry[];
  setSettingsEntries: SetStoreFunction<SettingsEntry[]>;

  userId: Accessor<string>;
  setUserId: Setter<string>;
};

const AppState = createContext<AppStateType>();

export function AppStateProvider(props: {
  userId: string;
  children: JSX.Element[] | JSX.Element;
}) {
  const [userGuilds, setUserGuilds] = createStore<Guild[]>([]);

  const [currentState, setCurrentState] = createSignal<'text' | 'voice' | null>(
    'voice'
  );
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
  console.log('UserId', userId(), props);
  return (
    <AppState.Provider
      value={{
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
        setCurrentTabIndex: (index: number) => {
          const tab = tabs[index];
          if (!tab.wasOpened) {
            setTabs(
              index,
              produce((tab) => {
                tab.wasOpened = true;
              })
            );
          }
          setCurrentTabIdx(index);
        },

        currentGuild,
        setCurrentGuild,
        currentState,
        setCurrentState,
        channelsSize,
        setChannelsSize,
        openedGuildsAdditionalData,
        setOpenedGuildsAdditionalData,

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
  return useContext(AppState);
}
