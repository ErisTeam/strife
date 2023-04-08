// SolidJS
import { onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';
import { GuildType } from '../types';

// Style
import style from './Guild.module.css';
import { A } from '@solidjs/router';

interface GuildProps {
	id: string;
}

const Guild = (props: GuildProps) => {
	const AppState: any = useAppState();

	const guild = AppState.userGuilds().find((x: GuildType) => x.id === props.id);

	return (
		<li>
			<A
				class={style.guild}
				onClick={() => {
					AppState.setCurrentGuild(guild);
					console.log(AppState.currentGuild().channels);
				}}
				href={`./${props.id}/${guild.systemChannelId}`}
			>
				<img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`} alt={guild.name} />
			</A>
		</li>
	);
};

export default Guild;
