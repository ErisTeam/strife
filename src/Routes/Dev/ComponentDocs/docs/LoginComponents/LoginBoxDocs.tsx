import LoginBox, { LoginBoxProps } from '../../../../../Components/Login/LoginBox/LoginBox';
import style from './../../ComponentDocs.module.css';

export default function LoginBoxDocs() {
    return (
        <article class={style.component}>
            <section>
                <h3>Login Box</h3>
                <p>A simple form for taking the login data it doesn't manipulate it in any way by itself.</p>
            </section>

            <section>
                <h4>Props</h4>
                <p>Login Box takes in a required function named <mark class={style.inlineCode}>login</mark>. The function takes in as arguments <mark class={style.inlineCode}>name: string</mark>, <mark class={style.inlineCode}>password: string</mark>, <mark class={style.inlineCode}>captcha_token?: string</mark> and returns a <mark class={style.inlineCode}>Promise{`<void>`}</mark>. The function must execute the actual login process.</p>
            </section>

            <section class={style.preview}>
                <LoginBox login={() => {return Promise.resolve();}}/>
            </section>
        </article>
    )
}
