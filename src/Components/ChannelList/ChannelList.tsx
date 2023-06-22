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
		let channelsRender: any[] = [];

		let children: any[] = [];

		AppState.currentGuild().channels.forEach((channel: ChannelType) => {
			if (channel.type === 4) {
				channelsRender.push(
					(
						<ChannelCategory id={channel.id} data={channel}>
							{children}
						</ChannelCategory>
					) as Element
				);
				children = [];
			} else {
				if (channel.parent_id) {
					children.push((<Channel data={channel} />) as Element);
				} else {
					channelsRender.push((<Channel data={channel} />) as Element);
				}
			}
		});
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
