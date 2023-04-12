// API
import { A } from '@solidjs/router';
import API from '../../API';
import { useAppState } from '../../AppState';
import { GuildType, ChannelType, Tab } from '../../types';

// Components
import Guild from '../Guild/Guild';

// Style
import style from './Tabs.module.css';
import { For } from 'solid-js';

interface TabsProps {
	className?: string;
}

const Tabs = (props: TabsProps) => {
	const AppState: any = useAppState();

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
		<li class={props.className}>
			<A href={'/app/' + props.data.guildId + '/' + props.data.channelId}>{props.data.channelName}</A>
		</li>
	);
};

export default Tabs;
