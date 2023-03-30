export const dictionaries = {
	en_US: {
		hello: 'hello {{ name }}, how are you?',
		logIn: 'log in',
	},
	pl_PL: {
		hello: 'cześć {{ name }}, jak się masz?',
		logIn: 'zaloguj się',
	},
};

import { createChainedI18nContext } from '@solid-primitives/i18n';

const [I18nProvider, useI18nContext] = createChainedI18nContext({
	dictionaries,
	locale: 'en_US', // Starting locale
});

export const useTrans = () => {
	const context = useI18nContext();
	if (!context) throw new Error('useI18n must be used within an I18nProvider');
	return context;
};
export const TransProvider = I18nProvider;
