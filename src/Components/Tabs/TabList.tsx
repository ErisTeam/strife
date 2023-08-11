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
	createEffect,
	createMemo,
	createSignal,
	lazy,
	useContext,
} from 'solid-js';
import { useTrans } from '../../Translation';
import { Tab, TextChannelTab as TextChannelTabType } from '../../types';
import { Dynamic, classList } from 'solid-js/web';
import { X } from 'lucide-solid';
import { Channel } from '../../discord';
import Chat from '../Messages/Chat';
import API from '../../API';
import {
	DragDropDebugger,
	DragDropProvider,
	DragDropSensors,
	DragOverlay,
	SortableProvider,
	Transformer,
	createDraggable,
	createDroppable,
	createSortable,
	useDragDropContext,
	closestCenter,
} from '@thisbeyond/solid-dnd';
import Loading from '../Loading/Loading';
import TabShadow from './TabShadow';
import TabSortable from './TabSortable';
type Item = {
	id: number;
	tab: Tab;
};

type TabsProps = {
	className?: string;
};

function TabList(props: TabsProps) {
	const AppState = useAppState();
	createEffect(() => {
		const newItems = [];
		for (let i = 0; i < AppState.tabs.length; i++) {
			newItems.push({ id: i + 1, tab: AppState.tabs[i] });
		}
		setItems(newItems);
	}, [AppState.tabs]);

	const [items, setItems] = createSignal<Item[]>([]);

	const [activeItemId, setActiveItem] = createSignal(null);
	const ids = () => items().map((item) => item.id);
	const onDragStart = (event: DragEvent) => {
		setActiveItem(event.draggable.id);
		console.log(activeItemId());
	};

	function onDragEnd(event: DragEvent) {
		if (event.draggable && event.droppable) {
			const currentItems = ids();
			const fromIndex = currentItems.indexOf(event.draggable.id);
			const toIndex = currentItems.indexOf(event.droppable.id);
			if (fromIndex !== toIndex) {
				const updatedItems = currentItems.slice();
				updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));

				const newItems = [];
				for (let i = 0; i < updatedItems.length; i++) {
					newItems.push(items().find((item) => item.id === updatedItems[i]));
				}
				setItems(newItems);
				const newTabs = [];
				for (let i = 0; i < newItems.length; i++) {
					newTabs.push(newItems[i].tab);
				}
				if (fromIndex == AppState.currentTabIdx()) {
					AppState.setCurrentTabIdx(toIndex);
				}
				if (toIndex == AppState.currentTabIdx()) {
					AppState.setCurrentTabIdx(fromIndex);
				}
				AppState.setTabs(newTabs);
			}
		}
	}

	return (
		<DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetector={closestCenter}>
			<DragDropDebugger />
			<DragDropSensors />
			<nav class={[props.className, style.tabs].join(' ')}>
				<ul>
					<SortableProvider ids={ids()}>
						<For each={items()}>{(item) => <TabSortable tab={item.tab} id={item.id} />}</For>
					</SortableProvider>
				</ul>
			</nav>
			<DragOverlay>
				<TabShadow tab={items().find((x) => x.id == activeItemId())?.tab} />
			</DragOverlay>
		</DragDropProvider>
	);
}
export default TabList;
