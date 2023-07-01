// Components
import GuildList from '../../Components/Guild/GuildList';

// Style
import style from './Main.module.css';

const Main = () => {
	return (
		<div class={style.main}>
			<GuildList />
		</div>
	);
};

export default Main;
