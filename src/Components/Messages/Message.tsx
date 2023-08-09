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

	function formatContent(content: string) {
		const userMentionRegex = '<@!?(\\d+)>';
		const channelMentionRegex = '<#(\\d+)>';
		const roleMentionRegex = '<@&(\\d+)>';
		const commandMenionRegex = '<\\/(\\w+):(\\d+)>';

		const mentionsRegex = new RegExp(
			`${userMentionRegex}|${channelMentionRegex}|${roleMentionRegex}|${commandMenionRegex}`,
			'gm',
		);
		const mentions =
			content.match(mentionsRegex)?.map((match, index) => {
				let element;
				if (match.match(userMentionRegex)) {
					element = <UserMention mentioned_user={message.mentions.find((mention) => match.includes(mention.id))} />;
				} else if (match.match(channelMentionRegex)) {
					element = <span style={{ background: 'green' }}>{match}</span>;
				} else if (match.match(roleMentionRegex)) {
					element = <span style={{ background: 'yellow' }}>{match}</span>;
				} else if (match.match(commandMenionRegex)) {
					element = <span style={{ background: 'red' }}>{match}</span>;
				} else {
					element = <span style={{ background: 'black' }}>{match}</span>;
				}
				return { match: match, element: element };
			}) || [];

		let regex = mentions.map((e) => e.match).join('|');
		//console.log(regex);
		if (regex.length == 0) return <p>{content}</p>;
		//console.log(regex, content.split(new RegExp(regex, 'gm')), mentions);
		const splited = content.split(new RegExp(regex, 'gm'));
		let a = [];
		for (let i = 0; i < splited.length; i++) {
			a.push(splited[i]);
			if (i < mentions.length) {
				a.push(mentions[i].element);
			}
		}

		return <p>{...a}</p>;
	}

	const formatedMessage = createMemo(() => {
		return formatContent(message.content);
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
				{formatedMessage()}
				<For each={message.embeds}>{(embed) => <h2>{JSON.stringify(embed)}</h2>}</For>
			</div>
		</li>
	);
};
export default Message;
