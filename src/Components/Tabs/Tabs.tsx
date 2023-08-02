import { tabStoreType, useAppState } from '../../AppState';

import style from './Tabs.module.css';
import { Accessor, Context, For, Match, Switch, createContext, createMemo, useContext } from 'solid-js';
import { useTrans } from '../../Translation';
import { Tab } from '../../types';
import { Dynamic } from 'solid-js/web';

type TabsProps = {
	className?: string;
};

const context = createContext<unknown>(null);

type TabContext = {
	getData: <T>() => T;
};

export const TabContextProvider = function (props: { children: any; tab: Tab }) {
	const AppState = useAppState();
	return <context.Provider value={props.tab}>{props.children}</context.Provider>;
};

export const useTabContext = function <T>() {
	const c = useContext(context as Context<Tab<T>>);
	return c;
};

const Tabs = (props: TabsProps) => {
	const AppState = useAppState();
	return (
		<nav class={[props.className, style.tabs].join(' ')}>
			<ul>
				<For each={AppState.Tabs.tabs}>
					{(tab, index) => {
						console.log(tab, index());

						return <TabItem tab={tab} tabIndex={index()} />;
					}}
				</For>
			</ul>
		</nav>
	);
};
type TabProps = {
	className?: string;
	tabIndex: number;
	tab: tabStoreType;
};
const TabItem = (props: TabProps) => {
	const AppState = useAppState();
	const [t] = useTrans();
	console.log(AppState.Tabs.tabs[props.tabIndex], props.tabIndex, AppState.Tabs.currentTab());

	const tab = props.tab;
	return (
		<li class={[props.className, style.tab].join(' ')}>
			<button
				classList={{
					[style.active]: AppState.Tabs.currentTab() == props.tabIndex,
				}}
				onclick={() => {
					console.log(props.tabIndex, props.tab);
					AppState.Tabs.setCurrentTab(props.tabIndex);
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
				onClick={() => {
					AppState.Tabs.removeTab(props.tabIndex);
				}}
			>
				X
			</button>
		</li>
	);
};

export default Tabs;
