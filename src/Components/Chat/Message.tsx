import ContextMenu, { useMenu } from '../ContextMenu/ContextMenu';
import { Message as MessageType } from '../../discord';
import { For, JSX, Show, createMemo, createSignal, onMount } from 'solid-js';
import API from '../../API';

import style from './css.module.css';
import { createContextMenu } from '../ContextMenuNew/ContextMenu';
import UserMention from './UserMention';
import { Download } from 'lucide-solid';
import { useAppState } from '../../AppState';

interface FormatedMessage extends MessageType {
	formatedContent: JSX.Element[];
}
function Menu() {
	const menu = useMenu<MessageType>();
	const authorId = menu.author.id;
	const AppState = useAppState();
	return (
		<Show when={authorId == AppState.userId}>
			<button>edit</button>
		</Show>
	);
}

type MessageProps = {
	message: MessageType;
	updateMessage?: (val: Partial<MessageType>) => void;
	setReference?: (id: string) => void;
	class?: string;
};
const Message = (props: MessageProps) => {
	let embed;

	const val = props.message;
	const message = props.message;
	const intl = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'short',
		timeStyle: 'medium',
	});
	const boldRegex = /(\*{2}(.+?)\*{2})(?!\*)/gm;

	const italicRegex = /(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)/gm;
	const alternateItalicRegex = /(?<!_)(_(?!_)(.+?)_)(?!_)/gm;

	const underlineRegex = /(__(.+?)__)(?!_)/gm;
	const strikethroughRegex = /(~{2}(.+?)~{2})/gm;

	const codeBlockRegex = /(`{3}(.|\n+?)((.|\n)*)`{3})(?!`)/gm;

	const codeLineRegex = /(`(.+?)`)(?!``)(?<!``)/gm;
	const headerOneRegex = /(^# .*)/gm;
	const headerTwoRegex = /(^## .*)/gm;

	const headerThreeRegex = /(^### .*)/gm;
	const listRegex = /(^- .*)|(^\* .*)/gm;
	const listIndentedRegex = /(^ - .*)|(^ \* .*)/gm;

	const quoteRegex = /(^> .*)/gm;
	const mdLinkRegex = /\[(.*?)\]\((https?:\/\/(?:[-\w]+\.)?([-\w]+))\)/gm;
	const linkRegex = /https?:\/\/(?:[-\w]+\.)?([-\w]+)/gm;
	const spoilerRegex = /(\|{2}(.+?)\|{2})(?!\*)/gm;

	const newlineRegex = /(\n)/gm;
	const allClosableRegex = new RegExp(
		`${boldRegex.source}|${italicRegex.source}|${underlineRegex.source}|${strikethroughRegex.source}|${alternateItalicRegex.source}|${codeBlockRegex.source}|${codeLineRegex.source}|${spoilerRegex.source}`,
		'gm',
	);

	const spaceBetweenFormattedText =
		/(?<=((\*{2}(.+?)\*{2})(?!\*)|(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)|(__(.+?)__)(?!_)|(~{2}(.+?)~{2})(?!~)(?!~)|(?<!_)(_(?!_)(.+?)_)(?!_)|(`{3}(.|\n+?)((.|\n)*)`{3})(?!`)|(`(.+?)`)(?!``)(?<!``)|(\n)))( +?)(?=((\*{2}(.+?)\*{2})(?!\*)|(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)|(__(.+?)__)(?!_)|(~{2}(.+?)~{2})(?!~)(?!~)|(?<!_)(_(?!_)(.+?)_)(?!_)|(`{3}(.|\n+?)((.|\n)*)`{3})(?!`)|(`(.+?)`)(?!``)(?<!``)|(\|{2}(.+?)\|{2})(?!\*)|(\n)))/gm;

	const regex =
		/(\*{2}(.+?)\*{2})(?!\*)|(\|{2}(.+?)\|{2})(?!\*)|(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)|(__(.+?)__)(?!_)|(~{2}(.+?)~{2})(?!~)(?!~)|(?<!_)(_(?!_)(.+?)_)(?!_)|(`{3}(.|\n+?)((.|\n)*)`{3})(?!`)|(`(.+?)`)(?!``)(?<!``)|(\n)|(?<=((\*{2}(.+?)\*{2})(?!\*)|(\|{2}(.+?)\|{2})(?!\*)|(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)|(__(.+?)__)(?!_)|(~{2}(.+?)~{2})(?!~)(?!~)|(?<!_)(_(?!_)(.+?)_)(?!_)|(`{3}(.|\n+?)((.|\n)*)`{3})(?!`)|(`(.+?)`)(?!``)(?<!``)|(\n)))( +?)(?=((\*{2}(.+?)\*{2})(?!\*)|(\|{2}(.+?)\|{2})(?!\*)|(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)|(__(.+?)__)(?!_)|(~{2}(.+?)~{2})(?!~)(?!~)|(?<!_)(_(?!_)(.+?)_)(?!_)|(`{3}(.|\n+?)((.|\n)*)`{3})(?!`)|(`(.+?)`)(?!``)(?<!``)|(\n)))|(^# .*)|(^## .*)|(^### .*)|((^- .*)|(^\* .*))|((^ - .*)|(^ \* .*))|(^> .*)|\[(.*?)\]\((.*?)\)|(.*)/gm;

	function formatMentions(content: string) {
		const userMentionRegex = '<@!?(\\d+)>';
		const channelMentionRegex = '<#(\\d+)>';
		const roleMentionRegex = '<@&(\\d+)>';
		const commandMentionRegex = '<\\/(\\w+):(\\d+)>';

		const mentionsRegex = new RegExp(
			`${userMentionRegex}|${channelMentionRegex}|${roleMentionRegex}|${commandMentionRegex}`,
			'gm',
		);
		const mentions =
			content.match(mentionsRegex)?.map((match) => {
				let element;
				if (match.match(userMentionRegex)) {
					element = <UserMention mentioned_user={message.mentions.find((mention) => match.includes(mention.id))} />;
				} else if (match.match(channelMentionRegex)) {
					element = <mark style={{ background: 'green' }}>{match}</mark>;
				} else if (match.match(roleMentionRegex)) {
					element = <mark style={{ background: 'yellow' }}>{match}</mark>;
				} else if (match.match(commandMentionRegex)) {
					element = <mark style={{ background: 'red' }}>{match}</mark>;
				} else {
					element = <mark style={{ background: 'black' }}>{match}</mark>;
				}
				return { match: match, element: element };
			}) || [];

		const regex = mentions.map((e) => e.match).join('|');
		//console.log(regex);
		if (regex.length == 0) return <>{content}</>;
		//console.log(regex, content.split(new RegExp(regex, 'gm')), mentions);
		const split = content.split(new RegExp(regex, 'gm'));
		const a = [];
		for (let i = 0; i < split.length; i++) {
			a.push(split[i]);
			if (i < mentions.length) {
				a.push(mentions[i].element);
			}
		}

		return <>{...a}</>;
	}

	function formatMarkdown(content: string) {
		const matches = content.match(regex) || [];

		if (matches.length == 0) {
			return formatMentions(content);
		}
		return (
			<>
				{...matches.map((match) => {
					switch (true) {
						case !!match.match(codeBlockRegex):
							return <pre class={style.block}>{match.replace(/```/gm, '')}</pre>;
						case !!match.match(codeLineRegex):
							return <code>{match.replace(/`/gm, '')}</code>;
						case !!match.match(boldRegex):
							return <strong>{formatMarkdown(match.replace(/\*\*/gm, ''))}</strong>;
						case !!match.match(italicRegex):
							return <em>{formatMarkdown(match.replace(/(?<!\*)\*(?!\*)/gm, ''))}</em>;
						case !!match.match(underlineRegex):
							return <u>{formatMarkdown(match.replace(/__/gm, ''))}</u>;
						case !!match.match(alternateItalicRegex):
							return <em>{formatMarkdown(match.replace(/(?<!_)_(?!_)/gm, ''))}</em>;
						case !!match.match(strikethroughRegex):
							return <s>{formatMarkdown(match.replace(/~~/gm, ''))}</s>;
						case !!match.match(newlineRegex):
							return <br />;
						case !!match.match(headerOneRegex):
							return <h4>{formatMarkdown(match.slice(1))}</h4>;
						case !!match.match(headerTwoRegex):
							return <h5>{formatMarkdown(match.slice(2))}</h5>;
						case !!match.match(headerThreeRegex):
							return <h6>{formatMarkdown(match.slice(3))}</h6>;
						case !!match.match(listRegex):
							return <span class={style.list}>{formatMarkdown(match.slice(2))}</span>;
						case !!match.match(listIndentedRegex):
							return <span class={style.indentedList}>{formatMarkdown(match.slice(3))}</span>;
						case !!match.match(quoteRegex):
							return <q>{formatMarkdown(match.slice(2))}</q>;
						case !!match.match(spoilerRegex):
							return <span class={style.spoiler}>{formatMarkdown(match.replace(/\|\|/gm, ''))}</span>;
						case !!match.match(mdLinkRegex):
							return <a href={match.match(linkRegex)[0]}>{match.match(/(?<=\[).*?(?=\])/gm)[0]}</a>;
						default:
							return <>{formatMentions(match)}</>;
					}
				}) || []}
			</>
		);
	}

	const formattedMessage = createMemo(() => {
		return formatMarkdown(message.content);
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

	const contextMenu = createContextMenu({
		component: [Menu],
		data: message,
	});

	const userName = createMemo(() => {
		return message.author.global_name || message.author.username;
	});

	return (
		<li class={[style.message, props.class].join(' ')} use:contextMenu>
			<button>
				<img src={profileImage()} alt={userName()} />
			</button>
			<div class={style.messageInner}>
				<div class={style.details}>
					<button>
						{userName()}

						<Show when={message.author.bot}>
							<span style={{ color: 'violet' }}> Bot</span>
						</Show>
					</button>
					<time>{intl.format(new Date(message.timestamp))}</time>
				</div>
				<p>{formattedMessage()}</p>
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
			<aside class={style.sameTime}>{intl.format(new Date(message.timestamp))}</aside> {/* TODO: czas */}
		</li>
	);
};
export default Message;
