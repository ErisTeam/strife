// Style
import style from './LoadingTest.module.css';

import buttons from '../../../Styles/Buttons.module.css';

export function LoadingTest() {
  return (
    <div class={style.main}>
      <iframe
        title="splashscreen"
        id="frame"
        src="/splashscreen.html"
        style={{ width: '200px', height: '400px' }}
      />
      <button
        type="button"
        class={buttons.default}
        onClick={() => {
          const frame: HTMLIFrameElement = document.getElementById(
            'frame'
          ) as HTMLIFrameElement;
          frame.src += '';
        }}
      >
        Reload
      </button>
    </div>
  );
}
