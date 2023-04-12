// SolidJS
import { onMount, For } from 'solid-js';

// API
import API from '../../API';
import { useAppState } from '../../AppState';

// Components
import Guild from '../Guild/Guild';

// Style
import style from './GuildList.module.css';

interface GuildListProps {
	className?: string;
}

const GuildList = (props: GuildListProps) => {
	const AppState: any = useAppState();

	onMount(async () => {
		API.updateGuilds();
	});

	return (
		<nav class={[props.className, style.guildList].join(' ')}>
			<ul>
				<For each={AppState.userGuilds()}>{(guild) => <Guild id={guild.id} />}</For>
			</ul>
		</nav>
	);
};

export default GuildList;
