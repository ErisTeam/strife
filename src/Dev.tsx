import { DEV, JSX } from 'solid-js';

export default (props: { children?: JSX.Element }) => {
	if (DEV) {
		return <>{props.children}</>;
	}
	return <></>;
};
