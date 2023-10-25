import style from './ComponentDocs.module.css';

import InputDocs from './docs/InputDocs';
import ButtonDocs from './docs/ButtonDocs';
import CheckboxDocs from './docs/CheckboxDocs';
import SwitchDocs from './docs/SwitchDocs';
import LoginBoxDocs from './docs/LoginComponents/LoginBoxDocs';
import MFABoxDocs from './docs/LoginComponents/MFABoxDocs';
import QRCodeDocs from './docs/LoginComponents/QRCodeDocs';
import LoadingDocs from './docs/LoadingDocs';
import { LoginBoxProps } from '../../../Components/Login/LoginBox/LoginBox';
import ChatDocs from './docs/ChatComponents/ChatDocs';
import MessageDocs from './docs/ChatComponents/MessageDocs';

export default function ComponentDocs() {
    return (
        <main class={style.main}>
            <section>
                <h1>Component Docs</h1>
                <p>This is a developer only page for testing and documentation of components. If you're looking for information on what a certain component does, why it's build in a certain way, what has to be done and how it has to be done. It should be here.</p>
            </section>

            <article class={style.componentGroup}>
                <h2>Basic components</h2>

                <InputDocs />
                <ButtonDocs />
                <CheckboxDocs />
                <SwitchDocs />
            </article>

            <article class={style.componentGroup}>
                <h2>Login components</h2>

                <LoginBoxDocs />
                <MFABoxDocs />
                <QRCodeDocs />
            </article>

            {/* Idk */}
            <article class={style.componentGroup}>
                <h2>Idk</h2>

                <ChatDocs />
                <MessageDocs />
                <LoadingDocs />
            </article>
        </main>
    )
}
