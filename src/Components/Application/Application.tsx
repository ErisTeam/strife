import { Show, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import { GuildList } from '../Guild/GuildList';

import style from './Application.module.css';

import { ContextMenusProvider } from '../ContextMenuNew/ContextMenu';
import { ControlPanel } from '../ControlPanel/ControlPanel';

import { Dev } from '../Dev/Dev';

import type { Guild } from '../../types/Guild';
import { ChannelList } from '../ChannelList/ChannelList';
import { FriendsList } from '../Friends/FriendsList';
import { TabWindow } from '../Tabs/TabWindow';
import { add, findByComponent, loadFromFile, swapOrderByIdx } from '@/API/Tabs';
import { StateSetter } from '@/StateSetter';
import { StateSetterNew } from '@/StateSetterNew';
import { defaultSettings } from '@/API/Settings';
import { start } from '@/API/Style';

//TODO: move to routes
export function Application() {
  const AppState = useAppState();

  onMount(() => {
    console.log('is tauri', window.__TAURI__);
    const entries = defaultSettings.entries.map((e) => {
      if (typeof e === 'function') {
        return e();
      }
      return e;
    });
    //TODO: remove this
    const AppState = useAppState();
    AppState.setSettingsEntries(entries);
    start();

    loadFromFile();
    console.log('CurrentGuild', !AppState.currentGuild());

    loadFromFile()
      .then((result) => {
        if (!result) {
          add(
            {
              title: 'Welcome',
              component: 'welcomeTab',
              icon: '👋',
            },
            true
          );
        }
        if (findByComponent('settings', AppState) === -1) {
          add({
            component: 'settings',
            title: 'Settings',
            icon: '⚙️',
          });
        }
      })
      .catch(console.error);
  });

  return (
    <StateSetterNew state={'Application'} force={true}>
      <ContextMenusProvider>
        <Dev>
          <button
            type="button"
            onclick={() => {
              swapOrderByIdx(0, 1);
            }}
          >
            Ordering Test
          </button>
        </Dev>

        <div class={style.wrapper}>
          <GuildList className={style.guilds} />
          <div class={style.outer}>
            <div id="ContextMenu" />

            <Show when={!!AppState.currentGuild()}>
              <Show
                when={AppState.currentGuild() === 'friends'}
                fallback={
                  <ChannelList
                    className={style.channels}
                    guild={AppState.currentGuild() as Guild}
                  />
                }
              >
                <FriendsList className={style.channels} />
              </Show>
            </Show>

            <TabWindow className={style.inner} />
          </div>
          <ControlPanel className={style.controlPanel} />
        </div>
      </ContextMenusProvider>
    </StateSetterNew>
  );
}
