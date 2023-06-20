import style from './Loading.module.css';
interface Props {
	message?: Element;
}
export default (props: Props) => {
	console.log(props.message);
	return (
		<div class={style.main}>
			<img class={style.logo} src="/src-tauri/icons/128x128.png" alt="" />

			{props.message ? props.message : <h3 class={style.loading}>Loading</h3>}
		</div>
	);
};
