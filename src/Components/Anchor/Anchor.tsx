// SolidJS
import { JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// Tauri
import { invoke } from '@tauri-apps/api';

interface AnchorProps {
	state: 'LoginScreen' | 'Application';
	href: string;
	children: JSX.Element;

	class?: string;
}

const Anchor = (props: AnchorProps) => {
	const navigate = useNavigate();

	return (
		<a
			class={props.class}
			href={props.href}
			onClick={async (e) => {
				e.preventDefault();
				await invoke('set_state', { newState: props.state });
				navigate(props.href);
			}}
		>
			{props.children}
		</a>
	);
};

export default Anchor;
