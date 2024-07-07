import style from './Tabs.module.css';
import { Match, Switch, createMemo } from 'solid-js';
import { t } from '../../Translation';

import { Dynamic } from 'solid-js/web';
import { X } from 'lucide-solid';

import type { Draggable } from '@thisbeyond/solid-dnd';
import type { Item } from './TabList';

export function TEST(props: { activeDraggable: Draggable }) {
  return <div>{props.activeDraggable.id}</div>;
}

export function TabShadow(props: { items: Item[]; itemId: number }) {
  const tab = createMemo(() => {
    return props.items.find((t) => t.id === props.itemId)?.tab;
  });

  if (!tab()) return <div>Null</div>;
  console.log(tab());

  return (
    <li class={style.tab}>
      <button disabled={true} type="button">
        <Switch fallback={'❓'}>
          <Match when={typeof tab().icon === 'function'}>
            <Dynamic component={tab().icon} />
          </Match>
          <Match
            when={
              typeof tab().icon === 'string' &&
              (tab().icon as string).startsWith('http')
            }
          >
            {/* TODO: Add translation string to alt text */}
            <img
              src={tab().icon as string}
              alt={t.guild.logoAlt({ guildName: tab().title })}
            />
          </Match>
          <Match when={typeof tab().icon === 'string'}>
            <i>{tab().icon as string}</i>
          </Match>
        </Switch>

        <span>{tab().title}</span>
      </button>
      <button type="button" disabled={true}>
        <X />
      </button>
    </li>
  );
}
