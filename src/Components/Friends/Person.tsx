import { Relationship } from '../../types/User';

import style from './css.module.css';

import { useNavigate, useParams } from '@solidjs/router';
import { useAppState } from '../../AppState';
import { Tab } from '../../types';

import { add, setAsCurrent } from '@/API/Tabs';

//fallback icon provided by Lemony
interface FriendProps {
	className?: string;
	relationship: Relationship;
	name: string;
	status: string;
	state?: string;
	onClick?: (e: MouseEvent) => void;

	img: string;
}
const Person = (props: FriendProps) => {
	return (
		<li class={style.friend}>
			<button onclick={props.onClick}>
				<img src={props.img} alt={props.name} />

				<main>
					<span>{props.name}</span>
					<p>{props.status}</p>
				</main>
			</button>
		</li>
	);
};

export default Person;
