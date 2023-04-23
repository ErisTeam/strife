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
		<div>
			<div>
				<img
					src={`https://cdn.discordapp.com/avatars/${props.relationship.user.id}/${props.relationship.user.avatar}.webp?size=32`}
					alt={props.relationship.user.username}
				/>
				{props.relationship.user.username}#{props.relationship.user.discriminator}
			</div>
		</div>
	);
};

export default Relationship;
