import style from './css.module.css';
import { Mic, Headphones, Video, Settings } from 'lucide-solid';
export function MediaPanel() {
  return (
    <div class={style.mediaPanel}>
      <button type="button">
        <Mic />
      </button>
      <button type="button">
        <Headphones />
      </button>
      <button type="button">
        <Video />
      </button>
      <button type="button">
        <Settings />
      </button>
    </div>
  );
}
