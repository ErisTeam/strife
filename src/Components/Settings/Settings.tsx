import { For, Show, createSignal } from 'solid-js';

import { FileDown, FileUp } from 'lucide-solid';
import { useAppState } from '../../AppState';
import { SettingsGroupElement } from './SettingsGroup';

import style from './Settings.module.css';

export function SettingsPage() {
  const AppState = useAppState();

  const [currentRoute, setCurrentRoute] = createSignal(
    AppState.settingsCategories[0]
  );

  return (
    <article class={style.container}>
      <nav class={style.navbar}>
        <ol>
          <For each={AppState.settingsCategories}>
            {(category) => (
              <li class={style.routeContainer}>
                <button
                  type="button"
                  class={style.route}
                  classList={{
                    [style.routeActive]: currentRoute() === category,
                  }}
                  title={category.description}
                  role="button"
                  onclick={() => {
                    console.log('click');
                    setCurrentRoute(category);
                  }}
                >
                  {category.title}
                </button>
                <Show when={category === currentRoute()}>
                  <ol>
                    <For each={category.groups}>
                      {(group) => (
                        <li title={group.description}>{group.title}</li>
                      )}
                    </For>
                  </ol>
                </Show>
              </li>
            )}
          </For>
        </ol>
      </nav>
      <article class={style.groupContainer}>
        <header class={style.header}>
          <Show when={currentRoute().canBeLoadedFromFile}>
            <button title="PLACEHOLDER" type="button">
              <FileDown stroke="red" />
            </button>
            <button
              type="button"
              title="PLACEHOLDER"
              onclick={() => {
                //Settings.save(currentRoute().groups)
              }}
            >
              <FileUp stroke="red" />
            </button>
          </Show>
        </header>
        <For each={currentRoute().groups}>
          {(group) => <SettingsGroupElement group={group} />}
        </For>
      </article>
    </article>
  );
}
