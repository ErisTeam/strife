// SolidJS
import { createSignal, onMount, For, createEffect } from 'solid-js';

// API
import { useAppState } from '../../AppState';
import { ChannelType } from '../../types';

// Components
import ChannelCategory from '../ChannelCategory/ChannelCategory';

//Style
import style from './ChannelList.module.css';

interface ChannelListProps {
	className?: string;
}

const ChannelList = (props: ChannelListProps) => {
	const [categories, setCategories] = createSignal<ChannelType[]>([]);
	const [channels, setChannels] = createSignal<ChannelType[]>([]);
	const AppState: any = useAppState();
	createEffect(() => {
		setCategories(AppState.currentGuild()!.channels.filter((channel: ChannelType) => channel.type === 4));

		setCategories(categories().sort((a: any, b: any) => a.position - b.position));

		setChannels(AppState.currentGuild()!.channels.filter((channel: ChannelType) => channel.type !== 4));
	});
	return (
		<nav class={[props.className, style.channelList].join(' ')}>
			<ul>
				<For each={categories()}>
					{(category) => (
						<ChannelCategory
							data={category}
							id={category.id}
							childrenChannels={channels().filter((x: ChannelType) => x.parentId == category.id)}
						/>
					)}
				</For>
			</ul>
		</nav>
	);
};
export default ChannelList;
