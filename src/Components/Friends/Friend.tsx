// SolidJS

// API

// Style
import { Relationship } from '../../discord';
import style from './css.module.css';
interface FriendProps {
	className?: string;
	relationship: Relationship;
}
const Friend = (props: FriendProps) => {
	return (
		<li class={style.friend}>
			<img
				src={`https://cdn.discordapp.com/avatars/${props.relationship.user.id}/${props.relationship.user.avatar}.webp?size=32`}
				alt={props.relationship.user.username}
			/>
			<span>{props.relationship.user.username}</span>
			<span>#{props.relationship.user.discriminator}</span>
		</li>
	);
};

export default Friend;
