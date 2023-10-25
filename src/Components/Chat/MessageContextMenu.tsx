import { useMenu } from '../ContextMenu/ContextMenu';
import { Message as MessageType } from '../../types/Messages';
import { Show } from 'solid-js';
import { useAppState } from '../../AppState';

export default function MessageContextMenu() {
	const menu = useMenu<MessageType>();
	const authorId = menu.author.id as string;
	const AppState = useAppState();
	return (
		<Show when={authorId == AppState.userId}>
			<button>edit</button>
		</Show>
	);
}
