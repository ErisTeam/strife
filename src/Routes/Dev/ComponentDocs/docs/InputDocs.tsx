import inputs from './../../../../Styles/Inputs.module.css';
import style from './../ComponentDocs.module.css';

export default function InputDocs() {
    return (
        <section>
            <h3>Input</h3>
            <p>Not yet documented.</p>
            <div class={style.preview}>
                <input type='text' class={inputs.default} />
            </div>
        </section>
    )
}
