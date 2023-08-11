import { onMount } from 'solid-js';
import { useAppState } from './AppState';
import API from './API';
import { useNavigate } from '@solidjs/router';
function Redirect() {
	const AppState = useAppState();
	const navigate = useNavigate();
	onMount(() => {
		if (!AppState.userId) {
			navigate('/login');
			console.log('navigated to login');
		} else {
			const token = API.getToken();
			if (token == null) {
				navigate('/login');
				console.log('navigated to login');
			}
			navigate('/app');
			console.log('navigated to app');
		}
	});

	return <div>WAIT</div>;
}

export default Redirect;
