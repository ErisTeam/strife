import { createEffect, createMemo, createUniqueId, onCleanup, onMount } from 'solid-js';
import { useAppState } from '../AppState';
import Settings from './Settings';
import { CssPropertyType, SettingsEntry } from '../Components/Settings/SettingsTypes';
import { produce } from 'solid-js/store';
import API from '../API';

const Units = {
	absolute: ['px', 'cm', 'mm', 'in', 'pt', 'pc'],
	relative: ['%', 'em', 'ex', 'ch', 'rem', 'lh', 'rlh', 'vw', 'vh', 'vmin', 'vmax', 'vb', 'vi', 'svw', 'lvw', 'dvw'],
};

const CssVariables = {
	BaseColors: {
		depth0: '--depth0',
		depth1: '--depth1',
		depth2: '--depth2',
		depth3: '--depth3',
		depth4: '--depth4',
		depth5: '--depth5',
		depth6: '--depth6',
		depth7: '--depth7',
		depth8: '--depth8',
		depth9: '--depth9',
	},
	Components: {
		WindowDecoration: {
			height: '--window-decoration-height',
			background: '--window-decoration-bgc',
		},

		Guilds: {
			background: '--guilds-bgc',
			fallbackBackground: '--guilds-fallback-bgc',
			dividerColor: '--guilds-divider-color',
			tooltipBackground: '--guilds-tooltip-bgc',
			beforeBackground: '--guilds-before-bgc',
			width: '--guilds-width',
		},
		Channels: {
			categoryText: '--channel-category-text',
			iconColor: '--channel-icon-color',
			iconBackground: '--channel-icon-bgc',
			categoryRoundness: '--channel-category-roundness',
			CategoryHoverOne: '--channel-category-hover-one',
			CategoryHoverTwo: '--channel-category-hover-two',

			listBackground: '--channel-list-bgc',
			listTileBackground: '--channel-list-tile-bgc',
			listTitleText: '--channel-list-title-color',
			listTitleIcon: '--channel-list-title-icon-color',
			listSeparator: '--channel-list-separator',

			gradientHoverOne: '--channel-gradient-hover-one',
			gradientHoverTwo: '--channel-gradient-hover-two',

			titleListBackground: '--channel-title-list-bgc',
			titleListRoundness: '--channel-title-list-roundness',
			listElementRoundness: '--channel-list-element-roundness',
			listIconBackground: '--channel-list-icon-bgc',
			titleListIconColor: '--channel-title-list-icon-color',
			titleListElementGradientOne: '--channel-title-list-element-gradient-one',
			titleListElementGradientTwo: '--channel-title-list-element-gradient-two',
			listRoundness: '--channel-list-roundness',

			friendListBackground: '--channel-friend-list-bgc',
			friendGradientHoverOne: '--channel-friend-gradient-hover-one',
			friendGradientHoverTwo: '--channel-friend-gradient-hover-two',
			friendStatusColor: '--channel-friend-status-color',
			friendNameColor: '--channel-friend-name-color',
			friendListSeparator: '--channel-friend-list-separator',

			textColor: '--channel-text-color',
		},
		Chat: {
			background: '--chat-bgc',
			roundness: '--chat-roundness',
		},
		Misc: {
			loadingBackground: '--loading-bgc',
		},
	},
};

