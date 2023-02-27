/** @format */

import style from './QRCode.module.css';

interface QRCodeProps {
	qrcode_src: string;
	header: string;
	paragraph: string;
}

function QRCode(prop: QRCodeProps) {
	return (
		<div class={style.container}>
			<img class={style.qrcode} src={prop.qrcode_src} alt="QR Code" />
			<h1 class={style.header}>{prop.header}</h1>
			<p class={style.paragraph}>{prop.paragraph}</p>
		</div>
	);
}

export default QRCode;
