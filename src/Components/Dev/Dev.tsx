import { DEV, JSX, createSignal } from 'solid-js';
import { Portal } from 'solid-js/web';
import DevTools from '../DevTools/DevTools';

const [created, setCreated] = createSignal();

export default (props: { children?: JSX.Element }) => {
	if (DEV) {
		console.log(document.querySelector('#dev'));
		if (document.querySelector('#dev') || created()) {
			return <Portal mount={document.querySelector('#dev') as Node}>{props.children}</Portal>;
		} else {
			setCreated(true);
			console.log(props.children);
			return (
				<Portal>
					<DevTools>{props.children}</DevTools>
				</Portal>
			);
		}
	}
	return <></>;
};
