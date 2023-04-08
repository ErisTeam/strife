// API
import API from '../../API';
import { ChannelType } from '../../types';

// Style
import style from './Channel.module.css';

interface ChannelProps {
	data: ChannelType;
}

const Channel = (props: ChannelProps) => {
	return (
		<li class={style.channel}>
			<button
				onMouseDown={(e) => {
					e.preventDefault();
					// if middle click
					if (e.button === 1) {
						console.log('middle click', e.button);
						API.addTab(props.data);
					}
				}}
			>
				{props.data.name}
			</button>
		</li>
	);
};

export default Channel;
