import { For, Show, createResource, createSignal } from 'solid-js';
import API from '../../../API';
import { useAppState } from '../../../AppState';
import GuildList from '../../../Components/GuildList/GuildList';
import MessageTest from '../../Messages/MessageTest';
import { GuildType } from '../../../discord';

import buttons from '../../../Styles/Buttons.module.css';

export default () => {
	const AppState = useAppState();

	const [guilds, { refetch }] = createResource(async () => (await API.getGuilds()) || []);

	const [guild, setGuild] = createSignal<GuildType | null>(null);
	const [channel, setChannel] = createSignal<any | null>(null);

	return (
		<div>
			<For each={guilds()}>
				{(guild) => (
					<button class={buttons.default} onclick={() => setGuild(guild)}>
						{guild.properties.name}
					</button>
				)}
			</For>
			<Show when={guild()}>
				<For each={guild()?.channels}>
					{(channel) => {
						switch (channel.type) {
							case 0:
								return (
									<button class={buttons.default} onclick={() => setChannel(channel)}>
										{channel.name}
									</button>
								);
							case 2:
								return (
									<button class={buttons.default} onclick={() => setChannel(channel)}>
										{channel.name} (Voice)
									</button>
								);
							case 4:
								return <span>{channel.name}</span>;

							default:
								return <span>{JSON.stringify(channel)}</span>;
						}
					}}
				</For>
				<Show when={channel()}>
					<MessageTest channelId={channel().id} guildId={guild()?.properties.id}></MessageTest>
				</Show>
			</Show>
		</div>
	);
};
