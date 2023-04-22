// API
import { useNavigate, useParams } from '@solidjs/router';
import API from '../../API';
import { Channel as ChannelType } from '../../types';

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
	const params = useParams();
	return (
		<li class={style.channel}>
			<button
				onMouseDown={(e) => {
					e.preventDefault();
					if (e.button === 0) {
						console.log('left click', e.button);
						if (AppState.tabs().find((t: Tab) => t.channelId === props.data.id)) {
							navigate(`/app/${props.data.guildId}/${props.data.id}`);
							return;
						}
						if (AppState.tabs().length === 0) {
							API.addTab(props.data);
							navigate(`/app/${props.data.guildId}/${props.data.id}`);
							return;
						}
						API.replaceCurrentTab(props.data, params.channelId);
						navigate(`/app/${props.data.guildId}/${props.data.id}`);
					}

					if (e.button === 1) {
						console.log('middle click', e.button);
						if (AppState.tabs().find((t: Tab) => t.channelId === props.data.id)) {
							console.error('Tab already exists!');
							navigate(`/app/${props.data.guildId}/${props.data.id}`);
							return;
						}
						API.addTab(props.data);
						navigate(`/app/${props.data.guildId}/${props.data.id}`);
					}
				}}
			>
				{props.data.name}
			</button>
		</li>
	);
};

export default Channel;
