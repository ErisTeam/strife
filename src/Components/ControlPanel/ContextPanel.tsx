import { Match, Switch } from 'solid-js';
import style from './css.module.css';
import { useAppState } from '../../AppState';
import { Signal, CassetteTape, PhoneOff, ScreenShare, Phone } from 'lucide-solid';
function ContextPanel() {
	const AppState = useAppState();
	return (
		<Switch>
			<Match when={AppState.currentState() == 'voice'}>
				<div class={style.contextPanelVoice}>
					<div class={style.left}>
						<button>
							<CassetteTape />
						</button>
						<button>
							<Signal color="green" />
						</button>
					</div>
					<div class={style.channel}>
						<span>Channel with a very long name that i dont really feel like typing</span>
						<p>Server with a very long name that i dont really feel like typing</p>
					</div>
					<div class={style.right}>
						<button>
							<ScreenShare />
						</button>
						<button>
							<PhoneOff color="red" />
						</button>
					</div>
				</div>
			</Match>
			<Match when={AppState.currentState() == 'text'}>
				<div class={style.contextPanelText}>Text</div>
			</Match>
		</Switch>
	);
}
export default ContextPanel;
