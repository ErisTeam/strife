import { JSX } from 'solid-js';

import style from './SplashText.module.css';

type Props = {
	children: JSX.Element;
	text: string;
	settings?: Settings;
};

type Settings = {
	noWrap?: boolean;
	color?: string;
};

export default (props: Props) => {
	const s: JSX.CSSProperties = {};
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
