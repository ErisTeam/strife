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
	guild: TGuild;
}

const Guild = (props: GuildProps) => {
	const [state] = useDragDropContext();
	const sortable = createSortable(props.guild.properties.id);
	const AppState = useAppState();
	const [t] = useTrans();

	let toolTipRef: HTMLElement;
	let ref: HTMLLIElement;

	function updateRelativeYPositon() {
		console.log('updating relative position');
		const boundingRect = ref.getBoundingClientRect();
		toolTipRef.style.top = `${boundingRect.top + window.scrollY + boundingRect.height / 2}px`;
	}
	onMount(() => {
		const boundingRect = ref.getBoundingClientRect();
		updateRelativeYPositon();
		toolTipRef.style.left = `${boundingRect.width}px`;

		ref.parentElement.parentElement.addEventListener('scroll', updateRelativeYPositon);
	});
	onCleanup(() => {
		ref.parentElement.parentElement.removeEventListener('scroll', updateRelativeYPositon);
	});

	return (
		<li
			use:sortable
			class={style.guild}
			classList={{
				[style.opacity]: sortable.isActiveDraggable,
				[style.transform]: !!state.active.draggable,
			}}
			ref={ref}
		>
			<button
				onclick={() => {
					if (AppState.currentGuild() !== props.guild) {
						AppState.setCurrentGuild(props.guild);
					} else {
						AppState.setCurrentGuild(null);
					}
				}}
			>
				<Show
					when={props.guild.properties.icon}
					fallback={<h1 class={style.fallbackText}>{API.getInitials(props.guild.properties.name)}</h1>}
				>
					<img src={props.guild.properties.icon} alt={t.guild.logoAlt({ guildName: props.guild.properties.name })} />
				</Show>
			</button>
			<aside ref={toolTipRef}>{props.guild.properties.name}</aside>
		</li>
	);
};

export default Guild;
