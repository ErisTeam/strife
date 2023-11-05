import { For, Show, createMemo, createSignal } from 'solid-js';
import { useAppState } from '../../AppState';
import { Message as MessageType } from '../../types/Messages';
import { createContextMenu } from '../ContextMenuNew/ContextMenu';
import Attachments from './Attachments';
import Embed from './Embed';
import MessageContextMenu from './MessageContextMenu';
import style from './Message.module.css';
import MessageUpdater from './MessageUpdater';
import { formatMarkdownToJSX } from '@/API/Messages';

type MessageProps = {
	message: MessageType;

	/** Should the message be treated as the successor of a previous one (sent by the same person), which will show it without a profile picture. */
	same?: boolean;

	updateMessage?: (val: Partial<MessageType>) => void;
	setReference?: (id: string) => void;
};

const Message = (props: MessageProps) => {
	const AppState = useAppState();
	const message = props.message;

	// Time format
	const intl = new Intl.DateTimeFormat(AppState.localeJsFormat(), { timeStyle: 'short' });

	const time = createMemo(() => {
		return intl.format(new Date(message.timestamp));
	});

	const formattedMessage = createMemo(() => {
		const messageText = formatMarkdownToJSX(message.content);
		console.log('messageText', messageText);
		return messageText;
	});

	const userName = createMemo(() => {
		return (message.author.global_name as string) || (message.author.username as string);
	});

	const profileImage = createMemo(() => {
		if (message.author.avatar) {
			return `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=80`;
		} else {
			return '/Friends/fallback.png';
		}
	});

	//TODO: make embeds work
	function formatEmbed(embed: any) {}
	const [isEditing, setIsEditing] = createSignal(false);
	const contextMenu = createContextMenu({
		component: [MessageContextMenu],
		data: {
			message: message,
			setIsEditing: setIsEditing,
			isEditing: isEditing,
		},
	});

	return (
		<li class={style.message} classList={{ [style.same]: props.same }} use:contextMenu>
			<Show
				when={props.same}
				fallback={
					<button class={[style.left, style.profileImage].join(' ')}>
						<img src={profileImage()} alt={userName()} />
					</button>
				}
			>
				<time class={style.left}>{time()}</time>
			</Show>

			<Show when={!props.same}>
				<div class={style.info}>
					<button class={style.userName}>
						{userName()}

						<Show when={message.author.bot}>
							<span class={style.botTag}> Bot</span>
						</Show>
					</button>
					<time>{time()}</time>
				</div>
			</Show>

			<Show
				when={isEditing()}
				fallback={
					<div class={style.content}>
						<p class={style.text}>{formattedMessage()}</p>
						<Attachments attachments={message.attachments} />
					</div>
				}
			>
				<MessageUpdater setIsEditing={setIsEditing} message={message} />
			</Show>

			<For each={message.embeds}>{(embed) => <Embed embed={embed} />}</For>
		</li>
	);
};
export default Message;
