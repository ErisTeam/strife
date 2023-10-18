import {
	Component,
	For,
	Match,
	Show,
	Switch,
	createEffect,
	createMemo,
	createSignal,
	observable,
	onMount,
} from 'solid-js';
import { createStore, produce } from 'solid-js/store';

import checkBoxes from '../../Styles/Checkboxes.module.css';
import inputs from '../../Styles/Inputs.module.css';

import { Import } from 'lucide-solid';
import SettingsEntry from './SettingsEntry';
import { useAppState } from '../../AppState';
import { Router } from '@solidjs/router';
import SettingsGroup from './SettingsGroup';

import style from './Settings.module.css';
import Settings from '../../API/Settings';
import API from '../../API';
import Dev from '../Dev/Dev';
import { useTabContext } from '../Tabs/TabUtils';

export default () => {
	const AppState = useAppState();

	const [currentRoute, setCurrentRoute] = createSignal(AppState.settings.categories[0]);

	return (
		<article class={style.container}>
			<nav class={style.navbar}>
				<ol>
					<For each={AppState.settings.categories}>
						{(category) => (
							<li
								class={style.route}
								classList={{ [style.routeActive]: currentRoute() == category }}
								role="button"
								onclick={() => {
									console.log('click');
									setCurrentRoute(category);
								}}
								title={category.description}
							>
								{category.title}
							</li>
						)}
					</For>
				</ol>
			</nav>
			<article class={style.groupContainer}>
				<header class={style.header}>
					<Show when={currentRoute().canBeLoadedFromFile}>
						<input type="file" />
					</Show>
				</header>
				<For each={currentRoute().groups}>{(group) => <SettingsGroup group={group} />}</For>
			</article>
		</article>
	);
};