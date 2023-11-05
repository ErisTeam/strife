// SolidJS
import { Show } from 'solid-js';

// Style
import style from './css.module.css';
import { t } from '../../Translation';

import { Guild as TGuild } from '../../types/Guild';
import { getInitials } from '@/API/Utils';

interface GuildProps {
	className?: string;
	guild?: TGuild;
}

const GuildShadow = (props: GuildProps) => {
	if (!props.guild) return <div>Null</div>;
	return (
		<li class={style.guild}>
			<button>
				<Show
					when={props.guild.properties.icon}
					fallback={<h1 class={style.fallbackText}>{getInitials(props.guild.properties.name)}</h1>}
				>
					<img src={props.guild.properties.icon} alt={t.guild.logoAlt({ guildName: props.guild.properties.name })} />
				</Show>
			</button>
		</li>
	);
};

export default GuildShadow;
