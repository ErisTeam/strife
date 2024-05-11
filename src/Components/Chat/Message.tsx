import { Accessor, For, Setter, Show, createEffect, createMemo, createSignal, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import { MessageReference, Message as MessageType } from '../../types/Messages';
import { createContextMenu } from '../ContextMenuNew/ContextMenu';
import Attachments from './Attachments';
import Embed from './Embed';
import MessageContextMenu from './MessageContextMenu';
import style from './Message.module.css';
import MessageUpdater from './MessageUpdater';
import { formatMarkdownToJSX } from '@/API/Messages';
import { useTabContext } from '../Tabs/TabUtils';

type MessageProps = {
	message: MessageType;

	/** Should the message be treated as the successor of a previous one (sent by the same person), which will show it without a profile picture. */
	same?: boolean;

	updateMessage?: (val: Partial<MessageType>) => void;
	setReference?: Setter<MessageReference | null>;
	reference?: Accessor<MessageReference | null>;
	refMsg?: MessageType;
	propsRef?: (node: Element) => void;
	dataIndex?: number;
};

const Message = (props: MessageProps) => {
	const AppState = useAppState();
	const message = props.message;
	const reply = props.refMsg !== undefined;
	console.warn('message', message);
	const TabContext = useTabContext();

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

	function ColorDecimalToHex(num: number) {
		let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
		let view = new DataView(arr);
		view.setUint32(0, num, false); // byteOffset = 0; litteEndian = false
		let r = view.getUint8(1);
		let g = view.getUint8(2);
		let b = view.getUint8(3);
		let hexColor = '#' + r.toString(16) + g.toString(16) + b.toString(16);

		return hexColor;
	}
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
	//REPLACE WITH CALL TO RUST
	// const senderRoles = createMemo(() => {
	// 	return AppState.openedGuildsAdditionalData[TabContext.guildId]?.recipients.filter(
	// 		(r) => r.user.id === message.author.id,
	// 	)[0]?.roles;
	// });
	// const senderGroups = createMemo(() => {
	// 	return AppState.openedGuildsAdditionalData[TabContext.guildId]?.groups
	// 		.filter((g) => senderRoles()?.includes(g.data))
	// 		.map((g) => g.data);
	// });
	// const guildGroups = createMemo(() => {
	// 	return AppState.openedGuildsAdditionalData[TabContext.guildId]?.groups;
	// });
	// const senderColor = createMemo(() => {
	// 	return ColorDecimalToHex(
	// 		AppState.userGuilds
	// 			.filter((g) => g.properties.id === TabContext.guildId)[0]
	// 			.roles.filter((r) => senderGroups()?.includes(r.id) && r.color)[0]?.color || 16777215,
	// 	);
	// });
	createEffect(() => {
		console.log(
			'SENDER DATA',
			message.author.username,
			message,
			// senderRoles(),
			// senderGroups(),
			// guildGroups(),
			// senderColor(),
		);
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
	let liRef: HTMLLIElement;
	onMount(() => {
		if (props.dataIndex) {
			liRef.setAttribute('data-index', props.dataIndex.toString());
			props.propsRef(liRef);
		}
	});

	return (
		<li
			data-index={props.dataIndex}
			ref={liRef}
			class={style.message}
			classList={{ [style.same]: props.same, [style.reply]: reply }}
			use:contextMenu
		>
			{/* Reply */}
			<Show when={props.refMsg}>
				<div class={style.replyIcon}>
					<div />
				</div>
				<div class={style.replyContent}>
					<img
						class={style.profile}
						src={refMsgImage()}
						alt={props.refMsg.author.global_name || props.refMsg.author.username}
					/>
					<span class={style.author}>{props.refMsg.author.global_name || props.refMsg.author.username}</span>
					<p class={style.content}>{props.refMsg.content}</p>
				</div>
			</Show>

			<Show
				when={props.same && !reply}
				fallback={
					<button class={[style.left, style.profileImage].join(' ')}>
						<img src={profileImage()} alt={userName()} />
					</button>
				}
			>
				<time class={style.left}>{time()}</time>
			</Show>

			<Show when={!props.same || reply}>
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
