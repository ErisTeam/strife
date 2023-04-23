// SolidJS
import { onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';
import { Guild as GuildType, Channel } from '../../types';

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
			<button
				class={style.guild}
				onClick={() => {
					if (AppState.currentGuild() !== guild) {
						AppState.setCurrentGuild(guild);
					} else {
						AppState.setCurrentGuild(null);
					}
				}}
			>
				<img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`} alt={guild.name} />
			</button>
			{/* <span class={style.span}>{guild.name}</span> */}
		</li>
	);
};

export default Guild;
