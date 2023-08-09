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
} from '@thisbeyond/solid-dnd';
import Loading from '../Loading/Loading';

export function TextChannelTab(channel: Channel): TextChannelTabType {
	let { emoji, newName } = API.getChannelIcon(channel);

	return {
		title: newName,
		icon: emoji,
		type: 'textChannel',
		component: Chat,
		tabData: channel,
	};
}

type TabsProps = {
	className?: string;
};

const context = createContext<unknown>(null);

export const TabContextProvider = function (props: { children: any; tab: Tab }) {
	const AppState = useAppState();
	return <context.Provider value={props.tab}>{props.children}</context.Provider>;
};

export const useTabContext = function <T>() {
	const c = useContext(context as Context<Tab<T>>);
	return c;
};

const TabBar = (props: TabsProps) => {
	const AppState = useAppState();

	const tabsOrder = createMemo(() =>
		AppState.Tabs.tabs.map((t, index) => ({ order: t.order, index })).sort((a, b) => a.order - b.order),
	);
	return (
		<>
			<nav class={[props.className, style.tabs].join(' ')}>
				<ul>
					<For each={tabsOrder()}>{(tab) => <SortableTabItem tab={AppState.Tabs.tabs[tab.index]} />}</For>
				</ul>
			</nav>
		</>
	);
};
type TabProps = {
	tab: tabStoreType;
	disabled?: boolean;
};
const SortableTabItem = (props: TabProps) => {
	const AppState = useAppState();
	const [t] = useTrans();
	console.log(AppState.Tabs.currentTab());

	const tab = props.tab;

	const sortable = createSortable(tab.order + 1);
	console.log(sortable);

	const [state, actions] = useDragDropContext();

	return (
		<li class={style.tab} style={{}} use:sortable>
			<button
				disabled={props.disabled}
				classList={{
					[style.active]: AppState.Tabs.tabs[AppState.Tabs.currentTab()]?.order == props.tab.order,
				}}
				onclick={() => {
					console.log(state.active);
					if (state.active.draggableId) return;
					console.log(props.tab);
					AppState.Tabs.setCurrentTab(AppState.Tabs.tabs.findIndex((tab) => tab.order == props.tab.order));
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
					if (state.active.draggableId) return;
					AppState.Tabs.removeTab(AppState.Tabs.tabs.findIndex((tab) => tab.order == props.tab.order));
				}}
			>
				<X />
			</button>
		</li>
	);
};

function TabItemShadow() {
	const AppState = useAppState();
	const [t] = useTrans();

	const [state] = useDragDropContext();

	const tab = AppState.Tabs.tabs.find((tab) => tab.order == (state.active.draggableId as number) - 1);
	return (
		<li class={style.tab}>
			<button
				disabled={true}
				classList={{
					[style.active]: AppState.Tabs.tabs[AppState.Tabs.currentTab()]?.order == tab.order,
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
			<button disabled={true}>
				<X />
			</button>
		</li>
	);
}

export function Tabs() {
	const AppState = useAppState();

	const ids = createMemo(() => AppState.Tabs.orderedTabs().map((tab) => tab.order));

	const [currentItem, setCurrenItem] = createSignal(null);

	const item = createMemo(() => AppState.Tabs.tabs.find((tab) => tab.order == currentItem()));

	return (
		<Show when={AppState.Tabs.tabs.length > 0}>
			<DragDropProvider
				onDragStart={(event) => {
					setCurrenItem(event.draggable.id);

					console.log(
						AppState.Tabs.tabs,
						currentItem(),
						AppState.Tabs.tabs.find((tab) => tab.order == currentItem()),
						item(),
						ids(),
					);
				}}
				onDragEnd={(event) => {
					setCurrenItem(null);
					if (event.droppable) {
						const firstId = (event.draggable.id as number) - 1;
						const secondId = (event.droppable.id as number) - 1;

						if (firstId == secondId) return;
						const first = AppState.Tabs.tabs.findIndex((tab) => tab.order == firstId);
						const second = AppState.Tabs.tabs.findIndex((tab) => tab.order == secondId);

						console.log(first, second, firstId, secondId, AppState.Tabs.tabs);
						AppState.Tabs.changeOrder(first, second);
					}
				}}
			>
				<DragDropDebugger />
				<DragDropSensors />
				<DragOverlay>
					<TabItemShadow />
				</DragOverlay>
				<SortableProvider ids={ids()}>
					<TabBar />
				</SortableProvider>
				<For each={AppState.Tabs.tabs}>
					{(tab, index) => {
						console.log('tab', tab);

						return (
							<TabContextProvider tab={tab}>
								<div style={{ display: AppState.Tabs.currentTab() == index() ? null : 'none' }} class={style.outlet}>
									<Suspense fallback={<Loading />}>
										<Dynamic component={tab.component} {...tab.tabData} />
									</Suspense>
								</div>
							</TabContextProvider>
						);
					}}
				</For>
			</DragDropProvider>
		</Show>
	);
}

export default TabBar;
