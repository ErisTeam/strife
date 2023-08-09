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

export interface TextChannelTab extends Tab<Channel> {
	type: 'textChannel';
}

export type { Input, Button, TextArea, AppState };
