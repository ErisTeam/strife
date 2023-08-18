import ContextMenu, { useMenu } from '../ContextMenu/ContextMenu';
import { Message as MessageType } from '../../discord';
import { For, JSX, Show, createMemo } from 'solid-js';
import API from '../../API';

import style from './css.module.css';
import { createContextMenu } from '../ContextMenuNew/ContextMenu';
import UserMention from './UserMention';

interface FormatedMessage extends MessageType {
	formatedContent: JSX.Element[];
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
			content.match(mentionsRegex)?.map((match, index) => {
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
		const boldRegex = /(\*{2}(.+?)\*{2})(?!\*)/gm;

		const italicRegex = /(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)/gm;
		const alternateItalicRegex = /(?<!_)(_(?!_)(.+?)_)(?!_)/gm;

		const underlineRegex = /(__(.+?)__)(?!_)/gm;
		const strikethroughRegex = /(~(.+?)~)(?!~)/gm;

		const codeBlockRegex = /(```(.+?)```)(?!`)/gm;
		const codeLineRegex = /(`(.+?)`)(?!``)(?<!``)/gm;
		const headerOneRegex = /(^# .*)/gm;
		const headerTwoRegex = /(^## .*)/gm;

		const headerThreeRegex = /(^### .*)/gm;
		const listRegex = /(^- .*)|(^\* .*)/gm;
		const listIndentedRegex = /(^ - .*)|(^ \* .*)/gm;

		const quoteRegex = /(^> .*)/gm;
		const mdLinkRegex = /\[(.*?)\]\((.*?)\)/gm;
		const linkRegex = /https?:\/\/(?:[-\w]+\.)?([-\w]+)/gm;

		const newlineRegex = /(\n)/gm;
		const spaceBetweenFormattedText =
			/(?<=((\*{2}(.+?)\*{2})(?!\*)|(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)|(__(.+?)__)(?!_)|(~(.+?)~)(?!~)|(?<!_)(_(?!_)(.+?)_)(?!_)|(```(.+?)```)(?!`)|(`(.+?)`)(?!``)(?<!``)|(\n)))( +?)(?=((\*{2}(.+?)\*{2})(?!\*)|(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)|(__(.+?)__)(?!_)|(~(.+?)~)(?!~)|(?<!_)(_(?!_)(.+?)_)(?!_)|(```(.+?)```)(?!`)|(`(.+?)`)(?!``)(?<!``)|(\n)))/gm;

		const regex =
			/(\*{2}(.+?)\*{2})(?!\*)|(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)|(__(.+?)__)(?!_)|(~(.+?)~)(?!~)|(?<!_)(_(?!_)(.+?)_)(?!_)|(```(.+?)```)(?!`)|(`(.+?)`)(?!``)(?<!``)|(\n)|(?<=((\*{2}(.+?)\*{2})(?!\*)|(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)|(__(.+?)__)(?!_)|(~(.+?)~)(?!~)|(?<!_)(_(?!_)(.+?)_)(?!_)|(```(.+?)```)(?!`)|(`(.+?)`)(?!``)(?<!``)|(\n)))( +?)(?=((\*{2}(.+?)\*{2})(?!\*)|(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)|(__(.+?)__)(?!_)|(~(.+?)~)(?!~)|(?<!_)(_(?!_)(.+?)_)(?!_)|(```(.+?)```)(?!`)|(`(.+?)`)(?!``)(?<!``)|(\n)))|(^# .*)|(^## .*)|(^### .*)|((^- .*)|(^\* .*))|((^ - .*)|(^ \* .*))|(^> .*)|\[(.*?)\]\((.*?)\)|(.*)/gm;

		const matches = content.match(regex) || [];
		//get whitespace between matches

		if (matches.length == 0) {
			return formatMentions(content);
		}

		const results =
			matches?.map((match) => {
				let element;
				if (match.match(codeBlockRegex)) {
					const inner = match.replace(/```/gm, '');
					element = <code class={style.block}>{inner}</code>;
				} else if (match.match(codeLineRegex)) {
					const inner = match.replace(/`/gm, '');
					element = <code>{inner}</code>;
				} else if (match.match(boldRegex)) {
					const inner = match.replace(/\*\*/gm, '');
					element = <strong>{formatMarkdown(inner)}</strong>;
				} else if (match.match(italicRegex)) {
					const inner = match.replace(/\*/gm, '');
					element = <em>{formatMarkdown(inner)}</em>;
				} else if (match.match(underlineRegex)) {
					const inner = match.replace(/__/gm, '');
					element = <u>{formatMarkdown(inner)}</u>;
				} else if (match.match(alternateItalicRegex)) {
					const inner = match.replace(/_/gm, '');
					element = <em>{formatMarkdown(inner)}</em>;
				} else if (match.match(strikethroughRegex)) {
					const inner = match.replace(/~~/gm, '');
					element = <s>{formatMarkdown(inner)}</s>;
				} else if (match.match(newlineRegex)) {
					element = <br />;
				} else if (match.match(headerOneRegex)) {
					const inner = match.slice(1);
					element = <h4>{formatMarkdown(inner)}</h4>;
				} else if (match.match(headerTwoRegex)) {
					const inner = match.slice(2);
					element = <h5>{formatMarkdown(inner)}</h5>;
				} else if (match.match(headerThreeRegex)) {
					const inner = match.slice(3);
					element = <h6>{formatMarkdown(inner)}</h6>;
				} else if (match.match(listRegex)) {
					const inner = match.slice(2);
					element = <span class={style.list}>{formatMarkdown(inner)}</span>;
				} else if (match.match(listIndentedRegex)) {
					const inner = match.slice(3);
					element = <span class={style.indentedList}>{formatMarkdown(inner)}</span>;
				} else if (match.match(quoteRegex)) {
					const inner = match.slice(2);
					element = <q>{formatMarkdown(inner)}</q>;
				} else if (match.match(mdLinkRegex)) {
					const link = match.match(linkRegex);
					const text = match.match(/(?<=\[).*?(?=\])/gm);
					if (link && text) {
						element = <a href={link[0]}>{text[0]}</a>;
					} else {
						element = <>{formatMentions(match)}</>;
					}
				} else {
					element = <>{formatMentions(match)}</>;
				}

				return element;
			}) || [];

		return <>{...results}</>;
	}

	const formatedMessage = createMemo(() => {
		return formatMarkdown(message.content);
	});

	const formatedAttachments = createMemo(() => {
		return formatAttachments(message.attachments);
	});
	//TODO: make embeds work
	function formatEmbed(embed: any) {}

	//! REPLACE TYPE AFTER IT GETS ADDED TO PROTOBUF
	function formatAttachments(ats: any[]): JSX.Element[] {
		console.log(ats);
		const returnables = [];
		if (ats.length == 0) return;
		for (let i = 0; i < ats.length; i++) {
			if (ats[i].content_type.includes('image')) {
				returnables.push(
					<li class={style.image}>
						<img src={ats[i].url} alt={message.content} />
					</li>,
				);
			}
		}
		return returnables;
	}

	const profileImage = createMemo(() => {
		if (message.author.avatar) {
			return `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=80`;
		} else {
			return '/Friends/fallback.png';
		}
	});

	function Menu() {
		const menu = useMenu<MessageType>();
		return <button>edit</button>;
	}

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
				<p>{formatedMessage()}</p>
				<Show when={message.attachments?.length > 0}>
					<div class={style.wrapper}>
						<ul class={style.attachments}>{formatedAttachments()}</ul>
					</div>
				</Show>

				<For each={message.embeds}>{(embed) => <h2>{JSON.stringify(embed)}</h2>}</For>
			</div>
		</li>
	);
};
export default Message;
