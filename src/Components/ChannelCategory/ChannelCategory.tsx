// SolidJS
import { For } from 'solid-js';

// API
import { Channel as ChannelType } from '../../types';

// Components
import Channel from '../Channel/Channel';

// Style
import style from './ChannelCategory.module.css';

interface ChannelCategoryProps {
	id: string;
	className?: string;
	data: ChannelType;
	childrenChannels: ChannelType[];
}

const ChannelCategory = (props: ChannelCategoryProps) => {
	const channels = props.childrenChannels.sort((a, b) => a.position - b.position);

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
