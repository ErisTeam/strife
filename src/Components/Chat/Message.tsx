import { Accessor, For, Setter, Show, createMemo, createSignal } from 'solid-js';
import { useAppState } from '../../AppState';
import { MessageReference, Message as MessageType } from '../../types/Messages';
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
	setReference?: Setter<MessageReference | null>;
	reference?: Accessor<MessageReference | null>;
	refMsg?: MessageType;
};

const Message = (props: MessageProps) => {
	const AppState = useAppState();
	const message = props.message;
	console.warn('message', message);

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
	const refMsgImage = createMemo(() => {
		if (!props.refMsg) return;
		if (props.refMsg.author.avatar) {
			return `https://cdn.discordapp.com/avatars/${props.refMsg.author.id}/${props.refMsg.author.avatar}.webp?size=80`;
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
			setReference: props.setReference,
		},
	});

	return (
		<li class={style.message} classList={{ [style.same]: props.same }} use:contextMenu>
			<Show when={props.refMsg}>
				<div>
					Reply to
					<img src={refMsgImage()} alt={props.refMsg.author.global_name || props.refMsg.author.username} />{' '}
					<span>{props.refMsg.author.global_name || props.refMsg.author.username}</span>
					<p>{props.refMsg.content}</p>
				</div>
			</Show>
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
