//TODO: move discord types to diffrent file

type AppState = 'LoginScreen' | 'Application' | 'Dev';

type Input = 'text' | 'number' | 'email' | 'password' | 'search' | 'hidden' | string;
type Button = 'button' | 'submit' | 'reset';
type TextArea = 'soft' | 'hard' | 'off';

type Tab = {
	guildId: string | null;
	channelId: string;
	guildIcon: string | null;
	channelName: string | null;
	guildName: string | null; // if it's a dm channel, this should be empty or undefined or null
	channelType: number;
};

type Sticker = {};

export type { Input, Button, TextArea, Tab, AppState };
