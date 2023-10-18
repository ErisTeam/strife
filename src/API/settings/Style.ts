import { createUniqueId } from 'solid-js';
import { SettingsCategory, SettingsEntry, SettingsGroup } from '../../Components/Settings/SettingsTypes';
import API from '../../API';

export const StyleIds = {
	BaseColors: {
		depth0: createUniqueId(),
		depth1: createUniqueId(),
		depth2: createUniqueId(),
		depth3: createUniqueId(),
		depth4: createUniqueId(),
		depth5: createUniqueId(),
		depth6: createUniqueId(),
		depth7: createUniqueId(),
		depth8: createUniqueId(),
		depth9: createUniqueId(),
	},

	WindowDecoration: {
		height: createUniqueId(),
		background: createUniqueId(),
	},
	Guilds: {
		background: createUniqueId(),
		fallbackBackground: createUniqueId(),
		dividerColor: createUniqueId(),
		tooltipBackground: createUniqueId(),
		beforeBackground: createUniqueId(),
		width: createUniqueId(),
	},
	Channels: {
		categoryText: createUniqueId(),
		iconColor: createUniqueId(),
		iconBackground: createUniqueId(),
		categoryRoundness: createUniqueId(),
	},
	Chat: {
		background: createUniqueId(),
		roundness: createUniqueId(),
	},
	Misc: {
		loadingBackground: createUniqueId(),
	},
};

const groups: SettingsGroup[] = [
	{
		title: 'Base Colors',
		description: 'Change the base colors of the app',
		entriesIds: [
			StyleIds.BaseColors.depth0,
			StyleIds.BaseColors.depth1,
			StyleIds.BaseColors.depth2,
			StyleIds.BaseColors.depth3,
			StyleIds.BaseColors.depth4,
			StyleIds.BaseColors.depth5,
			StyleIds.BaseColors.depth6,
			StyleIds.BaseColors.depth7,
			StyleIds.BaseColors.depth8,
			StyleIds.BaseColors.depth9,
		],
	},
	{
		title: 'Guilds',
		description: 'Change the style of the guilds',
		entriesIds: [
			StyleIds.Guilds.background,
			StyleIds.Guilds.fallbackBackground,
			StyleIds.Guilds.dividerColor,
			StyleIds.Guilds.tooltipBackground,
			StyleIds.Guilds.beforeBackground,
			StyleIds.Guilds.width,
		],
	},
	{
		title: 'Channels',
		description: 'Change the style of the channels',
		entriesIds: [
			StyleIds.Channels.categoryText,
			StyleIds.Channels.iconColor,
			StyleIds.Channels.iconBackground,
			StyleIds.Channels.categoryRoundness,
		],
	},
	{
		title: 'Window Decorations',
		description: 'Change the style of the window decorations',
		entriesIds: [StyleIds.WindowDecoration.height, StyleIds.WindowDecoration.background],
	},
	{
		title: 'Chat',
		description: 'Change the style of the chat',
		entriesIds: [StyleIds.Chat.background, StyleIds.Chat.roundness],
	},
	{
		title: 'Misc',
		description: 'Change the style of misc elements',
		entriesIds: [StyleIds.Misc.loadingBackground],
	},
];

export const StyleCategory: SettingsCategory = {
	title: 'Style',
	description: 'Change the style of the app',
	groups: groups,
	canBeLoadedFromFile: true,
};

