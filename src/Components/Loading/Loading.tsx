import { JSX } from 'solid-js';
import style from './Loading.module.css';
interface Props {
	message?: JSX.Element;
}
export default (props: Props) => {
	return (
		<div class={style.main}>
			<img class={style.logo} src="/icons/128x128.png" alt="" />

			{props.message ? props.message : <h3 class={style.loading}>Loading</h3>}
		</div>
	);
};
