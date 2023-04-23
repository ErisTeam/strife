// SolidJS
import { onMount, For } from 'solid-js';

// API
import API from '../../API';
import { useAppState } from '../../AppState';
import { Relationship as RelationshipT } from '../../types';

// Style
import style from './Relationship.module.css';
interface RelationshipProps {
	className?: string;
	relationship: RelationshipT;
}
const Relationship = (props: RelationshipProps) => {
	const AppState: any = useAppState();

	return (
		<li>
			<img
				src={`https://cdn.discordapp.com/avatars/${props.relationship.user.id}/${props.relationship.user.avatar}.webp?size=32`}
				alt={props.relationship.user.username}
			/>
			<span>{props.relationship.user.username}</span>
			<span>#{props.relationship.user.discriminator}</span>
		</li>
	);
};

export default Relationship;
