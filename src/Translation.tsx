import en_us from './Locales/en_US';

import { createChainedI18nContext, useI18n } from '@solid-primitives/i18n';
import pl_PL from './Locales/pl_PL';

export const dictionaries = {
	en_US: en_us,

	pl_PL: pl_PL,
};

const [I18nProvider, useI18nContext] = createChainedI18nContext(
	{
		dictionaries: dictionaries,
		locale: 'en_US', // Starting locale
	},
	true
);

export const useTrans = () => {
	const context = useI18nContext();
	if (!context) throw new Error('useI18n must be used within an I18nProvider');
	return context;
};
export const TransProvider = I18nProvider;
