import { createResource, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import style from './css.module.css';
import API from '../../API';
function UserPanel() {
	const appState = useAppState();

	const [userInfo] = createResource(async () => {
		const res = await API.getUserInfo(appState.userId());
		console.log(res);
		return res;
	});

	console.log(userInfo());

	return (
		<main class={style.userPanel}>
			<img
				src="https://s3.amazonaws.com/www-inside-design/uploads/2020/10/aspect-ratios-blogpost-1x1-1.png"
				alt="User"
			></img>
			<div class={style.user}>
				<span>Display name</span>
				<h2>@{userInfo()?.username}</h2>
				<p>status - asldkjkhagsdfkjasdfasdfasdfasdfasdfasdfasdfgasjdgfakjshdgf</p>
			</div>
		</main>
	);
}
export default UserPanel;
