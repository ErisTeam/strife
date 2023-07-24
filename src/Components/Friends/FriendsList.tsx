import { For, createResource } from 'solid-js';
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
	const AppState = useAppState();
	return (
		<nav class={[props.className, style.list].join(' ')}>
			<FriendsTitle />
			<ol>
				<For each={friends()}>{(friend) => <Friend relationship={friend} />}</For>
			</ol>
		</nav>
	);
}

export default FriendsList;
