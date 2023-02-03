import { Component, createSignal, Show, onMount, For } from 'solid-js';
import { useAppState } from '../../AppState';

import style from './ChannelList.module.css';
import { ChannelType } from '../../discord';
import ChannelCategory from '../ChannelCategory/ChannelCategory';
import API from '../../API';
import { useParams } from '@solidjs/router';
interface ChannelListProps {
	className?: string;
}

const ChannelList = (props: ChannelListProps) => {
	const params: any = useParams();
	const AppState: any = useAppState();
	const [categories, setCategories] = createSignal([] as ChannelType[]);
	const [channels, setChannels] = createSignal([] as ChannelType[]);
	onMount(async () => {
		console.log(AppState.currentGuildChannels());
		setCategories(
			AppState.currentGuildChannels().filter(
				(channel: ChannelType) => channel.type === 4
			)
		);
		setCategories(categories().sort((a, b) => a.position - b.position));
		setChannels(
			AppState.currentGuildChannels().filter(
				(channel: ChannelType) => channel.type !== 4
			)
		);
	});

	return (
		<nav class={[props.className, style.channelList].join(' ')}>
			<ul>
				<For each={categories()}>
					{(category) => (
						<ChannelCategory
							data={category}
							id={category.id}
							childrenChannels={channels().filter(
								(x: ChannelType) => x.parent_id == category.id
							)}
						/>
					)}
				</For>
			</ul>
		</nav>
	);
};
export default ChannelList;
