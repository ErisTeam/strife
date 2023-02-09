// SolidJS
import { JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// Tauri
import { invoke } from '@tauri-apps/api';

interface Props {
	state: 'LoginScreen' | String;
	href: string;
	children: JSX.Element;
}

const A = (props: Props) => {
	const navigate = useNavigate();

	return (
		<a
			href={props.href}
			onClick={async (e) => {
				e.preventDefault();
				await invoke('set_state', { state: props.state });
				navigate(props.href);
			}}
		>
			{props.children}
		</a>
	);
};

export default A;
