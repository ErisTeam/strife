// API
import { useNavigate } from '@solidjs/router';
import API from '../../API';
import { ChannelType } from '../../types';

// Style
import style from './Channel.module.css';
import { useAppState } from '../../AppState';
import { Tab } from '../../types';
interface ChannelProps {
	data: ChannelType;
}

const Channel = (props: ChannelProps) => {
	const AppState = useAppState();
	const navigate = useNavigate();
	return (
		<li class={style.channel}>
			<button
				onMouseDown={(e) => {
					e.preventDefault();
					// if middle click
					if (e.button === 1) {
						console.log('middle click', e.button);
						if (AppState.tabs().find((t: Tab) => t.channelId === props.data.id)) {
							console.error('Tab already exists!');
							navigate(`/app/${props.data.guildId}/${props.data.id}`);
							return;
						}
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
