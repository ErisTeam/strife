// SolidJS
import { createSignal, onMount, For, createEffect, Show, JSXElement } from 'solid-js';

// API
import { useAppState } from '../../AppState';
import { Channel as ChannelType } from '../../discord';
import Relationship from '../Relationship/Relationship';
// Components
import ChannelCategory from '../ChannelCategory/ChannelCategory';

//Style
import style from './ChannelList.module.css';
import Channel from '../Channel/Channel';

interface ChannelListProps {
	className?: string;
}

const ChannelList = (props: ChannelListProps) => {
	const AppState: any = useAppState();

	const [channelsRenderReady, setChannelsRenderReady] = createSignal([] as any[]);

	createEffect(() => {
		console.log('rendering channels');
		const channelsRender: any[] = [];

		let children: any[] = [];
		for (let i = AppState.currentGuild().channels.length - 1; i >= 0; i--) {
			if (AppState.currentGuild().channels[i].type === 4) {
				channelsRender.push(
					(
						<ChannelCategory id={AppState.currentGuild().channels[i].id} data={AppState.currentGuild().channels[i]}>
							{children}
						</ChannelCategory>
					) as Element
				);
				children = [];
			} else {
				if (AppState.currentGuild().channels[i].parent_id) {
					children.push((<Channel data={AppState.currentGuild().channels[i]} />) as Element);
				} else {
					channelsRender.push((<Channel data={AppState.currentGuild().channels[i]} />) as Element);
				}
			}
		}
		setChannelsRenderReady(channelsRender.toReversed());
	}, [AppState.currentGuild()]);

	return (
		<nav class={[props.className, style.channelList].join(' ')}>
			<ol>
				<Show when={AppState.currentGuild() !== 'friends'}>{channelsRenderReady()}</Show>
				<Show when={AppState.currentGuild() === 'friends'}>
					<For each={AppState.relationships()}>{(relationship) => <Relationship relationship={relationship} />}</For>
				</Show>
			</ol>
		</nav>
	);
};
export default ChannelList;
