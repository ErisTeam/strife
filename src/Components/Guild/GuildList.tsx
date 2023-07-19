// SolidJS
import { onMount, For, createResource } from 'solid-js';

// API
import API from '../../API';
import { useAppState } from '../../AppState';

// Components
import Guild from './Guild';

// Style
import style from './css.module.css';

interface GuildListProps {
	className?: string;
}

const GuildList = (props: GuildListProps) => {
	const AppState = useAppState();

	const [guilds] = createResource(async () => {
		console.log('updating guilds');
		await API.updateGuilds();
		console.log(AppState.userGuilds);
		return AppState.userGuilds;
	});

	return (
		<nav class={[props.className, style.guildList].join(' ')}>
			<ul>
				<Guild index={-1} />
				<li class={style.divider} />
				<For each={guilds()}>{(guild, index) => <Guild index={index()} />}</For>
			</ul>
		</nav>
	);
};

export default GuildList;
