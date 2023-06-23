// API
import { A, useLocation, useParams } from '@solidjs/router';
import API from '../../API';
import { useAppState } from '../../AppState';
import { Tab } from '../../types';
import { Guild as GuildType, Channel, Relationship } from '../../discord';

// Components
import Guild from '../Guild/Guild';

// Style
import style from './Tabs.module.css';
import { For, createEffect } from 'solid-js';

interface TabsProps {
	className?: string;
}

const Tabs = (props: TabsProps) => {
	const AppState: any = useAppState();
	const params = useParams();

	return (
		<nav class={[props.className, style.tabs].join(' ')}>
			<ul>
				<For each={AppState.tabs()}>{(tab) => <TabItem data={tab} />}</For>
			</ul>
		</nav>
	);
};
interface TabProps {
	className?: string;
	data: Tab;
}
const TabItem = (props: TabProps) => {
	const location = useLocation();
	const href = `/app/${props.data.guildId}/${props.data.channelId}`;
	return (
		<li class={[props.className, style.tab].join(' ')}>
			<A
				classList={{
					[style.active]: location.pathname == href,
				}}
				href={href}
			>
				{props.data.channelName}
			</A>
		</li>
	);
};

export default Tabs;