export default {
	Units,
	CssVariables,
	start() {
		const CSSSettingsVariables = {
			[Settings.ids.Style.BaseColors.depth0]: CssVariables.BaseColors.depth0,
			[Settings.ids.Style.BaseColors.depth1]: CssVariables.BaseColors.depth1,
			[Settings.ids.Style.BaseColors.depth2]: CssVariables.BaseColors.depth2,
			[Settings.ids.Style.BaseColors.depth3]: CssVariables.BaseColors.depth3,
			[Settings.ids.Style.BaseColors.depth4]: CssVariables.BaseColors.depth4,
			[Settings.ids.Style.BaseColors.depth5]: CssVariables.BaseColors.depth5,
			[Settings.ids.Style.BaseColors.depth6]: CssVariables.BaseColors.depth6,
			[Settings.ids.Style.BaseColors.depth7]: CssVariables.BaseColors.depth7,
			[Settings.ids.Style.BaseColors.depth8]: CssVariables.BaseColors.depth8,
			[Settings.ids.Style.BaseColors.depth9]: CssVariables.BaseColors.depth9,

			[Settings.ids.Style.Chat.background]: CssVariables.Components.Chat.background,
			[Settings.ids.Style.Chat.roundness]: CssVariables.Components.Chat.roundness,

			[Settings.ids.Style.Guilds.background]: CssVariables.Components.Guilds.background,
			[Settings.ids.Style.Guilds.fallbackBackground]: CssVariables.Components.Guilds.fallbackBackground,
			[Settings.ids.Style.Guilds.dividerColor]: CssVariables.Components.Guilds.dividerColor,
			[Settings.ids.Style.Guilds.tooltipBackground]: CssVariables.Components.Guilds.tooltipBackground,
			[Settings.ids.Style.Guilds.beforeBackground]: CssVariables.Components.Guilds.beforeBackground,
			[Settings.ids.Style.Guilds.width]: CssVariables.Components.Guilds.width,

			[Settings.ids.Style.Channels.categoryText]: CssVariables.Components.Channels.categoryText,
			[Settings.ids.Style.Channels.iconColor]: CssVariables.Components.Channels.iconColor,
			[Settings.ids.Style.Channels.iconBackground]: CssVariables.Components.Channels.iconBackground,
			[Settings.ids.Style.Channels.categoryRoundness]: CssVariables.Components.Channels.categoryRoundness,

			[Settings.ids.Style.Misc.loadingBackground]: CssVariables.Components.Misc.loadingBackground,
		};
		const AppState = useAppState();

		onMount(() => {});

		const cachedEntries = createMemo(() => {
			return Object.entries(CSSSettingsVariables).map(([id, variable]) => {
				const entry = AppState.settings.entries.find((e) => e.id === id);
				return {
					index: AppState.settings.entries.findIndex((e) => e.id === id),
					entry: entry,
					variable: variable,
				};
			});
		});

		function updateSettingsEntry(event: any) {
			let entry = AppState.settings.entries.find((e) => e.id === event.detail.id);
			const variable = CSSSettingsVariables[event.detail.id];
			let property = document.body.style.getPropertyValue(variable);
			if (entry.value == null || (entry.value == entry.defaultValue && property == null)) {
				return;
			}
			console.log('a', entry, variable);
			let value = entry.value;
			switch (entry.type) {
				case 'CssNumberProperty':
					value = value.value + value.unit;
					break;
			}
			// if (value == entry.defaultValue) {
			// 	 document.body.style.removeProperty(variable);
			// 	 return;
			// }

			document.documentElement.style.setProperty(variable, value);
		}
		addEventListener('settingsChanged', updateSettingsEntry);

		onCleanup(() => {
			removeEventListener('settingsChanged', updateSettingsEntry);
		});

		// for (const entry of cachedEntries()) {
		// 	if (entry.index !== -1) {
		// 		let value = AppState.settings.entries[entry.index].value;
		// 		let property = document.body.style.getPropertyValue(entry.variable);
		// 		if (value == null || (value == entry.entry.defaultValue && property == null)) {
		// 			continue;
		// 		}
		// 		console.log('a', entry);
		// 		switch (entry.entry.type) {
		// 			case 'CssNumberProperty':
		// 				value = value.value + value.unit;
		// 				break;
		// 		}
		// 		if (value == entry.entry.defaultValue) {
		// 			document.body.style.removeProperty(entry.variable);
		// 			return;
		// 		}

		// 		document.body.style.setProperty(entry.variable, value);
		// 	}
		// }
	},
	CssStringVariableToObject(variable: string): CssPropertyType {
		let [value, unit] = variable.split(/([a-z]+)/);
		return {
			value: parseInt(value),
			unit: unit,
		};
	},
	//TODO: change name
	getVariable(variable: string) {
		return getComputedStyle(document.documentElement).getPropertyValue(variable);
	},
	hslToHex(h: number, s: number, l: number) {
		l /= 100;
		const a = (s * Math.min(l, 1 - l)) / 100;
		const f = (n: number) => {
			const k = (n + h / 30) % 12;
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0'); // convert to Hex and prefix "0" if needed
		};
		return `#${f(0)}${f(8)}${f(4)}`;
	},
	hslToHexCss(hsl: string) {
		let [h, s, l] = hsl
			.slice(4)
			.replaceAll('%', '')
			.replaceAll(' ', '')
			.split(',')
			.map((e) => parseInt(e));

		return this.hslToHex(h, s, l);
	},
};
