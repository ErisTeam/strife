import { For, createResource, onCleanup, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import FriendsTitle from './FriendsTitle';
import style from './css.module.css';
import { updateRelationships } from '@/API/User';
import Person from './Person';
import { Tab } from '@/types';
import { add, setAsCurrent } from '@/API/Tabs';

function FriendsList(props: { className?: string }) {
	const [friends] = createResource(async () => {
		console.log('updating relationships');
		await updateRelationships();
		return AppState.relationships;
	});
	let resizeRef: HTMLDivElement;
	let startX: number;
	let startWidth: number;

	function resize(e: MouseEvent) {
		let endWidth = startWidth + (e.clientX - startX);
		if (endWidth < 150) endWidth = 150;
		if (endWidth > 600) endWidth = 600;
		AppState.setChannelsSize(endWidth);

		resizeRef.parentElement.style.width = `${AppState.channelsSize()}px`;
		window.getSelection().removeAllRanges();
	}

	function startResize(e: MouseEvent) {
		console.log('start resize');
		startX = e.clientX;

		startWidth = AppState.channelsSize();
		document.addEventListener('mousemove', resize);
		document.addEventListener('mouseup', stopResize);
	}
	function stopResize() {
		console.log('stop resize');
		document.removeEventListener('mousemove', resize);
	}

	onMount(() => {
		resizeRef.parentElement.style.width = `${AppState.channelsSize()}px`;
	});

	onCleanup(() => {
		document.removeEventListener('mouseup', stopResize);
	});

	const AppState = useAppState();
	return (
		<nav class={[props.className, style.list].join(' ')}>
			<FriendsTitle />
			<ol>
				<For each={friends()}>
					{(friend) => {
						let img;

						if (friend.user.avatar) {
							img = `https://cdn.discordapp.com/avatars/${friend.user.id}/${friend.user.avatar}.webp?size=32`;
						} else {
							img = '/Friends/fallback.png';
						}
						const tab: Tab = {
							component: 'textChannel',
							title: friend.user.username,
							icon: img,
							channelId: friend.user.id,
							guildId: '@me',
						};

						return (
							<Person
								img={img}
								name={friend.user.global_name || friend.user.username}
								status={'TEMPORARY STATUS'}
								onClick={(e) => {
									console.log('clicked on', friend.user.username);

									const listIndex = AppState.tabs.findIndex(
										(t: Tab) => t.component == 'textChannel' && t.channelId == friend.user.id,
									);

									console.log('listIndex', listIndex);
									switch (e.button) {
										case 0:
											console.log('left click', e.button);
											if (listIndex == -1) {
												add(tab, true);
											} else {
												setAsCurrent(tab);
											}
											break;
										case 1:
											console.log('middle click', e.button);
											if (listIndex != -1) {
												setAsCurrent(listIndex);
											} else {
												add(tab);
											}

											break;
									}
								}}
							/>
						);
					}}
				</For>
			</ol>
			<aside onmousedown={startResize} ref={resizeRef} class={style.resize} />
		</nav>
	);
}

export default FriendsList;
