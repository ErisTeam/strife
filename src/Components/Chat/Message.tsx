import { For, Show, createMemo } from 'solid-js';
import API from '../../API';
import { useAppState } from '../../AppState';
import { Message as MessageType } from '../../discord';
import { createContextMenu } from '../ContextMenuNew/ContextMenu';
import Attachments from './Attachments';
import MessageContextMenu from './MessageContextMenu';
import style from './css.module.css';

type MessageProps = {
	message: MessageType;
	updateMessage?: (val: Partial<MessageType>) => void;
	setReference?: (id: string) => void;
	same?: boolean;
};
const Message = (props: MessageProps) => {
	const message = props.message;
	const AppState = useAppState();
	const intl = new Intl.DateTimeFormat(AppState.localeJsFormat(), {
		timeStyle: 'short',
	});
	const formattedMessage = createMemo(() => {
		return API.Messages.formatMarkdown(message.content, message.mentions);
	});

	//TODO: make embeds work
	function formatEmbed(embed: any) {}

	const profileImage = createMemo(() => {
		if (message.author.avatar) {
			return `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=80`;
		} else {
			return '/Friends/fallback.png';
		}
	});

	const userName = createMemo(() => {
		return (message.author.global_name as string) || (message.author.username as string);
	});

	const contextMenu = createContextMenu({
		component: [MessageContextMenu],
		data: message,
	});

	return (
		<li classList={{ [style.message]: !props.same, [style.messageSame]: props.same }} use:contextMenu>
			<Show when={props.same}>
				<time>{intl.format(new Date(message.timestamp))}</time>
			</Show>
			<Show when={!props.same}>
				<button>
					<img src={profileImage()} alt={userName()} />
				</button>
			</Show>
			<div class={style.messageInner}>
				<Show when={!props.same}>
					<div class={style.details}>
						<button>
							{userName()}

							<Show when={message.author.bot}>
								<span class={style.botTag}> Bot</span>
							</Show>
						</button>
						<time>{intl.format(new Date(message.timestamp))}</time>
					</div>
				</Show>
				<p class={style.messageText}>{formattedMessage()}</p>
				<Attachments attachments={message.attachments} />

				<For each={message.embeds}>{(embed) => <h2>{JSON.stringify(embed)}</h2>}</For>
			</div>
		</li>
	);
};
export default Message;
