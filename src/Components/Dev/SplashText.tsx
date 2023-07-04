import { JSX, children } from 'solid-js';

import style from './SplashText.module.css';

interface Props {
	children: JSX.Element;
	text: string;
	settings?: Settings;
}

interface Settings {
	noWrap?: boolean;
	color?: string;
}

export default (props: Props) => {
	let s: JSX.CSSProperties = {};
	if (props.settings?.color) {
		s['color'] = props.settings.color;
	}
	return (
		<div class={style.container}>
			{props.children}
			<div class={style.splashText} classList={{ [style.noWrap]: props.settings?.noWrap }} style={s}>
				{props.text}
			</div>
		</div>
	);
};
