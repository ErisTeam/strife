import { createUniqueId } from 'solid-js';
import type {
  SettingsCategory,
  SettingsEntry,
} from '../Components/Settings/SettingsTypes';
import { StyleCategory, StyleEntries, StyleIds } from './settings/Style';
import {
  BaseDirectory,
  exists,
  readTextFile,
  writeTextFile,
} from '@tauri-apps/api/fs';
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

type InputObject = { [key: string]: string | InputObject };

function getEntry(id: string): SettingsEntry | null {
  const AppState = useAppState();
  return AppState.settings.entries.find((e) => e.id === id);
}

export function save(ob: { [key: string]: string }): null | InputObject {
  const result: {
    [key: string]: SettingsEntry | null | string | InputObject | unknown;
  } = {};

  for (const [key, value] of Object.entries(ob)) {
    if (typeof value === 'object' && value !== null) {
      const nestedResult = save(value);
      if (nestedResult !== null) {
        result[key] = JSON.stringify(nestedResult);
      }
    } else if (typeof value === 'string') {
      const entry = getEntry(value);
      if (entry === null || entry.value === null) return null;
      result[key] = entry.value;
    }
  }
  for (const [key, value] of Object.entries(result)) {
    if (value == null) delete result[key];
  }
  Object.keys(result).length === 0 ? null : result;
}
//TODO: remove the any, i cant do this because i have no clue what the author meant
export async function load(ob: InputObject, s: InputObject) {
  for (const [key, value] of Object.entries(ob)) {
    if (s[key] == null) {
      return;
    }
    if (typeof value === 'object') {
      load(value, s[key]);
    } else {
      const entryId = ob[key];

      const AppState = useAppState();
      const index = AppState.settings.entries.findIndex(
        (e) => e.id === entryId
      );
      if (index === -1) return;
      AppState.settings.setEntries(
        index,
        produce((entry) => {
          entry.value = s[key];
        })
      );
      dispatchEvent(
        new CustomEvent('settingsChanged', { detail: { id: entryId } })
      );
    }
  }
}

export async function saveToFile() {
  let result = save(SettingsIds);

  console.log(result);

  await writeTextFile('settings.json', JSON.stringify(result), {
    dir: BaseDirectory.AppData,
  });
}

export async function loadFromFile() {
  if (!(await exists('settings.json', { dir: BaseDirectory.AppData }))) return;
  const content = JSON.parse(
    await readTextFile('settings.json', { dir: BaseDirectory.AppData })
  );
  load(SettingsIds, content);
}
