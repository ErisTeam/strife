import { Component } from 'solid-js';
import { Channel } from './discord';

type AppState = 'LoginScreen' | 'Application' | 'Dev';

type Input = 'text' | 'number' | 'email' | 'password' | 'search' | 'hidden';
type Button = 'button' | 'submit' | 'reset';
type TextArea = 'soft' | 'hard' | 'off';

type TabTypes = 'textChannel' | 'voiceChannel' | 'other';
export interface Tab<T = object> {
	component: Component<T>;
	customTabComponent?: Component;
	title: string;
	icon?: string | Component;
	type: TabTypes;
	tabData?: T;
}

export interface TextChannelTab extends Tab<{ channelId: string; guildId: string }> {
	type: 'textChannel';
}

// type Tab = {
// 	guildId: string; // if it's a dm channel, set to null
// 	guildName: string; // if it's a dm channel, set to @me or similar we will come up with
// 	guildIcon?: string; // if it's a dm channel, set to user's avatar;

// 	channelId: string;
// 	channelName: string; // if it's a dm channel, set to the user's name;
// 	channelType: number;
// };

export type { Input, Button, TextArea, AppState };