export const StyleEntries: (SettingsEntry | (() => SettingsEntry))[] = [
	() => {
		return {
			id: StyleIds.Chat.background,
			title: 'Chat Background',
			description: 'The background of the chat',
			defaultValue: API.Style.getVariable('--chat-bgc'),
			type: 'ColorPicker',
		};
	},
	() => {
		const v = API.Style.getVariable(API.Style.CssVariables.Components.Chat.roundness);
		//get numbers
		const numbers = v.match(/\d+/g);
		//get units
		const units = v.slice(numbers[0].length);
		return {
			id: StyleIds.Chat.roundness,
			title: 'Chat Roundness',
			description: 'The roundness of the chat',
			defaultValue: {
				value: parseInt(numbers[0]),
				unit: units,
			},
			units: [...API.Style.Units.relative.slice(0, 2), 'px'],
			type: 'CssNumberProperty',
		};
	},
	() => {
		return {
			id: StyleIds.Misc.loadingBackground,
			title: 'Loading Background',
			description: 'The background when loading',
			defaultValue: API.Style.getVariable(API.Style.CssVariables.Components.Misc.loadingBackground),
			type: 'ColorPicker',
		};
	},
	() => ({
		id: StyleIds.Guilds.background,
		title: 'Guilds Background',
		description: 'The background of the guilds',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.Components.Guilds.background),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.Guilds.fallbackBackground,
		title: 'Guilds Fallback Background',
		description: 'The fallback background of the guilds',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.Components.Guilds.fallbackBackground),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.Guilds.dividerColor,
		title: 'Guilds Divider Color',
		description: 'The color of the divider in the guilds',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.Components.Guilds.dividerColor),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.Guilds.tooltipBackground,
		title: 'Guilds Tooltip Background',
		description: 'The color of the tooltip in the guilds',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.Components.Guilds.tooltipBackground),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.Guilds.beforeBackground,
		title: 'Guilds Before Background',
		description: 'The background of the before in the guilds',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.Components.Guilds.beforeBackground),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.Guilds.width,
		title: 'Guilds Width',
		description: 'The width of the guilds',
		defaultValue: API.Style.CssStringVariableToObject(
			API.Style.getVariable(API.Style.CssVariables.Components.Guilds.width),
		),
		type: 'CssNumberProperty',
		units: [...API.Style.Units.relative.slice(0, 2), 'px'],
	}),
	() => ({
		id: StyleIds.Channels.categoryText,
		title: 'Channels Category Text',
		description: 'The text color of the channels category',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.Components.Channels.categoryText),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.Channels.iconColor,
		title: 'Channels Icon Color',
		description: 'The icon color of the channels',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.Components.Channels.iconColor),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.Channels.iconBackground,
		title: 'Channels Icon Background',
		description: 'The icon background of the channels',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.Components.Channels.iconBackground),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.Channels.categoryRoundness,
		title: 'Channels Category Roundness',
		description: 'The roundness of the channels category',
		defaultValue: API.Style.CssStringVariableToObject(
			API.Style.getVariable(API.Style.CssVariables.Components.Channels.categoryRoundness),
		),
		type: 'CssNumberProperty',
		units: [...API.Style.Units.relative.slice(0, 2), 'px'],
	}),
	() => ({
		id: StyleIds.WindowDecoration.height,
		title: 'Window Decoration Height',
		description: 'The height of the window decoration',
		defaultValue: API.Style.CssStringVariableToObject(
			API.Style.getVariable(API.Style.CssVariables.Components.WindowDecoration.height),
		),
		type: 'CssNumberProperty',
		units: [...API.Style.Units.relative.slice(0, 2), 'px'],
	}),
	() => ({
		id: StyleIds.WindowDecoration.background,
		title: 'Window Decoration Background',
		description: 'The background of the window decoration',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.Components.WindowDecoration.background),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.BaseColors.depth0,
		title: 'Depth 0',
		description: 'The base color of depth 0',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.BaseColors.depth0),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.BaseColors.depth1,
		title: 'Depth 1',
		description: 'The base color of depth 1',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.BaseColors.depth1),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.BaseColors.depth2,
		title: 'Depth 2',
		description: 'The base color of depth 2',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.BaseColors.depth2),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.BaseColors.depth3,
		title: 'Depth 3',
		description: 'The base color of depth 3',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.BaseColors.depth3),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.BaseColors.depth4,
		title: 'Depth 4',
		description: 'The base color of depth 4',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.BaseColors.depth4),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.BaseColors.depth5,
		title: 'Depth 5',
		description: 'The base color of depth 5',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.BaseColors.depth5),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.BaseColors.depth6,
		title: 'Depth 6',
		description: 'The base color of depth 6',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.BaseColors.depth6),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.BaseColors.depth7,
		title: 'Depth 7',
		description: 'The base color of depth 7',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.BaseColors.depth7),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.BaseColors.depth8,
		title: 'Depth 8',
		description: 'The base color of depth 8',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.BaseColors.depth8),
		type: 'ColorPicker',
	}),
	() => ({
		id: StyleIds.BaseColors.depth9,
		title: 'Depth 9',
		description: 'The base color of depth 9',
		defaultValue: API.Style.getVariable(API.Style.CssVariables.BaseColors.depth9),
		type: 'ColorPicker',
	}),
];
