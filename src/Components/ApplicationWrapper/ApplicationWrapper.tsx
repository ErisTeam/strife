// SolidJS
import { Outlet } from '@solidjs/router';

// Components
import GuildList from '../GuildList/GuildList';

// Style
import style from './ApplicationWrapper.module.css';

const ApplicationWrapper = () => {
	return (
		<div class={style.wrapper}>
			<GuildList className={style.list} />
			<Outlet />
		</div>
	);
};
export default ApplicationWrapper;
