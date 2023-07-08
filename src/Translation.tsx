import en_us from './Locales/en_US.json';

import { createChainedI18nContext, useI18n } from '@solid-primitives/i18n';

const [I18nProvider, useI18nContext] = createChainedI18nContext(
	{
		dictionaries: {
			en_US: en_us,
		},
		locale: 'en_US', // Starting locale
	},
	true
);

export const useTrans = () => {
	const context = useI18nContext();
	if (!context) throw new Error('useI18n must be used within an I18nProvider');
	return context;
};

export const addLocale = async (locale: string) => {
	if (typeof locale !== 'string') throw new Error('Locale must be a string');

	const [_, { add, dict }] = useI18n();

	let localeData = await import(`./Locales/${locale}.json`);
	if (dict(locale)) {
		console.warn(`Locale ${locale} already exists!`);
	}
	add(locale, localeData);
};
export const TransProvider = I18nProvider;
