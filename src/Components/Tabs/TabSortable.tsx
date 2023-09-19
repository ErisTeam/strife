import { useAppState } from '../../AppState';

import style from './Tabs.module.css';
import { Match, Switch, createMemo } from 'solid-js';
import { t } from '../../Translation';
import { Tab } from '../../types';
import { Dynamic, classList } from 'solid-js/web';
import { X } from 'lucide-solid';

import { createSortable, useDragDropContext } from '@thisbeyond/solid-dnd';

import API from '../../API';
type TabProps = {
	tab: Tab;
	disabled?: boolean;
	id: number;
};
function TabSortable(props: TabProps) {
	const AppState = useAppState();

	const tab = props.tab;

	const sortable = createSortable(props.id + 1);

	const [state] = useDragDropContext();

	console.log(props.tab, props.id);

	const tabIndex = createMemo(() => AppState.tabs.indexOf(tab));

	return (
		<li
			class={style.tab}
			use:sortable
			classList={{
				[style.opacity]: sortable.isActiveDraggable,
				[style.transform]: !!state.active.draggable,
			}}
		>
			<button
				disabled={props.disabled}
				classList={{
					[style.active]: AppState.currentTabIndex() == tabIndex(),
				}}
				onclick={() => {
					// console.log(state.active);
					// if (state.active.draggableId) return;
					// console.log(props.tab);
					API.Tabs.setAsCurrent(tab);
				}}
			>
				<Switch fallback={'❓'}>
					<Match when={typeof tab.icon === 'function'}>
						<Dynamic component={tab.icon}></Dynamic>
					</Match>
					<Match when={typeof tab.icon === 'string' && tab.icon.startsWith('http')}>
						{/* TODO: Add translation string to alt text */}
						<img src={tab.icon as string} alt={t.guild.logoAlt({ guildName: tab.title })} />
					</Match>
					<Match when={typeof tab.icon === 'string'}>
						<i>{tab.icon as string}</i>
					</Match>
				</Switch>

				<span>
					{/* {props.id + 1} */}
					{tab.title}
				</span>
			</button>
			<button
				disabled={props.disabled}
				onClick={() => {
					// if (state.active.draggableId) return;
					API.Tabs.remove(tab);
				}}
			>
				<X />
			</button>
		</li>
	);
}
export default TabSortable;
