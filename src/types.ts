import { Component } from 'solid-js';
import Chat from './Components/Chat/Chat';
import WelcomeTab from './Components/Tabs/WelcomeTab';
import SettingsPage from './Components/Settings/Settings';

type AppState = 'LoginScreen' | 'Application' | 'Dev';

type Input = 'text' | 'number' | 'email' | 'password' | 'search' | 'hidden';
type Button = 'button' | 'submit' | 'reset';
type TextArea = 'soft' | 'hard' | 'off';

// type TabTypes = 'textChannel' | 'voiceChannel' | 'other';
//When saving tabs to file you just save the key of the component
export const TabComponents = {
	textChannel: Chat,
	welcomeTab: WelcomeTab,
	settings: SettingsPage,
};

export interface Tab {
	component: keyof typeof TabComponents;
	title: string;
	icon?: string | Component;
	channelId?: string;
	guildId?: string;
	[x: string]: any; //TODO: make better type checking
}

type TabsFile = {
	tabs: Tab[];
	order: number[];
	current: number;
};
export type { AppState, Button, Input, TabsFile, TextArea };
