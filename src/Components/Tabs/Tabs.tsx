// API
import { A, useParams } from '@solidjs/router';
import API from '../../API';
import { useAppState } from '../../AppState';
import { Guild as GuildType, Channel, Tab } from '../../types';

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
	return (
		<li class={[props.className, style.tab].join(' ')}>
			<A href={'/app/' + props.data.guildId + '/' + props.data.channelId}>{props.data.channelName}</A>
		</li>
	);
};

export default Tabs;
