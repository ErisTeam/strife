// SolidJS
import { onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';
import { GuildType } from '../../discord';

// Style
import style from './Guild.module.css';

interface GuildProps {
	id: string;
}

const Guild = (props: GuildProps) => {
	const AppState: any = useAppState();

	const guild = AppState.userGuilds().find((x: GuildType) => x.id === props.id);

	return (
		<li>
			<a class={style.guild} href={`${props.id}/${guild.system_channel_id}`}>
				<img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`} alt={guild.name} />
			</a>
		</li>
	);
};

export default Guild;
