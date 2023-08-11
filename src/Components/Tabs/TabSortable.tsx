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

import { createSortable, useDragDropContext } from '@thisbeyond/solid-dnd';
import Loading from '../Loading/Loading';
import TabShadow from './TabShadow';
import API from '../../API';
type TabProps = {
	tab: Tab;
	disabled?: boolean;
	id: number;
};
function TabSortable(props: TabProps) {
	const AppState = useAppState();
	const [t] = useTrans();

	const tab = props.tab;

	const sortable = createSortable(props.id);
	const [state, actions] = useDragDropContext();

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
					[style.active]: AppState.tabs[AppState.currentTabIdx()].id == tab.id,
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

				<span>{tab.title}</span>
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
