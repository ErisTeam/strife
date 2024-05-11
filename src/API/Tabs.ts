// SolidJS
import { useAppState } from '@/AppState';
// Tauri
// API
import { Tab, TabComponents, TabsFile } from '@/types';

import { produce } from 'solid-js/store';

import { batch } from 'solid-js';
import { exists, BaseDirectory, createDir, writeFile, readTextFile } from '@tauri-apps/api/fs';

const sessionDataPath = 'session_data';
const tabsPath = sessionDataPath + '/tabs.json';
export function findByComponent(component: keyof typeof TabComponents) {
	const AppState = useAppState();
	return AppState.tabs.findIndex((t) => t.component == component);
}
//! NOT working
export function swapOrderByIdx(idx1: number, idx2: number) {
	const AppState = useAppState();
	console.log(AppState.tabsOrder());
	AppState.setTabsOrder((prev) => {
		const temp = prev[idx1];
		prev[idx1] = prev[idx2];
		prev[idx2] = temp;
		return prev;
	});
	console.log(AppState.tabsOrder());
	saveToFile().catch((err) => console.error(err));
}
export function setAsCurrent(tab: Tab | number) {
	const AppState = useAppState();
	if (typeof tab != 'number') {
		const index = AppState.tabs.indexOf(tab);
		if (index === -1) {
			console.error(`Tab not found`, tab);
			return;
		}
		AppState.setCurrentTabIndex(index);
	} else {
		AppState.setCurrentTabIndex(tab);
	}
	saveToFile().catch((err) => console.error(err));
}

export function remove(tab: Tab | number, keepOrder: boolean = false) {
	const AppState = useAppState();

	const tabIndex = typeof tab == 'number' ? tab : AppState.tabs.indexOf(tab);
	if (tabIndex === -1) {
		console.error(`Tab ${tab} not found`);
		return;
	}

	if (tabIndex == AppState.currentTabIndex()) {
		if (AppState.tabs.length > 1) {
			console.log('tabIndex', tabIndex, [...AppState.tabsOrder()]);
			let newTabindex = AppState.tabsOrder()[AppState.tabsOrder().indexOf(tabIndex) - 1];
			if (newTabindex == null) {
				newTabindex = 0;
			}
			AppState.setCurrentTabIndex(newTabindex);
		} else {
			AppState.setCurrentTabIndex(0);
		}
	} else if (AppState.currentTabIndex() > tabIndex) {
		AppState.setCurrentTabIndex(AppState.currentTabIndex() - 1);
	} else if (AppState.tabs.length === 1) {
		AppState.setCurrentTabIndex(-1);
	}
	//? batch is important here, otherwise tabs might not be updated correctly
	batch(() => {
		AppState.setTabs(produce((tabs) => tabs.splice(tabIndex, 1)));
		if (!keepOrder) {
			AppState.setTabsOrder((prev) => {
				const idx = prev.indexOf(tabIndex);
				prev.splice(idx, 1);

				prev = prev.map((order, index) => {
					if (order > tabIndex) {
						return order - 1;
					}
					return order;
				});
				return prev;
			});
		}
	});
	saveToFile().catch((err) => console.error(err));
}
export function add(tab: Tab, replaceCurrent: boolean = false) {
	const AppState = useAppState();
	console.log('adding tab', tab);
	//? batch is important here, otherwise tabs might not be updated correctly
	batch(() => {
		if (!replaceCurrent || AppState.tabs.length === 0) {
			AppState.setTabsOrder((prev) => [...prev, AppState.tabs.length]);

			AppState.setTabs(AppState.tabs.length, tab);
			if (replaceCurrent) AppState.setCurrentTabIndex(0);

			return;
		}

		let tabIndex = AppState.currentTabIndex();
		if (tabIndex === -1) {
			tabIndex = AppState.tabs.length;
		}

		if (AppState.tabs[tabIndex].component != tab.component) {
			AppState.setTabs(tabIndex, tab);
			return;
		}

		let currentOrder = AppState.tabsOrder().indexOf(tabIndex);
		console.log('currentOrder', currentOrder, [...AppState.tabsOrder()]);
		remove(tabIndex, true);
		const newIndex = AppState.tabs.length;
		console.log('newIndex', newIndex);
		AppState.setTabs(newIndex, tab);
		AppState.setCurrentTabIndex(newIndex);

		AppState.setTabsOrder((prev) => {
			prev = prev.map((index) => {
				if (index > tabIndex) {
					return index - 1;
				}
				return index;
			});
			prev[currentOrder] = newIndex;
			return prev;
		});
		console.log('currentOrder', currentOrder, AppState.tabsOrder());
	});
	saveToFile().catch((err) => console.error(err));
}

export async function saveToFile() {
	const dir = BaseDirectory.AppData;
	const AppState = useAppState();
	// const filePath = this;
	const doesDirExist = await exists(sessionDataPath, { dir: dir });
	if (!doesDirExist) {
		await createDir(sessionDataPath, { dir: dir });
	}
	let newTabs = AppState.tabs.slice().map((tab) => {
		delete tab.wasOpened;
		return tab;
	});

	console.log('saving tabs', newTabs);

	const tabsFile: TabsFile = {
		order: AppState.tabsOrder(),
		current: AppState.currentTabIndex(),
		tabs: newTabs,
	};

	await writeFile(tabsPath, JSON.stringify(tabsFile), { dir: dir });
}
export async function loadFromFile(): Promise<boolean> {
	const AppState = useAppState();
	const dir = BaseDirectory.AppData;
	const doesDirExist = await exists(sessionDataPath, { dir: dir });
	if (!doesDirExist) {
		console.warn('No session data folder found');
		return false;
	}
	const doesFileExist = await exists(tabsPath, { dir: dir });
	if (!doesFileExist) {
		console.warn('No session data tabs file found');
		return false;
	}

	const tabsFile = JSON.parse(await readTextFile(tabsPath, { dir: dir })) as TabsFile;

	const tabsOrder = tabsFile.order;
	const currentTab = tabsFile.current;
	const tabs = tabsFile.tabs;
	if (tabsOrder.length < 1 || tabs.length < 1) {
		console.error('Invalid tabs file');
		return false;
	}

	console.log(tabsFile);

	AppState.setTabs(tabs);
	AppState.setTabsOrder(tabsOrder);
	AppState.setCurrentTabIndex(currentTab);
	return true;
}
