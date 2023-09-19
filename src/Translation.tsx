import en_us from './Locales/en_US';
import * as i18n from '@solid-primitives/i18n';

import pl_PL from './Locales/pl_PL';
import { createMemo, createResource, createSignal } from 'solid-js';
import { useAppState } from './AppState';
export const dictionaries = {
	en_US: en_us,

	pl_PL: pl_PL,
} as const;

// const [I18nProvider, useI18nContext] = createChainedI18nContext(
// 	{
// 		dictionaries: dictionaries,
// 		locale: 'en_US', // Starting locale
// 	},
// 	true,
// );
export type Locale = keyof typeof dictionaries;

const AppState = useAppState();
const dict = createMemo(() => i18n.flatten(dictionaries[AppState.locale()]));
export const t = i18n.chainedTranslator(dictionaries[AppState.locale()], i18n.translator(dict, i18n.resolveTemplate));
