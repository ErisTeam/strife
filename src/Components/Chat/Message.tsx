import { For, JSX, Show, createMemo, createSignal, onMount } from 'solid-js';
import API from '../../API';
import { Message as MessageType } from '../../discord';

import { Download } from 'lucide-solid';
import { useAppState } from '../../AppState';
import { createContextMenu } from '../ContextMenuNew/ContextMenu';
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
		// return formatMarkdown(message.content);
		return API.Messages.formatMarkdown(message.content, message.mentions);
	});

	const [formattedImages, setFormattedImages] = createSignal<JSX.Element[]>([]);
	const [formattedVideos, setFormattedVideos] = createSignal<JSX.Element[]>([]);
	const [formattedAudios, setFormattedAudios] = createSignal<JSX.Element[]>([]);

	onMount(() => {
		formatAttachments(message.attachments);
	});
	//TODO: make embeds work
	function formatEmbed(embed: any) {}

	//! REPLACE TYPE AFTER IT GETS ADDED TO PROTOBUF
	function formatAttachments(ats: any[]) {
		console.log(ats);
		const images = [];
		const videos = [];
		const audios = [];
		if (ats.length == 0) return;
		for (let i = 0; i < ats.length; i++) {
			if (ats[i].content_type.includes('image')) {
				images.push(
					<li class={style.image}>
						<a class={style.download} href={ats[i].url} target="_blank">
							<Download />
						</a>
						<img src={ats[i].url} alt={message.content} />
					</li>,
				);
			}
			if (ats[i].content_type.includes('video')) {
				videos.push(
					<li class={style.video}>
						<a class={style.download} href={ats[i].url} target="_blank">
							<Download />
						</a>
						<video controls src={ats[i].url} />
					</li>,
				);
			}
			if (ats[i].content_type.includes('audio')) {
				audios.push(
					<li>
						<a class={style.download} href={ats[i].url} target="_blank">
							<Download />
						</a>
						<span>{ats[i].filename}</span>
						<audio controls src={ats[i].url} />
					</li>,
				);
			}
		}
		setFormattedImages(images);
		setFormattedVideos(videos);
		setFormattedAudios(audios);
	}

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

	/* eslint-disable */
	// @ts-ignore DISPLAYS ERROR THAT ITS NOT BEING USED, BUT IT IS:
	const contextMenu = createContextMenu({
		component: [MessageContextMenu],
		data: message,
	});

	if (props.same) {
		return (
			<li class={style.messageSame} use:contextMenu>
				<time>{intl.format(new Date(message.timestamp))}</time>

				<div class={style.messageInner}>
					<p class={style.messageText}>{formattedMessage()}</p>
					<Show when={formattedImages().length > 0 || formattedVideos().length > 0}>
						<ul class={style.attachments}>
							{formattedVideos()}
							{formattedImages()}
						</ul>
					</Show>
					<Show when={formattedAudios().length > 0}>
						<ul class={style.audios}>{formattedAudios()}</ul>
					</Show>

					<For each={message.embeds}>{(embed) => <h2>{JSON.stringify(embed)}</h2>}</For>
				</div>
			</li>
		);
	}
	return (
		<li class={style.message} use:contextMenu>
			<button>
				<img src={profileImage()} alt={userName()} />
			</button>
			<div class={style.messageInner}>
				<div class={style.details}>
					<button>
						{userName()}

						<Show when={message.author.bot}>
							<span class={style.botTag}> Bot</span>
						</Show>
					</button>
					<time>{intl.format(new Date(message.timestamp))}</time>
				</div>
				<p class={style.messageText}>{formattedMessage()}</p>
				<Show when={formattedImages().length > 0 || formattedVideos().length > 0}>
					<ul class={style.attachments}>
						{formattedVideos()}
						{formattedImages()}
					</ul>
				</Show>
				<Show when={formattedAudios().length > 0}>
					<ul class={style.audios}>{formattedAudios()}</ul>
				</Show>

				<For each={message.embeds}>{(embed) => <h2>{JSON.stringify(embed)}</h2>}</For>
			</div>
		</li>
	);
};
export default Message;
