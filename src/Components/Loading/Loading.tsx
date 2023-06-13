import style from './Loading.module.css';
export default () => {
	return (
		<div class={style.main}>
			<img class={style.logo} src="/src-tauri/icons/128x128.png" alt="" />

			<h3 class={style.loading}>Loading</h3>
		</div>
	);
};
