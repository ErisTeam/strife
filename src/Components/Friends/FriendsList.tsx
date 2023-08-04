import { For, createResource, onCleanup, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import style from './css.module.css';
import Friend from './Friend';
import FriendsTitle from './FriendsTitle';
import API from '../../API';

function FriendsList(props: { className?: string }) {
	const [friends] = createResource(async () => {
		console.log('updating relationships');
		await API.updateRelationships();
		return AppState.relationships;
	});
	let resizeRef: HTMLDivElement;
	let startX: number;
	let startWidth: number;

	function resize(e: MouseEvent) {
		AppState.setChannelsSize(startWidth + (e.clientX - startX));

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
