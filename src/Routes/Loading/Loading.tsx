// Components
import GuildList from '../../Components/GuildList/GuildList';
import logo from '../../../src-tauri/icons/128x128.png';
// Style
import style from './Loading.module.css';

const Loading = () => {
	return (
		<div class={style.main}>
			<img class={style.logo} src="/src-tauri/icons/128x128.png" alt="" />
			<h3 class={style.loading}>Loading</h3>

		</div>
	);
};

export default Loading;
