import QRCode from '../../../../../Components/Login/QRCode/QRCode';
import QRCodeSRC from './../../assets/QRcode.jpg';
import { t } from './../../../../../Translation';
import style from './../../ComponentDocs.module.css';

export default function QRCodeDocs() {
    return (
        <article class={style.component}>
            <section>
                <h3>QR Code</h3>
                <p>Not yet documented.</p>
            </section>

            <section>
                <h4>Props</h4>
                <p>QR Code takes in a required <mark class={style.inlineCode}>src</mark> named <mark class={style.inlineCode}>qrcode_src: string</mark> which will display the QR Code, a <mark class={style.inlineCode}>fallback_src</mark> which will display an alternative image if the original QR Code won't load. <mark class={style.inlineCode}>header: string</mark> which will be displayed right beneath the QR Code, <mark class={style.inlineCode}>paragraph: string</mark> under the heading, and an <mark class={style.inlineCode}>altParagraph: string</mark> which will replace the original paragraph if the login using the QR Code was succesfull.</p>
            </section>

            <section class={style.preview}>
                <QRCode
                    qrcode_src={QRCodeSRC}
                    fallback_src="/test.gif"
                    header={t.LoginPage.qrCodeLogin()}
                    paragraph={t.LoginPage.qrCodeParagraph()}
                    altParagraph={t.LoginPage.qrCodeParagrpahAlt()}
                />
            </section>
        </article>
    )
}
