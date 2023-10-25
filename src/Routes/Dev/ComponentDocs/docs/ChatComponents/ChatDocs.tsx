import Chat from '../../../../../Components/Chat/Chat';
import style from './../../ComponentDocs.module.css';

// Needs guild and channel id
export default function ChatDocs() {
    return (
        <article class={style.component}>
            <section>
                <h3>Chat</h3>
            </section>

            <section>
                <h4>Props</h4>
            </section>

            <section class={style.preview}>
                <Chat />
            </section>
        </article>
    )
}
