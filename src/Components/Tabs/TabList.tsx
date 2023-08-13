import { useAppState } from '../../AppState';

import style from './Tabs.module.css';
import { For, createEffect, createMemo, createSignal } from 'solid-js';

import { Tab } from '../../types';

import {
	DragDropDebugger,
	DragDropProvider,
	DragDropSensors,
	DragOverlay,
	SortableProvider,
	DragEvent,
	closestCorners,
} from '@thisbeyond/solid-dnd';
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

	const [draggedTabIndex, setDraggedTabIndex] = createSignal<number>(null);

	const [items, setItems] = createSignal<Item[]>([]); //TODO: switch to Appstate.tabsOrder

	createEffect(() => {
		const newItems = [];
		for (let i = 0; i < AppState.tabsOrder().length; i++) {
			const tab = AppState.tabs[AppState.tabsOrder()[i]];
			newItems.push({
				id: AppState.tabsOrder()[i],
				tab: tab,
			});
		}
		setItems(newItems);
	});

	function onDragStart(event: DragEvent) {
		console.log(event.draggable);
		setDraggedTabIndex((event.draggable.id as number) - 1);
	}

	function onDragEnd(event: DragEvent) {
		if (event.droppable) {
			if (event.droppable.id == event.draggable.id) return;
			let dropTabIndex: number;
			let dragTabIndex: number;
			for (let i = 0; i < items().length; i++) {
				if (dragTabIndex != null && dropTabIndex != null) break;
				if (items()[i].id == (event.droppable.id as number) - 1) dropTabIndex = i;
				if (items()[i].id == (event.draggable.id as number) - 1) dragTabIndex = i;
			}
			setItems((items) => {
				const newItems = items.slice();
				newItems.splice(dropTabIndex, 0, ...newItems.splice(dragTabIndex, 1));
				return newItems;
			});
			//? save new order
			AppState.setTabsOrder(items().map((t) => t.id));
		}
	}

	const ids = createMemo(() => items().map((t) => t.id + 1));

	return (
		<>
			<DragDropProvider onDragEnd={onDragEnd} onDragStart={onDragStart} collisionDetector={closestCorners}>
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
					<TabShadow tab={items().find((t) => t.id == draggedTabIndex())?.tab} />
				</DragOverlay>
			</DragDropProvider>
		</>
	);
}
export default TabList;
