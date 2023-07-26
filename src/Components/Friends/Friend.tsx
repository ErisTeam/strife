// SolidJS

// API

// Style
import { Show } from 'solid-js';
import { Relationship } from '../../discord';
import style from './css.module.css';
import fallback from './fallback.png';
//fallback icon provided by Lemony
interface FriendProps {
	className?: string;
	relationship: Relationship;
}
const Friend = (props: FriendProps) => {
	return (
		<li class={style.friend}>
			<button>
				<Show
					when={props.relationship.user.avatar}
					fallback={<img src={fallback} alt={props.relationship.user.username} />}
				>
					<img
						src={`https://cdn.discordapp.com/avatars/${props.relationship.user.id}/${props.relationship.user.avatar}.webp?size=32`}
						alt={props.relationship.user.username}
					/>
				</Show>

				<main>
					<span>{props.relationship.user.username}</span>
					<p>
						Super duper long status because i am a stupid little nerd that cant fit his funny little text in less than
						50 characters
					</p>
				</main>
			</button>
		</li>
	);
};

export default Friend;
