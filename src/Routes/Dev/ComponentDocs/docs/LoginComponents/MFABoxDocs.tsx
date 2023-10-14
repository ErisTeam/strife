import MFABox from '../../../../../Components/Login/MFABox/MFABox';
import style from './../../ComponentDocs.module.css';

export default function MFABoxDocs() {
    return (
        <article class={style.component}>
            <section>
                <h3>MFA Box</h3>
                <p>Not yet documented.</p>
            </section>


            <section>
                <h4>Props</h4>
                <p>MFA Box takes in a required function named <mark class={style.inlineCode}>verify</mark>. The function takes in as arguments <mark class={style.inlineCode}>code: string</mark> and return a <mark class={style.inlineCode}>Promise{`<void>`}</mark>. The function must verify if the code is correct.</p>
            </section>

            <section class={style.preview}>
                <MFABox verify={() => {return Promise.resolve();}} />
            </section>
        </article>
    )
}
