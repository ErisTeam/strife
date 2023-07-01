/** @format */

import { Show } from 'solid-js';
import style from './css.module.css';

interface UserData {
	user_id: any | null;
	discriminator: any | null;
	username: any | null;
	avatar_hash: any | null;
}

interface QRCodeProps {
	qrcode_src: string;
	header: string;
	paragraph: string;
	altParagraph: string;
	class?: string;
	user_data?: UserData;

	fallback_src?: string;
}

function QRCode(prop: QRCodeProps) {
	return (
		<div class={[style.qrBox, prop.class].join(' ')}>
			<img class={style.qrcode} src={prop.qrcode_src ? prop.qrcode_src : prop.fallback_src} alt="QR Code" />
			<Show
				when={prop.user_data === undefined}
				fallback={
					<>
						<h1 class={style.subheader}>{prop.user_data?.username + '#' + prop.user_data?.discriminator}</h1>
						<p class={style.paragraph}>{prop.altParagraph}</p>
					</>
				}
			>
				<h1 class={style.subheader}>{prop.header}</h1>
				<p class={style.paragraph}>{prop.paragraph}</p>
			</Show>
		</div>
	);
}

export default QRCode;
export type { UserData };
