// SolidJS
import { onMount, For, createResource, Show, createEffect } from 'solid-js';

// API
import API from '../../API';
import { useAppState } from '../../AppState';

// Components
import Guild from './Guild';

// Style
import style from './css.module.css';

import {
	DragDropDebugger,
	DragDropProvider,
	DragDropSensors,
	DragEvent,
	DragOverlay,
	Id,
	SortableProvider,
	closestCenter,
} from '@thisbeyond/solid-dnd';
import { createSignal } from 'solid-js';
import FriendsTab from './FriendsTab';
import GuildShadow from './GuildShadow';

import { Guild as TGuild } from '../../discord';
interface GuildListProps {
	className?: string;
}
type Item = {
	id: Id;
	guild: TGuild;
};

const GuildList = (props: GuildListProps) => {
	const AppState = useAppState();

	onMount(() => {
		API.updateGuilds()
			.then(() => {
				const newItems = [];
				for (let i = 1; i <= AppState.userGuilds.length; i++) {
					newItems.push({ id: i, guild: AppState.userGuilds[i - 1] });
				}
				setItems(newItems);
			})
			.catch((err) => {
				console.error(err);
			});
	});

	const [items, setItems] = createSignal<Item[]>([]);

	const [activeItemId, setActiveItem] = createSignal(null);
	const ids = () => items().map((item) => item.id);

	const onDragStart = (event: DragEvent) => {
		setActiveItem(event.draggable.id);
		console.log(activeItemId());
	};

	function onDragEnd(event: DragEvent) {
		if (event.draggable && event.droppable) {
			const currentItems = ids();
			const fromIndex = currentItems.indexOf(event.draggable.id);
			const toIndex = currentItems.indexOf(event.droppable.id);
			if (fromIndex !== toIndex) {
				const updatedItems = currentItems.slice();
				updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));

				const newItems = [];
				for (let i = 0; i < updatedItems.length; i++) {
					newItems.push(items().find((item) => item.id === updatedItems[i]));
				}
				setItems(newItems);
				const newGuilds = [];
				for (let i = 0; i < newItems.length; i++) {
					newGuilds.push(newItems[i].guild);
				}

				AppState.setUserGuilds(newGuilds);
			}
		}
	}

	return (
		<DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd} collisionDetector={closestCenter}>
			<DragDropSensors />
			<nav class={[props.className, style.guildList].join(' ')}>
				<ol>
					<FriendsTab />
					<li class={style.divider} />
					<SortableProvider ids={ids()}>
						<For each={items()}>{(item) => <Guild guild={item.guild} id={item.id} />}</For>
					</SortableProvider>
				</ol>
			</nav>

			<DragOverlay>
				<GuildShadow guild={items().find((x) => x.id == activeItemId())?.guild} />
			</DragOverlay>
		</DragDropProvider>
	);
};

export default GuildList;
