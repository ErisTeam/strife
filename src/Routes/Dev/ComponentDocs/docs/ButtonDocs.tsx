import buttons from './../../../../Styles/Buttons.module.css';
import style from './../ComponentDocs.module.css';

export function ButtonDocs() {
  return (
    <section>
      <h3>Button</h3>
      <p>Not yet documented.</p>
      <div class={style.preview}>
        <button class={buttons.default} type="button">
          Click Me!
        </button>
      </div>
    </section>
  );
}
