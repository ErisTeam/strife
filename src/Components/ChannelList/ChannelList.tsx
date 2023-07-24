// SolidJS
import { createSignal, onMount, For, createEffect, Show, JSXElement, JSX, createMemo } from 'solid-js';

// API
import { useAppState } from '../../AppState';
``;
import Relationship from '../Friends/Friend';
// Components
import ChannelCategory from './ChannelListCategory';

//Style
import style from './css.module.css';
import Channel from './ChannelListElement';
import { Guild } from '../../discord';
import List from '../List/List';
import ChannelTitle from './ChannelTitle';

interface ChannelListProps {
	className?: string;
}

const ChannelList = (props: ChannelListProps) => {
	const AppState = useAppState();

	const channels = createMemo(() => {
		console.log('rendering channels');
		const channelsRender: JSX.Element[] = [];

		let children: JSX.Element[] = [];

		const currentGuild = AppState.currentGuild() as Guild;

		for (let i = currentGuild.channels.length - 1; i >= 0; i--) {
			//TODO: replace magic number
			if (currentGuild.channels[i].type === 4) {
				channelsRender.push(
					<ChannelCategory id={currentGuild.channels[i].id} data={currentGuild.channels[i]}>
						{children}
					</ChannelCategory>,
				);
				children = [];
			} else {
				if (currentGuild.channels[i].parent_id) {
					children.push((<Channel data={currentGuild.channels[i]} />) as Element);
				} else {
					channelsRender.push((<Channel data={currentGuild.channels[i]} />) as Element);
				}
			}
		}
		return channelsRender.reverse();
	});

	return (
		<nav class={[props.className, style.list].join(' ')}>
			<ChannelTitle guild={AppState.currentGuild() as Guild} />
			<ol>{channels()}</ol>
		</nav>
	);
};
export default ChannelList;
