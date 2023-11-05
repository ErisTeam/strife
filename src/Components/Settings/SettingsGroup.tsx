import { For, Show, createMemo } from 'solid-js';
import { SettingsCategory, SettingsEntry as SettingsEntryType, SettingsGroup } from './SettingsTypes';
import { useAppState } from '../../AppState';
import SettingsEntry from './SettingsEntry';
import style from './Settings.module.css';
import { Cog } from 'lucide-solid';

export default (props: { group: SettingsGroup }) => {
	const AppState = useAppState();
	const options = createMemo(() => {
		let a: { entry: SettingsEntryType; index: number }[] = [];
		for (const entryId of props.group.entriesIds) {
			const entry = AppState.settings.entries.find((entry) => entry.id == entryId);
			if (entry != null) {
				a.push({ entry, index: AppState.settings.entries.indexOf(entry) });
			} else {
				console.error(`Entry with id ${entryId} not found`);
				a.push({
					entry: {
						id: entryId,
						title: '',
						description: '',
						type: 'TextInput',
					},

					index: -1,
				});
			}
		}
		return a;
	});
	return (
		<section class={style.group}>
			<h2 class={style.title + ' ' + style.g}>{props.group.title}</h2>
			<span class={style.description + ' ' + style.g}>{props.group.description}</span>
			<Show when={props.group.canBeLoadedFromFile}>
				<input title="PLACEHOLDER" type="file" class={style.loadFromFile} />
			</Show>

			<Show when={options().length == 0}>
				<div class={style.entry}>Empty</div>
			</Show>

			<For each={options()}>
				{(entry) =>
					entry.index == -1 ? (
						<div class={style.entry} style={{ color: 'red' }}>
							Entry with id {entry.entry.id} not found
						</div>
					) : (
						<SettingsEntry setting={entry.entry} index={entry.index} />
					)
				}
			</For>
		</section>
	);
};
