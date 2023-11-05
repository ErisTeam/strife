import { Index, createResource } from 'solid-js';
import { useAppState } from '../../AppState';
// import { useTabContext } from './Tabs';

import style from './Tabs.module.css';
import { Message as MessageType } from '../../types/Messages';
import { getLocalUserInfo } from '@/API/User';

export default function WelcomeTab() {
	// const tabData = useTabContext();

	const appState = useAppState();

	const [userInfo] = createResource(async () => {
		const res = await getLocalUserInfo(appState.userId);
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
