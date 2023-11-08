import { useMenu } from '../ContextMenu/ContextMenu';
import { MessageReference, Message as MessageType } from '../../types/Messages';
import { Accessor, Setter, Show } from 'solid-js';
import { useAppState } from '../../AppState';

type MessageContextMenuItems = {
	message: MessageType;
	setIsEditing: Setter<boolean>;
	isEditing: Accessor<boolean>;
	setReference?: Setter<MessageReference | null>;
};
export default function MessageContextMenu() {
	const menu = useMenu<MessageContextMenuItems>();
	const authorId = menu.message.author.id as string;
	const AppState = useAppState();
	return (
		<>
			<Show when={authorId == AppState.userId()}>
				<button
					onClick={() => {
						menu.setIsEditing(true);
						menu.closeMenu();
					}}
				>
					edit
				</button>
			</Show>
			<button
				onClick={() => {
					menu.closeMenu();
					menu.setReference({
						message_id: menu.message.id,
						channel_id: menu.message.channel_id,
					});
				}}
			>
				reply
			</button>
		</>
	);
}
