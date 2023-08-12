import { useAppState } from '../../AppState';

import style from './Tabs.module.css';
import { For, Show, Suspense } from 'solid-js';

import { Dynamic } from 'solid-js/web';

import Loading from '../Loading/Loading';

import TabList from './TabList';
import { TabComponents } from '../../types';
import { TabContextProvider } from './TabUtils';

export function TabWindow() {
	const AppState = useAppState();
	console.log('length', AppState.tabs.length);

	return (
		<Show when={AppState.tabs.length > 0}>
			<TabList />

			<For each={AppState.tabs}>
				{(tab, index) => {
					console.log('tab', tab);
					console.log('Tab component', TabComponents[tab.component]);
					return (
						<div style={{ display: AppState.currentTabIndex() == index() ? null : 'none' }} class={style.outlet}>
							<Suspense fallback={<Loading />}>
								<TabContextProvider tab={tab}>
									<Dynamic component={TabComponents[tab.component]} />
								</TabContextProvider>
							</Suspense>
						</div>
					);
				}}
			</For>
		</Show>
	);
}

export default TabWindow;
