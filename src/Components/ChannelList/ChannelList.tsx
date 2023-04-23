// SolidJS
import { createSignal, onMount, For, createEffect, Show } from 'solid-js';

// API
import { useAppState } from '../../AppState';
import { Channel } from '../../types';
import Relationship from '../Relationship/Relationship';
// Components
import ChannelCategory from '../ChannelCategory/ChannelCategory';

//Style
import style from './ChannelList.module.css';

interface ChannelListProps {
	className?: string;
}

const ChannelList = (props: ChannelListProps) => {
	const [categories, setCategories] = createSignal<Channel[]>([]);
	const [channels, setChannels] = createSignal<Channel[]>([]);
	const AppState: any = useAppState();
	createEffect(() => {
		if (AppState.currentGuild() == 'friends') return;
		setCategories(AppState.currentGuild()!.channels.filter((channel: Channel) => channel.type === 4));

		setCategories(categories().sort((a: any, b: any) => a.position - b.position));

		setChannels(AppState.currentGuild()!.channels.filter((channel: Channel) => channel.type !== 4));
	});
	return (
		<nav class={[props.className, style.channelList].join(' ')}>
			<ul>
				<Show when={AppState.currentGuild() !== 'friends'}>
					<For each={categories()}>
						{(category) => (
							<ChannelCategory
								data={category}
								id={category.id}
								childrenChannels={channels().filter((x: Channel) => x.parentId == category.id)}
							/>
						)}
					</For>
				</Show>
				<Show when={AppState.currentGuild() === 'friends'}>
					<For each={AppState.relationships()}>{(relationship) => <Relationship relationship={relationship} />}</For>
				</Show>
			</ul>
		</nav>
	);
};
export default ChannelList;
