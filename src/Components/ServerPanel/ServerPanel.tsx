// SolidJS
// Style
import style from './ServerPanel.module.css';

//Icons
import { Signal } from 'lucide-solid';
import { PenLine } from 'lucide-solid';
import { Music4Icon } from 'lucide-solid';
import { ScreenShareIcon } from 'lucide-solid';
import { ScreenShareOffIcon } from 'lucide-solid';
import { PhoneOffIcon } from 'lucide-solid';

const ServerPanel = () => {
	return (
		<div class={style.serverPanelInner}>
			<Signal></Signal>

			<span>
				<div class={style.serverPanelButton}>Server Name</div>
				<div class={style.serverPanelButton}>Chanel Name</div>
			</span>
			<div class={style.serverButtons}>
				<button class={style.serverPanelButton}>
					<PenLine></PenLine>
				</button>
				<button class={style.serverPanelButton}>
					<Music4Icon></Music4Icon>
				</button>
				<button class={style.serverPanelButton}>
					<ScreenShareIcon></ScreenShareIcon>
				</button>
				<button class={style.serverPanelButton}>
					<ScreenShareOffIcon></ScreenShareOffIcon>
				</button>
				<button class={style.serverPanelButton}>
					<PhoneOffIcon></PhoneOffIcon>
				</button>
			</div>
		</div>
	);
};
export default ServerPanel;
