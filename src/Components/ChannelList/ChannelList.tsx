// SolidJS
import { createSignal, onMount, For } from 'solid-js';

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
	const AppState: any = useAppState();

	const [categories, setCategories] = createSignal<ChannelType[]>([]);
	const [channels, setChannels] = createSignal<ChannelType[]>([]);

	onMount(async () => {
		setCategories(AppState.currentGuild().channels.filter((channel: ChannelType) => channel.type === 4));

		setCategories(categories().sort((a, b) => a.position - b.position));

		setChannels(AppState.currentGuild.channels.filter((channel: ChannelType) => channel.type !== 4));
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
