// SolidJS
import { Outlet } from '@solidjs/router';

// Components
import GuildList from '../GuildList/GuildList';
import Tabs from '../Tabs/Tabs';

// Style
import style from './ApplicationWrapper.module.css';

const ApplicationWrapper = () => {
	return (
		<div class={style.wrapper}>
			<GuildList className={style.guilds} />
			<Tabs className={style.tabs} />
			<div class={style.outlet}>
				<Outlet />
			</div>
		</div>
	);
};
export default ApplicationWrapper;
