import { createUniqueId } from 'solid-js';
import { SettingsCategory, SettingsEntry } from '../Components/Settings/SettingsTypes';
import { StyleCategory, StyleEntries, StyleIds } from './settings/Style';
import { BaseDirectory, exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { useAppState } from '../AppState';
import { produce } from 'solid-js/store';

export const SettingsIds = {
	Style: StyleIds,
};

export const defaultSettings: {
	categories: SettingsCategory[];
	entries: (SettingsEntry | (() => SettingsEntry))[];
} = {
	categories: [
		{
			title: 'General',
			description: 'General settings',
			groups: [
				{
					title: 'General',
					description: 'General settings',
					entriesIds: [],
				},
			],
		},
		StyleCategory,
		{
			title: 'Settings Test',
			description: 'Test settings',
			groups: [
				{
					title: 'Test Group',
					description: 'Test Group Description',
					entriesIds: [],
				},
			],
		},
	],
	entries: [].concat(StyleEntries),
};
export function generateId() {
	return createUniqueId();
}
function getEntry(id: string) {
	const AppState = useAppState();
	return AppState.settings.entries.find((e) => e.id === id);
}

export function save(ob: { [key: string]: any }) {
	let result: {
		[key: string]: any;
	} = {};
	Object.entries(ob).forEach(([key, value]) => {
		if (typeof value == 'object') {
			result[key] = save(value);
		} else {
			const entryValue = getEntry(value)?.value;
			if (entryValue == null) return;
			result[key] = entryValue;
		}
	});
	Object.entries(result).forEach(([key, value]) => {
		if (value == null) delete result[key];
	});
	if (Object.keys(result).length == 0) return null;
	return result;
}
export async function load(ob: { [key: string]: any }, s: { [key: string]: any }) {
	Object.entries(ob).forEach(([key, value]) => {
		if (s[key] == null) {
			return;
		}
		if (typeof value == 'object') {
			load(value, s[key]);
		} else {
			const entryId = ob[key];

			const AppState = useAppState();
			const index = AppState.settings.entries.findIndex((e) => e.id === entryId);
			if (index == -1) return;
			AppState.settings.setEntries(
				index,
				produce((entry) => {
					entry.value = s[key];
				}),
			);
			dispatchEvent(new CustomEvent('settingsChanged', { detail: { id: entryId } }));
		}
	});
}

export async function saveToFile() {
	let result = save(SettingsIds);

	console.log(result);

	await writeTextFile('settings.json', JSON.stringify(result), { dir: BaseDirectory.AppData });
}

export async function loadFromFile() {
	if (!(await exists('settings.json', { dir: BaseDirectory.AppData }))) return;
	const content = JSON.parse(await readTextFile('settings.json', { dir: BaseDirectory.AppData }));
	load(SettingsIds, content);
}
