//TODO: move discord types to diffrent file

import { Channel, Guild } from './discord';

type AppState = 'LoginScreen' | 'Application' | 'Dev';

type Input = 'text' | 'number' | 'email' | 'password' | 'search' | 'hidden' | string;
type Button = 'button' | 'submit' | 'reset';
type TextArea = 'soft' | 'hard' | 'off';

type Tab = {
	guildId: string; // if it's a dm channel, set to null
	guildName: string; // if it's a dm channel, set to @me or similar we will come up with
	guildIcon: string | undefined; // if it's a dm channel, set to user's avatar;

	channelId: string;
	channelName: string; // if it's a dm channel, set to the user's name;
	channelType: number;
};

type Sticker = {};

type ContextMenuData = {
	type: 'channel' | 'message' | 'user' | 'guild' | 'guildMember' | 'image' | 'video' | 'audio' | 'file' | 'other';
	channel?: Channel;
	message?: any; //TODO: Replace with Message type
	user?: any; //TODO: Replace with User type
	guild?: Guild;
	attachment?: any; //TODO: Replace with Attachment type
	children?: Element;
	x: number;
	y: number;
	isShow: boolean;
};
export type { Input, Button, TextArea, Tab, AppState, Sticker, ContextMenuData };
