/** @format */

import { Show } from 'solid-js';
import style from './../css.module.css';

//TODO: Remove or move
interface UserData {
  user_id: string | null;
  discriminator: string | null;
  username: string | null;
  avatar_hash: string | null;
}

type QRCodeProps = {
  qrcode_src: string;
  header: string;
  paragraph: string;
  altParagraph: string;
  class?: string;
  user_data?: UserData;

  fallback_src?: string;
};

export function QRCode(prop: QRCodeProps) {
  return (
    <div class={[style.qrBox, prop.class].join(' ')}>
      <img
        class={style.qrcode}
        src={prop.qrcode_src ?? prop.fallback_src}
        alt="QR Code"
      />
      <Show
        when={prop.user_data === undefined}
        fallback={
          <>
            <h1>
              {`${prop.user_data?.username}#${prop.user_data?.discriminator}`}
            </h1>
            <p>{prop.altParagraph}</p>
          </>
        }
      >
        <h1>{prop.header}</h1>
        <p>{prop.paragraph}</p>
      </Show>
    </div>
  );
}

export type { UserData };
