import { PublicUser } from '@/types/User';
import { For } from 'solid-js';
import style from './Recipients.module.css';
import Recipient from './Recipient';

type CategoryProps = {
	active: boolean;
	recipients: PublicUser[];
};
export default (props: CategoryProps) => {
	return (
		<li
			classList={{
				[style.active]: props.active,
			}}
		>
			<For each={props.recipients}>{(recipient) => <Recipient recipient={recipient} />}</For>
		</li>
	);
};
