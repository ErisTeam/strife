import Checkbox from '../../../../Components/Checkbox/Checkbox';
import style from './../ComponentDocs.module.css';

export default function CheckboxDocs() {
    return (
        <section>
            <h3>Checkbox</h3>
            <p>Not yet documented.</p>
            <div class={style.preview}>
                <div>
                    <h4>Unchecked:</h4>
                    <Checkbox />
                </div>
                <div>
                    <h4>Checked:</h4>
                    <Checkbox defaultChecked />
                </div>
            </div>
        </section>
    )
}
