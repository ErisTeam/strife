import { useAppState } from '../../AppState';

import { For, Show, Suspense } from 'solid-js';
import outletStyle from '../Application/Application.module.css';

import { Dynamic } from 'solid-js/web';

import Loading from '../Loading/Loading';

import { TabComponents } from '../../types';
import TabList from './TabList';
import { TabContextProvider } from './TabUtils';
import SuspenseErrorBoundary from '../SuspenseErrorBoundary/SuspenseErrorBoundary';

export function TabWindow({ className }: { className?: string }) {
	const AppState = useAppState();
	console.log('length', AppState.tabs.length);

	return (
		<div class={className}>
			<Show when={AppState.tabs.length > 0}>
				<TabList />

				<For each={AppState.tabs}>
					{(tab, index) => {
						return (
							<div
								style={{ display: AppState.currentTabIndex() == index() ? null : 'none' }}
								class={outletStyle.outlet}
							>
								<SuspenseErrorBoundary>
									<TabContextProvider tab={tab}>
										<Dynamic component={TabComponents[tab.component]} />
									</TabContextProvider>
								</SuspenseErrorBoundary>
							</div>
						);
					}}
				</For>
			</Show>
		</div>
	);
}

export default TabWindow;
