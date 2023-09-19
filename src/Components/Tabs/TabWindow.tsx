import { useAppState } from '../../AppState';

import { For, Show, Suspense } from 'solid-js';
import outletStyle from '../Application/Application.module.css';

import { Dynamic } from 'solid-js/web';

import Loading from '../Loading/Loading';

import { TabComponents } from '../../types';
import TabList from './TabList';
import { TabContextProvider } from './TabUtils';

export function TabWindow() {
	const AppState = useAppState();
	console.log('length', AppState.tabs.length);

	return (
		<Show when={AppState.tabs.length > 0}>
			<TabList />

			<For each={AppState.tabs}>
				{(tab, index) => {
					return (
						<div style={{ display: AppState.currentTabIndex() == index() ? null : 'none' }} class={outletStyle.outlet}>
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
