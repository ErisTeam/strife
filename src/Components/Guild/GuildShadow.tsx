// SolidJS
import { Show, onCleanup, onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';

// Style
import style from './css.module.css';
import API from '../../API';
import { useTrans } from '../../Translation';

import { useDragDropContext } from '@thisbeyond/solid-dnd';
import { createSortable } from '@thisbeyond/solid-dnd';

import { Guild as TGuild } from '../../discord';

interface GuildProps {
	// index: number;
	className?: string;
	guild?: TGuild;
}

const GuildShadow = (props: GuildProps) => {
	const [t] = useTrans();

	if (!props.guild) return null;
	return (
		<li class={style.guild}>
			<button>
				<Show
					when={props.guild.properties.icon}
					fallback={<h1 class={style.fallbackText}>{API.getInitials(props.guild.properties.name)}</h1>}
				>
					<img src={props.guild.properties.icon} alt={t.guild.logoAlt({ guildName: props.guild.properties.name })} />
				</Show>
			</button>
		</li>
	);
};

export default GuildShadow;
