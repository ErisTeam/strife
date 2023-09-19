import { tabStoreType, useAppState } from '../../AppState';

import style from './Tabs.module.css';
import { Match, Switch, createMemo } from 'solid-js';
import { t } from '../../Translation';

import { Dynamic } from 'solid-js/web';
import { X } from 'lucide-solid';

import { Draggable, useDragDropContext } from '@thisbeyond/solid-dnd';
import { Tab } from '../../types';
import { Item } from './TabList';

export function TEST(props: { activeDraggable: Draggable }) {
	return <div>{props.activeDraggable.id}</div>;
}

function TabShadow(props: { activeDraggable?: Draggable; items: Item[] }) {
	const tab = createMemo(() => {
		const id = (props.activeDraggable?.id as number) || 1;
		const b = props.items.find((t) => t.id == id - 1 || 0)?.tab;
		return b;
	});

	if (!tab()) return <div>Null</div>;
	console.log(tab());

	return (
		<li class={style.tab}>
			<button disabled={true}>
				<Switch fallback={'❓'}>
					<Match when={typeof tab().icon === 'function'}>
						<Dynamic component={tab().icon} />
					</Match>
					<Match when={typeof tab().icon === 'string' && (tab().icon as string).startsWith('http')}>
						{/* TODO: Add translation string to alt text */}
						<img src={tab().icon as string} alt={t.guild.logoAlt({ guildName: tab().title })} />
					</Match>
					<Match when={typeof tab().icon === 'string'}>
						<i>{tab().icon as string}</i>
					</Match>
				</Switch>

				<span>{tab().title}</span>
			</button>
			<button disabled={true}>
				<X />
			</button>
		</li>
	);
}
export default TabShadow;
