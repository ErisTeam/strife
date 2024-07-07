import type { PublicUser } from '@/types/User';
import { For } from 'solid-js';
import style from './Recipients.module.css';

type CategoryProps = {
  active: boolean;
  recipients: PublicUser[];
};
export function RecipientCategory(props: CategoryProps) {
  return (
    <li
      classList={{
        [style.active]: props.active,
      }}
    >
      <For each={props.recipients}>
        {(recipient) => <Recipient recipient={recipient} />}
      </For>
    </li>
  );
}
