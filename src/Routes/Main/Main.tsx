// API
import API from '../../API';
import { useAppState } from '../../AppState';

// Components
import GuildList from './../../Components/GuildList/GuildList';

// Style
import style from './Main.module.css';

const Main = () => {
	return (
		<div class={style.main}>
			<h1>Gami to furras</h1>
			<GuildList />
		</div>
	);
};

export default Main;
