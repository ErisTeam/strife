export const dictionaries = {
	en_US: {
		hello: 'hello {{ name }}, how are you?',
		friends: 'Friends',
		error: 'Retrying in {{ time }}s',
		LoginPage: {
			logIn: 'Log In',
			qrCodeLogin: 'Log In With QR Code',
			qrCodeParagraph: 'Scan the code with our app or any other one to log in!',
			qrCodeParagrpahAlt: "If you didn't mean to log in then just ignore the prompt on your discord app.",
			MFATitle: 'Enter your MFA Code',
			login: 'Login',
			sendSMS: 'Send code via SMS',
			password: 'Password',
			rememberMe: 'Remember me:',
		},
		guild: {
			logoAlt: 'Logo for {{ guildName }}',
		},
		friendsAlt: 'Red Panda icon for friends tab',
	},
	pl_PL: {
		hello: 'cześć {{ name }}, jak się masz?',
		friends: 'Znajomi',

		error: 'Retrying in {{ time }}s',

		LoginPage: {
			logIn: 'Zaloguj się',
			qrCodeLogin: 'Zaloguj używając kodu QR',
			qrCodeParagraph: 'Zeskanuj kod używając aplikacji Discord na twoim telefonie',
			qrCodeParagrpahAlt: 'Jeżeli nie chciałeś się zalogować to zignoruj powiadomienie na twoim telefonie.',
			MFATitle: 'Wpisz twój kod wielokrotnej weryfikacji',
			login: 'Login',

			sendSMS: 'Wyślij kod SMS',
			password: 'Hasło',
			rememberMe: 'Zapamiętaj mnie:',
		},
		guild: {
			logoAlt: 'Logo gildii {{ guildName }}',
		},
		friendsAlt: 'Ikona czerwonej pandy dla zakładki znajomi',
	},
};

import { createChainedI18nContext } from '@solid-primitives/i18n';

const [I18nProvider, useI18nContext] = createChainedI18nContext(
	{
		dictionaries,
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
