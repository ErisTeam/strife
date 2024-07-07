import { SwitchInput } from '../../../../Components/Switch/Switch';
import style from './../ComponentDocs.module.css';

export function SwitchDocs() {
  return (
    <section>
      <h3>Switch</h3>
      <p>Not yet documented.</p>
      <div class={style.preview}>
        <div>
          <h4>Off: </h4>
          <SwitchInput />
        </div>
        <div>
          <h4>On: </h4>
          <SwitchInput defaultChecked />
        </div>
      </div>
    </section>
  );
}
