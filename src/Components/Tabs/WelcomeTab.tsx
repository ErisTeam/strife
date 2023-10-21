import { Index, createResource } from 'solid-js';
import { useAppState } from '../../AppState';
// import { useTabContext } from './Tabs';
import API from '../../API';

import style from './Tabs.module.css';
import Message from '../Messages/Message';
import { Message as MessageType } from '../../discord';

export default function WelcomeTab() {
	// const tabData = useTabContext();

	const appState = useAppState();

	const [userInfo] = createResource(async () => {
		const res = await API.getLocalUserInfo(appState.userId);
		console.log(res);
		return res;
	});

	console.log('WelcomeTab');

	return (
		<div class={style.welcomeTab}>
			<h1>Welcome: {userInfo()?.username}</h1>
		</div>
	);
}
