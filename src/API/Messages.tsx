import { fs } from '@tauri-apps/api';
import UserMention from '../Components/Chat/UserMention';
import type { UploadFile } from '../Components/Chat/Chat';
import type { Message, MessageReference } from '@/types/Messages';
import { getToken } from './User';
import type { GuildMember } from '@/types/Guild';
import type { JSXElement } from 'solid-js';

export const mentionRegex = /(@\S+)/g;
const mentionReplaceRule = /(@(\S+))/g;
const userMentionRegex = '<@!?(\\d+)>';
const channelMentionRegex = '<#(\\d+)>';
const roleMentionRegex = '<@&(\\d+)>';
const commandMentionRegex = '<\\/(\\w+):(\\d+)>';
const emojiRegex = /(<:(?:.+):\d+>)/g;

const mentionsRegex = new RegExp(
	`${userMentionRegex}|${channelMentionRegex}|${roleMentionRegex}|${commandMentionRegex}`,
	'gm',
);

const regex = {
	insides: {
		header3: /^#{3} \s?([^\n]+)/g,
		header2: /^#{2} \s?([^\n]+)/g,
		header1: /^#{1} \s?([^\n]+)/g,
		bold: /(\*{2}(.+?)\*{2})(?!\*)/gm,
		italic: /(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)/gm,
		strikethrough: /(~{2}(.+?)~{2})/g,
		underline: /(__(.+?)__)(?!_)/g,
		alternateItalic: /(?<!_)(_(?!_)(.+?)_)(?!_)/g,
		link: /\[([^\]]+)\]\(([^)]+)\)/g,
		list: /(^- (.*))|(^\* (.*))/gm,
		indentedList: /(^ - (.*))|(^ \* (.*))/g,
		codeBlock: /(`{3}(.+?)`{3})(?!`)/gms,
		code: /(`{1}(.+?)`{1})(?!`)/g,
		quote: /^&gt;{1} \s?([^\n]+)/g,
		spoiler: /(\|{2}(.+?)\|{2})(?!\|)/g,
	},
	outsides: {
		header3: /(^#{3} \s?(?:[^\n]+))/g,
		header2: /(^#{2} \s?(?:[^\n]+))/g,
		header1: /(^#{1} \s?(?:[^\n]+))/g,
		bold: /(\*{2}(?:.+?)\*{2})(?!\*)/gm,
		italic: /(?<!\*)(\*(?!\*)(?:.+?)\*)(?!\*)/gm,
		strikethrough: /(~{2}(?:.+?)~{2})/g,
		underline: /(__(?:.+?)__)(?!_)/g,
		alternateItalic: /(?<!_)(_(?!_)(?:.+?)_)(?!_)/g,
		link: /(\[(?:[^\]]+)\]\((?:[^)]+)\))/g,
		list: /(^- (?:.*))|(^\* (?:.*))/g,
		indentedList: /(^ - (?:.*))|(^ \* (?:.*))/g,
		codeBlock: /(`{3}(?:.+?)`{3})(?!`)/gms,
		code: /(`{1}(?:.+?)`{1})(?!`)/g,
		quote: /(^&gt;{1} \s?(?:[^\n]+))/g,
		spoiler: /(\|{2}(?:.+?)\|{2})(?!\|)/g,
	},
} as const;

const codeRules = [
	[regex.insides.codeBlock, '<pre class="codeblock">$2</pre>'],
	[regex.insides.code, '<code>$2</code>'],
];
const rules = [
	[regex.insides.header3, '<h6>$1</h6>'],
	[regex.insides.header2, '<h5>$1</h5>'],
	[regex.insides.header1, '<h4>$1</h4>'],
	[regex.insides.bold, '<b>$2</b>'],
	[regex.insides.italic, '<i>$2</i>'],
	[regex.insides.strikethrough, '<s>$2</s>'],
	[regex.insides.underline, '<u>$2</u>'],
	[regex.insides.alternateItalic, '<i>$2</i>'],
	[regex.insides.link, '<a class="mdLink" href="$2">$1</a>'],
	[regex.insides.list, '<span class="mdList">$2 $4</span><br>'],
	[regex.insides.indentedList, '<span class="mdIndentedList">$2</span>'],
	[regex.insides.spoiler, '<span class="mdSpoiler">$2</span>'],
	[regex.insides.quote, '<blockquote>$1</blockquote>'],
];
//* = &ast;
//# = &num;
//~ = &tilde;
//_ = &lowbar;
//| = &verbar;
//> = &gt;
//` = &grave;
const codeRulesPreserve = [
	[
		regex.insides.codeBlock,
		'<span class="mdHint">&grave;&grave;&grave;</span><pre class="codeblock">$2</pre><span class="mdHint">&grave;&grave;&grave;</span>',
	],
	[regex.insides.code, '<span class="mdHint">&grave;</span><code>$2</code><span class="mdHint">&grave;</span>'],
];
const rulesPreserve = [
	[regex.insides.header3, '<span class="mdHint">&num;&num;&num;</span><h6>$1</h6>'],
	[regex.insides.header2, '<span class="mdHint">&num;&num;</span><h5>$1</h5>'],
	[regex.insides.header1, '<span class="mdHint">&num;</span><h4>$1</h4>'],
	[regex.insides.bold, '<span class="mdHint">&ast;&ast;</span><b>$2</b><span class="mdHint">&ast;&ast;</span>'],
	[regex.insides.italic, '<span class="mdHint">&ast;</span><i>$2</i><span class="mdHint">&ast;</span>'],
	[
		regex.insides.strikethrough,
		'<span class="mdHint">&tilde;&tilde</span><s>$2</s><span class="mdHint">&tilde;&tilde</span>',
	],
	[
		regex.insides.underline,
		'<span class="mdHint">&lowbar;&lowbar;</span><u>$2</u><span class="mdHint">&lowbar;&lowbar;</span>',
	],
	[regex.insides.alternateItalic, '<span class="mdHint">&lowbar;</span><i>$2</i><span class="mdHint">&lowbar;</span>'],
	[
		regex.insides.spoiler,
		'<span class="mdHint">&verbar;&verbar;</span><span class="mdSpoiler">$2</span><span class="mdHint">&verbar;&verbar;</span>',
	],
	[regex.insides.quote, '<span class="mdHint">&gt; </span><blockquote>$1</blockquote>'],
];

