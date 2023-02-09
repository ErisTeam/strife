// SolidJS
import { A } from '@solidjs/router';

// API
import { ChannelType } from '../../discord';

// Style
import style from './Channel.module.css';

interface ChannelProps {
	data: ChannelType;
}

const Channel = (props: ChannelProps) => {
	return (
		<li class={style.channel}>
			<A href={props.data.id}>{props.data.name}</A>
		</li>
	);
};

export default Channel;
