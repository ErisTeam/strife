import { useAppState } from '../../../../../AppState';
import Message from '../../../../../Components/Chat/Message';
import { Message as MessageType } from '../../../../../types/Messages';
import style from './../../ComponentDocs.module.css';
import listStyle from './../../assets/messageList.module.css';
import { SameMessageMockup, SingleMessageMockup, TwoUsersMessageMockup } from '../../assets/messageMockups';
import { JSX } from 'solid-js';

function renderMockupMessages(messages: MessageType[]) {
    let result: JSX.Element[] = [];

    for (let i = 0; i < messages.length; i++) {
        result.push(<Message message={messages[i]} same={(i === 0) ? false : (messages[i].author.id === messages[i-1].author.id)} />);
    }

    return (<ol class={listStyle.list}>{result}</ol>);
}

// Needs guild and channel id
export default function MessageDocs() {
	const AppState = useAppState();

    return (
        <article class={style.component}>
            <section>
                <h3>Message</h3>
            </section>

            <section>
                <h4>Props</h4>
            </section>

            <section class={style.preview}>
                {renderMockupMessages(SingleMessageMockup)}
            </section>

            <section class={style.preview}>
                {renderMockupMessages(SameMessageMockup)}
            </section>

            <section class={style.preview}>
                {renderMockupMessages(TwoUsersMessageMockup)}
            </section>
        </article>
    )
}
