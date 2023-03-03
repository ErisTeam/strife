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
			<a href={props.data.id}>{props.data.name}</a>
		</li>
	);
};

export default Channel;