const allHTMLOutsides = new RegExp(
	`${emojiRegex.source}|${mentionsRegex.source}|${regex.insides.link.source}|${regex.insides.header3.source}|${regex.insides.header2.source}|${regex.insides.header1.source}|${regex.insides.bold.source}|${regex.insides.italic.source}|${regex.insides.strikethrough.source}|${regex.insides.underline.source}|${regex.insides.alternateItalic.source}|${regex.insides.link.source}|${regex.insides.list.source}|${regex.insides.indentedList.source}|${regex.insides.codeBlock.source}|${regex.insides.code.source}|${regex.insides.quote.source}|${regex.insides.spoiler.source}|(.+?)`,
	'gms',
);
function escapeHtml(input: string): string {
	const map: { [key: string]: string } = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	};

	return input.replace(/[&<>"']/g, (m) => map[m]);
}

function fixSplits(s: string[]) {
	const splits = s.filter((s) => s !== undefined && s !== 'undefined' && s !== '');

	const newSplits: string[] = [];
	let isInText = false;
	for (const split of splits) {
		if (split.length === 1 && !isInText) {
			newSplits.push(split);
			isInText = true;
		} else if (split.length === 1 && isInText) {
			newSplits[newSplits.length - 1] += split;
		} else {
			newSplits.push(split);
			isInText = false;
		}
	}

	return newSplits;
}

export function formatMarkdownToHTML(c: string, sanitize = true) {
	let content = c;
	if (sanitize) content = escapeHtml(content);
	const split = content.split(allHTMLOutsides);
	const combined = fixSplits(split);
	// const formatted = '';
	console.log('combined', combined);
	// console.log('combined', combined);
	for (const c of combined) {
		// console.log(c);
		if (c.match(regex.insides.codeBlock)) {
			console.log('code', c);

			const [regex, replacement] = codeRules[0];
			const match = c.match(regex);
			if (match) {
				const replaced = c.replaceAll(regex, replacement as string);
				combined[combined.indexOf(c)] = replaced;
			}

			continue;
		}
		if (c.match(regex.insides.code)) {
			console.log('code', c);

			const [regex, replacement] = codeRules[1];
			const match = c.match(regex);
			if (match) {
				const replaced = c.replaceAll(regex, replacement as string);
				combined[combined.indexOf(c)] = replaced;
			}

			continue;
		}

		for (const rule of rules) {
			const [regex, replacement] = rule;
			const match = c.match(regex);
			if (match) {
				const replaced = c.replaceAll(regex, replacement as string);
				combined[combined.indexOf(c)] = formatMarkdownToHTML(replaced, false);
			}
		}
	}
	console.log('combined joined', combined.join(''));
	return combined.join('');
}
export function formatMarkdownToHTMLPreserve(c: string, sanitize = true) {
	let content = c;
	if (sanitize) content = escapeHtml(content);
	const split = content.split(allHTMLOutsides);
	const combined = fixSplits(split);
	// const formatted = '';
	console.log('combined', combined);
	// console.log('combined', combined);
	for (const c of combined) {
		// console.log(c);
		if (c.match(regex.insides.codeBlock)) {
			console.log('code', c);

			const [regex, replacement] = codeRulesPreserve[0];
			const match = c.match(regex);
			if (match) {
				const replaced = c.replaceAll(regex, replacement as string);
				combined[combined.indexOf(c)] = replaced;
			}

			continue;
		}
		if (c.match(regex.insides.code)) {
			console.log('code', c);

			const [regex, replacement] = codeRulesPreserve[1];
			const match = c.match(regex);
			if (match) {
				const replaced = c.replaceAll(regex, replacement as string);
				combined[combined.indexOf(c)] = replaced;
			}

			continue;
		}

		for (const rule of rulesPreserve) {
			const [regex, replacement] = rule;
			const match = c.match(regex);
			if (match) {
				const replaced = c.replaceAll(regex, replacement as string);
				combined[combined.indexOf(c)] = formatMarkdownToHTMLPreserve(replaced, false);
			}
		}
	}
	console.log('combined joined', combined.join(''));
	return combined.join('');
}

export function formatMentions(content: string, mentionsInput: any[]): JSXElement[] | JSXElement {
	const mentions =
		content.match(mentionsRegex)?.map((match) => {
			let element;
			if (match.match(userMentionRegex)) {
				element = <UserMention mentioned_user={mentionsInput.find((mention) => match.includes(mention.id))} />;
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
	if (regex.length === 0) return <>{content}</>;

	const split = content.split(new RegExp(regex, 'gm'));
	const a = [];
	for (let i = 0; i < split.length; i++) {
		a.push(split[i]);
		if (i < mentions.length) {
			a.push(mentions[i].element);
		}
	}
	//TODO: spread operator
	return <>{...a}</>;
}
export async function sendMessage(
	channelId: string,
	messageId: string | null,
	content = '',
	files: UploadFile[] = [],
	isTTS = false,
	embeds: any[] = [],
	mentions: GuildMember[] = [],
	isEditing = false,
	messageReference: MessageReference = null,
	userId: string = null,
) {
	console.log(
		'sendMessage',
		channelId,
		messageId,
		content,
		files,
		isTTS,
		embeds,
		mentions,
		isEditing,
		messageReference,
	);

	const usernameIdPairs = mentions.map((mention) => {
		return {
			username: mention.user.username,
			id: mention.user.id,
		};
	});
	//replace all mentions with their ids
	content = content.replaceAll(mentionReplaceRule, (match) => {
		const user = usernameIdPairs.find((pair) => pair.username === match.substring(1));
		if (user) return `<@${user.id}>`;
		return match;
	});
	console.log('content', content);

	const token = await getToken(userId);
	const url = messageId
		? `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`
		: `https://discord.com/api/v10/channels/${channelId}/messages`;

	const formData = new FormData();
	const attachments = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		if (typeof file === 'string') {
			let fileName: string;

			if (file.includes('/')) {
				fileName = file.split('/')[file.split('/').length - 1];
			} else {
				fileName = file.split('\\')[file.split('\\').length - 1];
			}
			const filearray = await fs.readBinaryFile(file);
			const fileBlob = new Blob([filearray]);
			formData.append(`files[${i}]`, fileBlob, fileName);
			attachments.push({ id: i, filename: fileName });
		} else if (!file.attachmentId) {
			const fileName = file.name;
			const fileBlob = file.blob;
			attachments.push({ id: i, filename: fileName });
			formData.append(`files[${i}]`, fileBlob, fileName);
		} else if (file.attachmentId) {
			attachments.push({ id: file.attachmentId, filename: file.name });
		}
	}
	// I DONT LIKE USING JSON PAYLOAD BUT I COULDNT GET IT TO WORK WITH THE files WITH FORMDATA
	const jsonPayload = {
		content: content,
		attachments: attachments,
		message_reference: messageReference,
	};
	formData.append('payload_json', JSON.stringify(jsonPayload));
	for (const entry of formData.entries()) {
		console.log(entry);
	}

	const method = isEditing ? 'PATCH' : 'POST';
	console.log('method', method, 'url', url, 'token', token);

	const response = await fetch(url, {
		method: method,
		headers: {
			Authorization: token,
		},
		body: formData,
	});
	const json = await response.json();
	console.log(json);
	return response.status === 200;
}

// get the cursor position from .editor start
export function getCursorPosition(parent: Node, node: Node, offset: number, stat: { pos: number; done: boolean }) {
	if (stat.done) return stat;

	let currentNode = null;
	if (parent.childNodes.length === 0) {
		stat.pos += parent.textContent.length;
	} else {
		for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
			currentNode = parent.childNodes[i];
			if (currentNode === node) {
				stat.pos += offset;
				stat.done = true;
				return stat;
			}
			getCursorPosition(currentNode, node, offset, stat);
		}
	}
	return stat;
}

//find the child node and relative position and set it on range
export function setCursorPosition(parent: Node, range: Range, stat: { pos: number; done: boolean }) {
	if (stat.done) return range;

	if (parent.childNodes.length === 0) {
		if (parent.textContent.length >= stat.pos) {
			range.setStart(parent, stat.pos);
			stat.done = true;
		} else {
			stat.pos = stat.pos - parent.textContent.length;
		}
	} else {
		for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
			const currentNode = parent.childNodes[i];
			setCursorPosition(currentNode, range, stat);
		}
	}
	return range;
}
/**
 * Get messages of the given channel.
 * @param channelId
 * @returns
 */
export async function getMessages(channelId: string) {
	const token = await getToken();
	if (!token) {
		console.error("No user token found! Can't get messages!");
		return;
	}

	const url = `https://discord.com/api/v9/channels/${channelId}/messages?limit=50`;
	const resDataponse = await fetch(url, {
		method: 'GET',

		headers: {
			Authorization: token,
		},
	});

	const resData = await resDataponse.json();
	console.log('GET MESSAGES RES DATA', resData);

	return resData as Message[];
}
