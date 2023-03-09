import { onMount } from 'solid-js';
import { useAppState } from './AppState';
import API from './API';
import { useNavigate } from '@solidjs/router';
function Redirect() {
	const AppState: any = useAppState();
	const navigate = useNavigate();
	onMount(async () => {
		if (!AppState.userID()) {
			navigate('/login');
			console.log('navigated to login');
		} else {
			const token = await API.getToken(AppState.userID());
			if (token == null) {
				navigate('/login');
				console.log('navigated to login');
			}
			AppState.setUserToken(token);
			navigate('/app');
			console.log('navigated to app');
		}
	});

	return <div>WAIT</div>;
}

export default Redirect;
