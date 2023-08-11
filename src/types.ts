import { Component, JSX } from 'solid-js';
import Chat from './Components/Messages/Chat';
import WelcomeTab from './Components/Tabs/WelcomeTab';

type AppState = 'LoginScreen' | 'Application' | 'Dev';

type Input = 'text' | 'number' | 'email' | 'password' | 'search' | 'hidden';
type Button = 'button' | 'submit' | 'reset';
type TextArea = 'soft' | 'hard' | 'off';

// type TabTypes = 'textChannel' | 'voiceChannel' | 'other';
//When saving tabs to file you just save the key of the component
export const TabComponents: { [key: string]: () => JSX.Element } = {
	textChannel: Chat,
	welcomeTab: WelcomeTab,
};

export interface Tab {
	component: keyof typeof TabComponents;
	title: string;
	icon?: string | Component;

	guildId?: string;
	id: string; //in case of channel, it's the channel id, if for our use, use words
	position?: number;
}

export type { Input, Button, TextArea, AppState };
