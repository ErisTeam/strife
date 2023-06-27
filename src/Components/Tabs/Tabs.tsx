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
	const AppState: any = useAppState();
	const params = useParams();

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
	const AppState: any = useAppState();
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
				<img src={AppState.tabs[tabIndex].guildIcon} alt={'{server name} logo '} />
				{/* TODO: Add translation string to alt text */}
				<span>{AppState.tabs[tabIndex].channelName}</span>
			</A>
			<button
				onClick={async () => {
					if (
						AppState.tabs.length > 1 &&
						AppState.tabs[tabIndex].guildId == params.guildId &&
						AppState.tabs[tabIndex].channelId == params.channelId
					) {
						console.log('href: ', href);
						navigate(`/app/${AppState.tabs[0].guildId}/${AppState.tabs[0].channelId}`);
					}
					await API.removeTab(tabIndex);
				}}
			>
				X
			</button>
		</li>
	);
};

export default Tabs;
