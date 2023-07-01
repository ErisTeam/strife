// API
import { A, useLocation, useNavigate, useParams } from '@solidjs/router';
import API from '../../API';
import { useAppState } from '../../AppState';
import { Tab } from '../../types';
import { Guild as GuildType, Channel, Relationship } from '../../discord';

// Components
import Guild from '../Guild/Guild';

// Style
import style from './Tabs.module.css';
import { Accessor, For, Index, createEffect, createSignal } from 'solid-js';

interface TabsProps {
	className?: string;
}

const Tabs = (props: TabsProps) => {
	const AppState = useAppState();

	return (
		<nav class={[props.className, style.tabs].join(' ')}>
			<ul>
				<Index each={AppState.tabs}>{(tab, index) => <TabItem tabIndex={index} />}</Index>
			</ul>
		</nav>
	);
};
interface TabProps {
	className?: string;
	tabIndex: number;
}
const TabItem = ({ className, tabIndex }: TabProps) => {
	const AppState = useAppState();
	const params = useParams();

	const location = useLocation();
	console.log(AppState.tabs[tabIndex]);
	const navigate = useNavigate();
	const [href, setHref] = createSignal('');

	createEffect(() => {
		setHref(`/app/${AppState.tabs[tabIndex].guildId}/${AppState.tabs[tabIndex].channelId}`);
	}, [AppState.tabs[tabIndex].guildId, AppState.tabs[tabIndex].channelId]);

	return (
		<li class={[className, style.tab].join(' ')}>
			<A
				classList={{
					[style.active]: location.pathname == href(),
				}}
				href={href()}
			>
				<img
					src={AppState.tabs[tabIndex].guildIcon}
					alt={AppState.t.guild.logoAlt({ guildName: AppState.tabs[tabIndex].guildName })}
				/>
				{/* TODO: Add translation string to alt text */}
				<span>{AppState.tabs[tabIndex].channelName}</span>
			</A>
			<button
				onClick={() => {
					// 						navigate(`/app/${AppState.tabs[0].guildId}/${AppState.tabs[0].channelId}`);

					if (
						AppState.tabs[tabIndex].guildId == params.guildId &&
						AppState.tabs[tabIndex].channelId == params.channelId
					) {
						API.removeTab(tabIndex);
						if (AppState.tabs.length == 0) {
							navigate(`/app`);
						} else if (AppState.tabs[tabIndex - 1]) {
							navigate(`/app/${AppState.tabs[tabIndex - 1].guildId}/${AppState.tabs[tabIndex - 1].channelId}`);
						} else if (AppState.tabs[0]) {
							navigate(`/app/${AppState.tabs[0].guildId}/${AppState.tabs[0].channelId}`);
						}
					} else {
						API.removeTab(tabIndex);
					}
				}}
			>
				X
			</button>
		</li>
	);
};

export default Tabs;
