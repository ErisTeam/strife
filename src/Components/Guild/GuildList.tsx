// SolidJS
import { onMount, For, createResource } from 'solid-js';

// API
import API from '../../API';
import { useAppState } from '../../AppState';

// Components
import Guild from './Guild';

// Style
import style from './css.module.css';

import { DragDropProvider, DragDropSensors, DragOverlay, SortableProvider, closestCenter } from '@thisbeyond/solid-dnd';
import { createSignal } from 'solid-js';
import FriendsTab from './FriendsTab';

interface GuildListProps {
	className?: string;
}

const GuildList = (props: GuildListProps) => {
	const AppState = useAppState();

	const [guilds] = createResource(async () => {
		console.log('updating guilds');
		await API.updateGuilds();
		console.log(AppState.userGuilds);
		return AppState.userGuilds;
	});

	const [activeItem, setActiveItem] = createSignal(null);
	const ids = () => guilds().map((guild) => guild.properties.id);
	// const [items, setItems] = createSignal([1, 2, 3]);
	// const ids = () => items();
	const onDragStart = ({ draggable }) => setActiveItem(draggable.id);

	const onDragEnd = ({ draggable, droppable }) => {
		if (draggable && droppable) {
			const currentItems = ids();
			const fromIndex = currentItems.indexOf(draggable.id);
			const toIndex = currentItems.indexOf(droppable.id);
			if (fromIndex !== toIndex) {
				const updatedItems = currentItems.slice();
				updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
				const newGuilds = [];
				console.warn('HERE');
				for (let i = 0; i < updatedItems.length; i++) {
					console.log(updatedItems[i]);
					newGuilds.push(guilds().find((guild) => guild.properties.id === updatedItems[i]));
				}
				AppState.setUserGuilds(newGuilds);
			}
		}
	};
	{
		/* 
	
	<div class="column self-stretch">
		
	</div>

; */
	}
	//TODO: Switch friends tab to use the guild component
	return (
		<DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetector={closestCenter}>
			<DragDropSensors />
			<nav class={[props.className, style.guildList].join(' ')}>
				<ul>
					<FriendsTab />
					<li class={style.divider} />
					<SortableProvider ids={ids()}>
						<For each={guilds()}>{(guild) => <Guild guild={guild} />}</For>
					</SortableProvider>
				</ul>
			</nav>
			<DragOverlay>
				<div class="sortable">{activeItem()}</div>
			</DragOverlay>
		</DragDropProvider>
	);
};

export default GuildList;
