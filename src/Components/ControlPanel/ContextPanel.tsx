import { Match, Switch } from 'solid-js';
import style from './css.module.css';
import { useAppState } from '../../AppState';
import { Signal, CassetteTape, PhoneOff, ScreenShare } from 'lucide-solid';
export function ContextPanel() {
  const AppState = useAppState();
  return (
    <Switch>
      {/* <Match when={AppState.currentState() === 'voice'}> */}
      <div class={style.contextPanelVoice}>
        <div class={style.left}>
          <button type="button">
            <CassetteTape />
          </button>
          <button type="button">
            <Signal color="green" />
          </button>
        </div>
        <div class={style.channel}>
          <span>
            Channel with a very long name that i dont really feel like typing
          </span>
          <p>
            Server with a very long name that i dont really feel like typing
          </p>
        </div>
        <div class={style.right}>
          <button type="button">
            <ScreenShare />
          </button>
          <button type="button">
            <PhoneOff color="red" />
          </button>
        </div>
      </div>
      {/* </Match> */}
      {/* <Match when={AppState.currentState() === 'text'}>
        <div class={style.contextPanelText}>Text</div>
      </Match> */}
    </Switch>
  );
}
