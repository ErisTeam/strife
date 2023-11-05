import { For, createResource, onCleanup, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import Friend from './Friend';
import FriendsTitle from './FriendsTitle';
import style from './css.module.css';
import { updateRelationships } from '@/API/User';

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
				<For each={friends()}>{(friend) => <Friend relationship={friend} />}</For>
			</ol>
			<aside onmousedown={startResize} ref={resizeRef} class={style.resize} />
		</nav>
	);
}

export default FriendsList;
