// Components
import GuildList from '../../Components/GuildList/GuildList';
import logo from '../../../src-tauri/icons/128x128.png';
// Style
import style from './Loading.module.css';

const Loading = () => {
	return (
		<div class={style.main}>
			<div class={style.logo}>
				<img src={logo} alt="" />
			</div>
		</div>

	);
};

export default Loading;
