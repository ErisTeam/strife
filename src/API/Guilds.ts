import { Channel } from '@/types/Channel';
import { Relationship } from '@/types/User';
import { CONSTANTS } from '@/Constants';
import { useAppState } from '@/AppState';
import { Guild } from '@/types/Guild';
import { oneTimeListener } from '@/test';
import { emit } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';
import { snowflake } from '@/types/utils';
export function getGuildIconFromChannel(channel: Channel): string {
	const AppState = useAppState();
	const guild = AppState.userGuilds.find((g) => g.properties.id === channel.guild_id);
	return guild.properties.icon;
}
export async function getGuilds(userId: string) {
	const res = oneTimeListener<{ type: string; user_id: string; data: { guilds: Guild[] } }>('general', 'guilds');
	await emit('getGuilds', { userId });

	return (await res).data.guilds;
}
export async function updateGuilds() {
	const AppState = useAppState();
	AppState.setUserGuilds([]);

	const guilds: Guild[] = await getGuilds(AppState.userId());
	console.log('guilds', guilds);
	//TODO: pietruszka pls make rust return channel with the guild_id already filled in       thx 😘
	guilds.forEach((guild) => {
		guild.channels.forEach((channel) => {
			channel.guild_id = guild.properties.id;
		});
	});
	type ChannelWithChildren = Channel & { children?: Channel[] };

	guilds.forEach((guild) => {
		const categories: ChannelWithChildren[] = guild.channels.filter((channel) => !channel.parent_id);
		categories.forEach((category: ChannelWithChildren) => {
			category.children = guild.channels.filter((channel) => channel.parent_id == category.id);

			category.children.sort((a: Channel, b: Channel) => b.type - a.type || b.position - a.position);
		});

		categories.sort((a: ChannelWithChildren, b: ChannelWithChildren) => a.type - b.type || a.position - b.position);
		guild.channels = [];
		categories.forEach((channel: ChannelWithChildren) => {
			guild.channels.push(channel);
			if (channel.children) {
				guild.channels = guild.channels.concat(channel.children);
			}
		});

		if (guild.properties.icon) {
			guild.properties.icon = `https://cdn.discordapp.com/icons/${guild.properties.id}/${guild.properties.icon}.webp?size=96`;
		}
	});
	console.log(guilds);
	AppState.setUserGuilds(guilds);
}
export async function requestLazyGuilds(
	userId: string,
	guildId: string,
	options: {
		typing?: boolean;
		threads?: boolean;
		activities?: boolean;
		channels?: {
			[key: snowflake]: [number, number];
		};
		members?: boolean;
	},
) {
	await invoke('request_lazy_guilds', {
		guildId: guildId,
		userId: userId,
		typing: options.typing,
		threads: options.threads,
		activities: options.activities,
		channels: options.channels,
		members: options.members,
	});
}
export function addAdditionalGuildDataToState(guildId: string) {
	const AppState = useAppState();
	let data = {
		t: 'GUILD_MEMBER_LIST_UPDATE',
		s: 4,
		op: 0,
		d: {
			ops: [
				{
					range: [0, 99],
					op: 'SYNC',
					items: [
						{ group: { id: '1085477548579885096' } },
						{
							member: {
								user: {
									username: 'frytak',
									public_flags: 256,
									id: '362958640656941056',
									global_name: 'Frytak',
									display_name: 'Frytak',
									discriminator: '0',
									bot: false,
									avatar_decoration_data: null,
									avatar: '5f835ccc139450e2faab481b031024f8',
								},
								roles: [
									'1085503068604473345',
									'1085477548579885096',
									'1085480348151984169',
									'1085499473335160842',
									'1085501759365075026',
									'1085480935975297046',
									'1159435068071231549',
								],
								presence: {
									user: { id: '362958640656941056' },
									status: 'idle',
									client_status: { mobile: 'idle' },
									broadcast: null,
									activities: [],
								},
								premium_since: null,
								pending: false,
								nick: null,
								mute: false,
								joined_at: '2023-03-14T09:25:29.383000+00:00',
								flags: 0,
								deaf: false,
								communication_disabled_until: null,
								avatar: null,
							},
						},
						{
							member: {
								user: {
									username: 'gami13',
									public_flags: 0,
									id: '309689147855994880',
									global_name: 'Gami',
									display_name: 'Gami',
									discriminator: '0',
									bot: false,
									avatar_decoration_data: null,
									avatar: '1f1dcb1c21bb4559387efeb4701771a0',
								},
								roles: [
									'1085499581766307910',
									'1085477548579885096',
									'1085480348151984169',
									'1085499473335160842',
									'1085499530432237588',
									'1085480935975297046',
								],
								presence: {
									user: { id: '309689147855994880' },
									status: 'dnd',
									client_status: { mobile: 'dnd' },
									broadcast: null,
									activities: [],
								},
								premium_since: null,
								pending: false,
								nick: null,
								mute: false,
								joined_at: '2023-03-14T17:44:10.498000+00:00',
								flags: 0,
								deaf: false,
								communication_disabled_until: null,
								avatar: null,
							},
						},
						{ group: { id: '1085479289899712573' } },
						{
							member: {
								user: {
									username: '.sekafi',
									public_flags: 0,
									id: '592396080553918469',
									global_name: 'SeKaFi',
									display_name: 'SeKaFi',
									discriminator: '0',
									bot: false,
									avatar_decoration_data: null,
									avatar: '88dffd6dc1ad2df980a248c982e76ffc',
								},
								roles: ['1085503068604473345', '1085479289899712573'],
								presence: {
									user: { id: '592396080553918469' },
									status: 'online',
									client_status: { desktop: 'online' },
									broadcast: null,
									activities: [
										{
											type: 4,
											state: 'Gami to Furras',
											name: 'Custom Status',
											id: 'custom',
											created_at: 1699388460046,
										},
										{
											type: 0,
											timestamps: { start: 1699388459612 },
											name: 'Counter-Strike 2',
											id: '4d08c09fce7cfd3b',
											created_at: 1699388460046,
											application_id: '1158877933042143272',
										},
									],
								},
								premium_since: null,
								pending: false,
								nick: null,
								mute: false,
								joined_at: '2023-03-14T18:51:18.249000+00:00',
								flags: 0,
								deaf: false,
								communication_disabled_until: null,
								avatar: null,
							},
						},
						{ group: { id: 'online' } },
						{
							member: {
								user: {
									username: 'pietruszka132',
									public_flags: 0,
									id: '1046132529964519524',
									global_name: 'pietruszka132',
									display_name: 'pietruszka132',
									discriminator: '0',
									bot: false,
									avatar_decoration_data: null,
									avatar: null,
								},
								roles: [],
								presence: {
									user: { id: '1046132529964519524' },
									status: 'online',
									client_status: { web: 'online' },
									broadcast: null,
									activities: [
										{
											type: 4,
											state: 'Gami to Furras',
											name: 'Custom Status',
											id: 'custom',
											created_at: 1699389564799,
										},
									],
								},
								premium_since: null,
								pending: false,
								nick: null,
								mute: false,
								joined_at: '2023-07-26T16:55:16.131000+00:00',
								flags: 0,
								deaf: false,
								communication_disabled_until: null,
								avatar: null,
							},
						},
						{ group: { id: 'offline' } },
						{
							member: {
								user: {
									username: 'arai11',
									public_flags: 64,
									id: '711005668613554286',
									global_name: 'Arai11',
									display_name: 'Arai11',
									discriminator: '0',
									bot: false,
									avatar_decoration_data: null,
									avatar: '4311f2a3083260ba3b9cc99b9223bca7',
								},
								roles: ['1159435068071231549', '1085480935975297046'],
								presence: {
									user: { id: '711005668613554286' },
									status: 'offline',
									client_status: {},
									broadcast: null,
									activities: [],
								},
								premium_since: null,
								pending: false,
								nick: null,
								mute: false,
								joined_at: '2023-03-15T09:45:16.626000+00:00',
								flags: 0,
								deaf: false,
								communication_disabled_until: null,
								avatar: null,
							},
						},
						{
							member: {
								user: {
									username: 'Bocik',
									public_flags: 0,
									id: '413669201396367361',
									global_name: null,
									display_name: null,
									discriminator: '7567',
									bot: true,
									avatar_decoration_data: null,
									avatar: '018ac0041678d70e246ebec53f849e9a',
								},
								roles: ['1158478677655433330'],
								presence: {
									user: { id: '413669201396367361' },
									status: 'offline',
									client_status: {},
									broadcast: null,
									activities: [],
								},
								premium_since: null,
								pending: false,
								nick: null,
								mute: false,
								joined_at: '2023-10-02T19:00:40.368000+00:00',
								flags: 0,
								deaf: false,
								communication_disabled_until: null,
								avatar: null,
							},
						},
						{
							member: {
								user: {
									username: 'pietruszka123',
									public_flags: 0,
									id: '413428675866787863',
									global_name: 'pietruszka123',
									display_name: 'pietruszka123',
									discriminator: '0',
									bot: false,
									avatar_decoration_data: null,
									avatar: '29280468611f0324eb02190d181f606c',
								},
								roles: ['1085477548579885096', '1085480348151984169', '1085499530432237588', '1085502363005112341'],
								presence: {
									user: { id: '413428675866787863' },
									status: 'offline',
									client_status: {},
									broadcast: null,
									activities: [],
								},
								premium_since: null,
								pending: false,
								nick: null,
								mute: false,
								joined_at: '2023-03-14T17:31:56.484000+00:00',
								flags: 0,
								deaf: false,
								communication_disabled_until: null,
								avatar: null,
							},
						},
					],
				},
			],
			online_count: 4,
			member_count: 7,
			id: 'everyone',
			guild_id: '1085131579652845609',
			groups: [
				{ id: '1085477548579885096', count: 2 },
				{ id: '1085479289899712573', count: 1 },
				{ id: 'online', count: 1 },
				{ id: 'offline', count: 3 },
			],
		},
	};
	let newData = {
		online_count: data.d.online_count,
		member_count: data.d.member_count,
		id: data.d.id,
		guild_id: data.d.guild_id,
		groups: [],
		recipients: data.d.ops[0].items,
	};
	data.d.groups.forEach((group) => {
		newData.groups.push({ id: group.id, count: group.count, name: '' });
	});
	let guild;
	for (let j = 0; j < AppState.userGuilds.length; j++) {
		console.log('in for', AppState.userGuilds[j].properties.id, guildId);
		if (AppState.userGuilds[j].properties.id == guildId) {
			guild = AppState.userGuilds[j];
			break;
		}
	}
	for (let i = 0; i < newData.groups.length; i++) {
		if (newData.groups[i].id == 'online' || newData.groups[i].id == 'offline') {
			newData.groups[i].name = newData.groups[i].id;
		} else {
			const role = guild.roles.find((role) => role.id == newData.groups[i].id);
			if (role) {
				newData.groups[i].name = role.name;
			}
			console.log('role', role);
		}
	}
	AppState.setOpenedGuildsAdditionalData(newData.guild_id, newData);
	console.log('Added additional data to state', AppState.openedGuildsAdditionalData);
}
