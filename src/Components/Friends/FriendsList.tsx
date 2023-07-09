import { For } from 'solid-js';
import { useAppState } from '../../AppState';
import { useTrans } from '../../Translation';
import List from '../List/List';
import Relationship from '../Relationship/Relationship';

export default ({ className }: { className?: string }) => {
	const [t] = useTrans();
	const AppState = useAppState();
	return (
		<List title={t.friends()} className={className}>
			<For each={AppState.relationships}>{(relationship) => <Relationship relationship={relationship} />}</For>
		</List>
	);
};
