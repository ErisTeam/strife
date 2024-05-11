import {
	AreaChart,
	Bell,
	Bug,
	CalendarPlus,
	Check,
	ChevronDown,
	FolderGit,
	FolderPlus,
	PlusCircle,
	Rocket,
	Settings,
	Shield,
	UserCog2,
	UserPlus2,
} from 'lucide-solid';
import { Guild } from '../../types/Guild';
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
					<button>
						<div class={style.icon}>
							<Rocket />
						</div>
						<span>Server Boost</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<UserPlus2 />
						</div>
						<span>Invite People</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<Settings />
						</div>
						<span>Server Settings</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<AreaChart />
						</div>
						<span>Server Insights</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<PlusCircle />
						</div>
						<span>Create Channel</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<FolderPlus />
						</div>
						<span>Create Category</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							{' '}
							<CalendarPlus />
						</div>
						<span>Create Event</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<FolderGit />
						</div>
						<span>App Directory</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<Check />
						</div>
						<span>Show All Channels</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<Bell />
						</div>
						<span>Notification Settings</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<Shield />
						</div>
						<span>Privacy Settings</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<UserCog2 />
						</div>
						<span>Edit Server Profile</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<Check />
						</div>
						<span>Hide Muted Channels</span>
					</button>
				</li>
				<li>
					<button>
						<div class={style.icon}>
							<Bug />
						</div>
						<span>Report Raid</span>
					</button>
				</li>
			</ol>
		</div>
	);
}
export default ChannelTitle;
