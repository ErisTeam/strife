import { DEV, JSX } from 'solid-js';
import { Portal } from 'solid-js/web';

export default (props: { children?: JSX.Element }) => {
	if (DEV) {
		if (document.querySelector('#dev')) {
			return <Portal mount={document.querySelector('#dev') as Node}>{props.children}</Portal>;
		} else {
			return <>{props.children}</>;
		}
	}
	return <></>;
};
