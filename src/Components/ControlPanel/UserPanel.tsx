import style from './css.module.css';
function UserPanel() {
	return (
		<main class={style.userPanel}>
			<img
				src="https://s3.amazonaws.com/www-inside-design/uploads/2020/10/aspect-ratios-blogpost-1x1-1.png"
				alt="User"
			></img>
			<div class={style.user}>
				<span>Username - asldkjkhagsdfkjgasjdgfakjshdgf</span>
				<h2>@nickname - asldkjkhaasdfasdfasdfgsdfkjgasjdgfakjshdgf</h2>
				<p>status - asldkjkhagsdfkjasdfasdfasdfasdfasdfasdfasdfgasjdgfakjshdgf</p>
			</div>
		</main>
	);
}
export default UserPanel;
