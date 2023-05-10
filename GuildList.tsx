// SolidJS
import { onMount, For } from 'solid-js';

// API
import API from '../../API';
import { useAppState } from '../../AppState';

// Components
import Guild from '../Guild/Guild';

// Style
import style from './GuildList.module.css';
import { useTrans } from '../../Translation';
import style2 from '../Guild/Guild.module.css';

interface GuildListProps {
	className?: string;
}

const GuildList = (props: GuildListProps) => {
	const AppState: any = useAppState();

	onMount(async () => {
		API.updateGuilds();
	});
	const [t] = useTrans();

	return (
		<nav class={[props.className, style.guildList].join(' ')}>
			<ul>
				<li class={style2.li}>
					<button
						class={style2.guild}
						onClick={() => {
							if (AppState.currentGuild() !== 'friends') {
								API.updateRelationships();
								AppState.setCurrentGuild('friends');
							} else {
								AppState.setCurrentGuild(null);
							}
						}}
					>
						<img
							src={`https://variety.com/wp-content/uploads/2021/07/Rick-Astley-Never-Gonna-Give-You-Up.png?w=681&h=383&crop=1`}
							alt={t.friends()}
						/>
					</button>
					<span class={style2.span}>{t.friends()}</span>
				</li>
				<li class={style.divider} />
				<For each={AppState.userGuilds()}>{(guild) => <Guild id={guild.id} />}</For>
			</ul>
		</nav>
	);
};

export default GuildList;
