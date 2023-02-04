import { AnchorProps, Link, Navigate, useNavigate } from '@solidjs/router';
import { invoke } from '@tauri-apps/api';
import { emit } from '@tauri-apps/api/event';
import { createResource, JSX } from 'solid-js';
interface Props {
	state: 'LoginScreen' | String;
	href: string;
	children: JSX.Element;
}
const A = (props: Props) => {
	//createResource(async () => );
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
