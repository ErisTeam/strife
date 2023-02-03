import { For } from 'solid-js';
import Channel from '../Channel/Channel';
import { ChannelType } from '../../discord';
import style from './ChannelCategory.module.css';

interface ChannelCategoryProps {
	className?: string;
	childrenChannels: ChannelType[];
	id: string;
	data: ChannelType;
}

const ChannelCategory = (props: ChannelCategoryProps) => {
	const channels = props.childrenChannels.sort(
		(a, b) => a.position - b.position
	);

	return (
		<li class={[props.className, style.category].join(' ')}>
			<h1>{props.data.name}</h1>
			<ul>
				<For each={channels}>{(channel) => <Channel data={channel} />}</For>
			</ul>
		</li>
	);
};
export default ChannelCategory;
