import { ChevronDown } from 'lucide-solid';
import { Guild } from '../../discord';
import style from './css.module.css';
import { createSignal } from 'solid-js';
type GuildTitleProps = {
	guild: Guild;
};
function ChannelTitle(props: GuildTitleProps) {
	const [isFolded, setFolded] = createSignal(true);
	const listElements = 14;
	return (
		<div class={style.title}>
			<button
				onClick={() => {
					setFolded(!isFolded());
				}}
			>
				<h1>{props.guild.properties.name}</h1>
				<ChevronDown class={!isFolded() ? style.rotate : null} />
			</button>
			<ol style={`--elementCount: ${listElements}`} classList={{ [style.folded]: isFolded() }}>
				<li>
					<button>Server Boost</button>
				</li>
				<li>
					<button>Invite People</button>
				</li>
				<li>
					<button>Server Settings</button>
				</li>
				<li>
					<button>Server Insights</button>
				</li>
				<li>
					<button>Create Channel</button>
				</li>
				<li>
					<button>Create Category</button>
				</li>
				<li>
					<button>Create Event</button>
				</li>
				<li>
					<button>App Directory</button>
				</li>
				<li>
					<button>Show All Channel</button>
				</li>
				<li>
					<button>Notification Settings</button>
				</li>
				<li>
					<button>Privacy Settings</button>
				</li>
				<li>
					<button>Edit Server Profile</button>
				</li>
				<li>
					<button>Hide Muted Channels</button>
				</li>
				<li>
					<button>Report Raid</button>
				</li>
			</ol>
		</div>
	);
}
export default ChannelTitle;
