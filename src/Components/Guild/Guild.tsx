// SolidJS
import { onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';
import { GuildType, ChannelType } from '../../types';

// Style
import style from './Guild.module.css';
import { A } from '@solidjs/router';

interface GuildProps {
	id: string;
	className?: string;
}

const Guild = (props: GuildProps) => {
	const AppState: any = useAppState();

	const guild = AppState.userGuilds().find((x: GuildType) => x.id === props.id);

	return (
		<li class={style.li}>
			<A
				class={style.guild}
				onClick={() => {
					AppState.setCurrentGuild(guild);
				}}
				href={`./${props.id}/${guild.systemChannelId}`}
			>
				<img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`} alt={guild.name} />
			</A>
			<span class={style.span}>{guild.name}</span>
		</li>
	);
};

export default Guild;
