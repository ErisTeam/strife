// SolidJS
import { Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';

// Style
import style from './css.module.css';
import API from '../../API';
import { t } from '../../Translation';

import { Id, useDragDropContext } from '@thisbeyond/solid-dnd';
import { createSortable } from '@thisbeyond/solid-dnd';

import { Guild as TGuild } from '../../types/Guild';
type GuildProps = {
	// index: number;
	className?: string;
	guild?: TGuild;
	id?: Id;
};

const Guild = (props: GuildProps) => {
	const AppState = useAppState();

	let toolTipRef: HTMLElement;
	let ref: HTMLLIElement;
	const sortable = createSortable(props.id);
	const [state, actions] = useDragDropContext();

	function updateRelativeYPositon() {
		const boundingRect = ref.getBoundingClientRect();

		toolTipRef.style.top = `${boundingRect.top + window.scrollY + boundingRect.height / 2}px`;
	}

	onCleanup(() => {
		ref.parentElement?.parentElement?.removeEventListener('scroll', updateRelativeYPositon);
		window.removeEventListener('keydown', zoomChange);
	});
	onMount(() => {
		const boundingRect = ref.getBoundingClientRect();
		updateRelativeYPositon();
		window.addEventListener('keydown', zoomChange);
		toolTipRef.style.left = `${boundingRect.width}px`;

		ref.parentElement.parentElement.addEventListener('scroll', updateRelativeYPositon);
	});
	actions.onDragEnd(() => {
		updateRelativeYPositon();
	});

	function zoomChange(e: KeyboardEvent) {
		if (e.ctrlKey && (e.key === '=' || e.key === '-')) {
			updateRelativeYPositon();
		}
	}
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
					when={props.guild?.properties?.icon}
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
