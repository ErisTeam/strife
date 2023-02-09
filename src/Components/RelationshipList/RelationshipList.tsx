import { onMount, For } from 'solid-js';
import { useAppState } from '../../AppState';
import API from '../../API';
import { Relationship } from '../../discord';

import style from './RelationshipList.module.css';

const RelationshipList = () => {
	const AppState: any = useAppState();

	onMount(() => {
		API.updateRelationships();
	});

	return (
		<div>
			<For each={AppState.relationships()}>
				{(relationship: Relationship) => (
					<div>
						<img
							src={`https://cdn.discordapp.com/avatars/${relationship.user.id}/${relationship.user.avatar}.webp?size=32`}
						/>
						{relationship.user.username}#{relationship.user.discriminator}
					</div>
				)}
			</For>
		</div>
	);
};

export default RelationshipList;
