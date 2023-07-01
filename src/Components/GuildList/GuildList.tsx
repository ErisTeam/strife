// SolidJS
import { onMount, For } from 'solid-js';

// API
import API from '../../API';
import { useAppState } from '../../AppState';

// Components
import Guild from '../Guild/Guild';

// Style
import style from './GuildList.module.css';

import style2 from '../Guild/Guild.module.css';

interface GuildListProps {
	className?: string;
}

const GuildList = (props: GuildListProps) => {
	const AppState = useAppState();

	onMount(() => {
		API.updateGuilds().catch((err) => console.error(err));
	});

	//TODO: Switch friends tab to use the guild component
	return (
		<nav class={[props.className, style.guildList].join(' ')}>
			<ul>
				<Guild index={-1} />
				<li class={style.divider} />
				<For each={AppState.userGuilds}>{(guild, index) => <Guild index={index()} />}</For>
			</ul>
		</nav>
	);
};

export default GuildList;
