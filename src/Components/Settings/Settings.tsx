import { For, Show, createSignal } from 'solid-js';

import { FileDown, FileUp } from 'lucide-solid';
import { useAppState } from '../../AppState';
import SettingsGroup from './SettingsGroup';

import style from './Settings.module.css';

export default function SettingsPage() {
	const AppState = useAppState();

	const [currentRoute, setCurrentRoute] = createSignal(AppState.settings.categories[0]);

	return (
		<article class={style.container}>
			<nav class={style.navbar}>
				<ol>
					<For each={AppState.settings.categories}>
						{(category) => (
							<li class={style.routeContainer}>
								<button
									class={style.route}
									classList={{ [style.routeActive]: currentRoute() == category }}
									title={category.description}
									role="button"
									onclick={() => {
										console.log('click');
										setCurrentRoute(category);
									}}
								>
									{category.title}
								</button>
								<Show when={category == currentRoute()}>
									<ol>
										<For each={category.groups}>{(group) => <li title={group.description}>{group.title}</li>}</For>
									</ol>
								</Show>
							</li>
						)}
					</For>
				</ol>
			</nav>
			<article class={style.groupContainer}>
				<header class={style.header}>
					<Show when={currentRoute().canBeLoadedFromFile}>
						<button title="PLACEHOLDER">
							<FileDown stroke="red" />
						</button>
						<button
							title="PLACEHOLDER"
							onclick={() => {
								//Settings.save(currentRoute().groups)
							}}
						>
							<FileUp stroke="red" />
						</button>
					</Show>
				</header>
				<For each={currentRoute().groups}>{(group) => <SettingsGroup group={group} />}</For>
			</article>
		</article>
	);
}
