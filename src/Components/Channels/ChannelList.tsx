// SolidJS
import { createSignal, onMount, For, createEffect, Show, JSXElement, JSX, createMemo } from 'solid-js';

// API
import { useAppState } from '../../AppState';
``;
import Relationship from '../Relationship/Relationship';
// Components
import ChannelCategory from './ChannelCategory';

//Style
import style from './css.module.css';
import Channel from './Channel';
import { Guild } from '../../discord';
import List from '../List/List';

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
					</ChannelCategory>
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
		<List title={(AppState.currentGuild() as Guild).properties.name} className={props.className}>
			{channels()}
		</List>
	);
};
export default ChannelList;
