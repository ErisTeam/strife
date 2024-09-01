import style from './css.module.css';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Maximize, Minimize, Minus, X } from 'lucide-solid';
import { Show, createResource } from 'solid-js';

export function WindowDecoration() {
  return (
    <div class={style.decoration}>
      <h1>PandaCord :3</h1>
    </div>
  );
}
