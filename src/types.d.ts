//TODO: move discord types to diffrent file

type AppState = 'LoginScreen' | 'Application' | 'Dev';

type Input = 'text' | 'number' | 'email' | 'password' | 'search' | 'hidden' | string;
type Button = 'button' | 'submit' | 'reset';
type TextArea = 'soft' | 'hard' | 'off';

type Tab = {
	guildId: string; // if it's a dm channel, set to null
	guildName: string; // if it's a dm channel, set to @me or similar we will come up with
	guildIcon: string | null | undefined; // if it's a dm channel, set to user's avatar;

	channelId: string;
	channelName: string; // if it's a dm channel, set to the user's name;
	channelType: number;
};

type Sticker = {};

export type { Input, Button, TextArea, Tab, AppState };
