import { fs } from '@tauri-apps/api';
import API from '../API';
import UserMention from '../Components/Chat/UserMention';
const userMentionRegex = '<@!?(\\d+)>';
const channelMentionRegex = '<#(\\d+)>';
const roleMentionRegex = '<@&(\\d+)>';
const commandMentionRegex = '<\\/(\\w+):(\\d+)>';
const emojiRegex = /(\<:(?:.+):\d+\>)/g;

const mentionsRegex = new RegExp(
	`${userMentionRegex}|${channelMentionRegex}|${roleMentionRegex}|${commandMentionRegex}`,
	'gm',
);
const markdownChars = ['###', '##', '#', '**', ' * ', '* ', '*', '~~', '__', '_', ' - ', '- ', '```', '`', '> ', '||'];
const linkRegex =
	/(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*))/g;
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
		list: /(^- (.*))|(^\* (.*))/g,
		indentedList: /(^ - (.*))|(^ \* (.*))/g,
		codeBlock: /(`{3}([\S\s]+)`{3})(?!`)/gm,
		code: /(`{1}(.+?[^`+])`{1})(?!`)/g,
		quote: />{1} \s?([^\n]+)/g,
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
		codeBlock: /(`{3}(?:[\S\s]+)`{3})(?!`)/gm,
		code: /(`{1}(?:.+?[^`+])`{1})(?!`)/g,
		quote: /(>{1} \s?(?:[^\n]+))/g,
		spoiler: /(\|{2}(?:.+?)\|{2})(?!\|)/g,
	},
} as const;

const ruleSplitter = /(`{3}(?:.+?)`{3})(?!`)|(`{1}(?:.+?[^`+])`{1})(?!`)/gm;
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
	[regex.insides.link, '<a href="$2">$1</a>'],
	[regex.insides.list, '<span class="mdList">$2</span>'],
	[regex.insides.indentedList, '<span class="mdIndentedList">$2</span>'],
];

const allHTMLOutsides = new RegExp(
	`${emojiRegex.source}|${mentionsRegex.source}|${linkRegex.source}|${regex.outsides.header3.source}|${regex.outsides.header2.source}|${regex.outsides.header1.source}|${regex.outsides.bold.source}|${regex.outsides.italic.source}|${regex.outsides.strikethrough.source}|${regex.outsides.underline.source}|${regex.outsides.alternateItalic.source}|${regex.outsides.link.source}|${regex.outsides.list.source}|${regex.outsides.indentedList.source}|${regex.outsides.codeBlock.source}|${regex.outsides.code.source}|${regex.outsides.quote.source}|${regex.outsides.spoiler.source}|(.+?)`,
	'gm',
);
const markdownVerifier = new RegExp(
	`${regex.outsides.header3.source}|${regex.outsides.header2.source}|${regex.outsides.header1.source}|${regex.outsides.bold.source}|${regex.outsides.italic.source}|${regex.outsides.strikethrough.source}|${regex.outsides.underline.source}|${regex.outsides.alternateItalic.source}|${regex.outsides.link.source}|${regex.outsides.list.source}|${regex.outsides.indentedList.source}|${regex.outsides.codeBlock.source}|${regex.outsides.code.source}|${regex.outsides.quote.source}|${regex.outsides.spoiler.source}`,
	'gm',
);
function addX(count: number) {
	let returnString = '';
	for (let i = 0; i < count; i++) {
		returnString += 'x';
	}
	return returnString;
}
function fixSplits(splits: string[]) {
	splits = splits.filter((s) => s != undefined && s != 'undefined' && s != '');

	const newSplits: string[] = [];
	let isInText = false;
	splits.forEach((split) => {
		if (split.length == 1 && !isInText) {
			newSplits.push(split);
			isInText = true;
		} else if (split.length == 1 && isInText) {
			newSplits[newSplits.length - 1] += split;
		} else {
			newSplits.push(split);
			isInText = false;
		}
	});

	return newSplits;
}
function getMarkdownIndexes(split: string): Array<[number, string]> {
	const markdownIndexes: Array<[number, string]> = [];

	for (let i = 0; i < markdownChars.length; i++) {
		const index = split.indexOf(markdownChars[i]);
		if (!(markdownChars[i] == ' - ' && index > split.length / 2)) {
			if (index != -1) markdownIndexes.push([index, markdownChars[i]]);
		}
		split = split.replaceAll(markdownChars[i], addX(markdownChars[i].length));
	}

	return markdownIndexes.sort((a, b) => a[0] - b[0]);
}

export default {
	formatMarkdownToJSX(content: string, mentions: any[] = []): Element[] | Element | string {
		if (content == undefined) return '';
		let splits = content.split(allHTMLOutsides);
		splits = fixSplits(splits);
		if (splits.length == 0) return '';
		if (splits.length == 1 && !splits[0].match(markdownVerifier)) {
			return this.formatMentions(splits[0], mentions);
		}

		const results = splits.map((split) => {
			const markdownIndexes: Array<[number, string]> = getMarkdownIndexes(split);

			if (split.match(regex.outsides.link)) {
				const matches = split.matchAll(regex.insides.link).next();
				return (
					<a href={matches.value[2]} class="mdLink">
						{matches.value[1]}
					</a>
				);
			}
			if (split.match(linkRegex)) {
				return split;
			}
			if (split.match(emojiRegex)) {
				// TODO:ADD EMOJI FORMATTING
				return split;
			}
			if (split.match(mentionsRegex)) {
				return this.formatMentions(split, mentions);
			}

			if (markdownIndexes.length == 0) {
				return this.formatMarkdownToJSX(split);
			}

			switch (markdownIndexes[0][1]) {
				case '**': {
					return <b>{this.formatMarkdownToJSX(split.matchAll(regex.insides.bold).next().value[2], mentions)}</b>;
				}
				case '*': {
					return <i>{this.formatMarkdownToJSX(split.matchAll(regex.insides.italic).next().value[2], mentions)}</i>;
				}
				case '~~': {
					return (
						<s>{this.formatMarkdownToJSX(split.matchAll(regex.insides.strikethrough).next().value[2], mentions)}</s>
					);
				}
				case '__': {
					return <u>{this.formatMarkdownToJSX(split.matchAll(regex.insides.underline).next().value[2], mentions)}</u>;
				}
				case '_': {
					return (
						<i>{this.formatMarkdownToJSX(split.matchAll(regex.insides.alternateItalic).next().value[2], mentions)}</i>
					);
				}
				case '- ': {
					return (
						<span class="mdList">
							{this.formatMarkdownToJSX(split.matchAll(regex.insides.list).next().value[2], mentions)}
						</span>
					);
				}
				case '* ': {
					return (
						<span class="mdList">
							{this.formatMarkdownToJSX(split.matchAll(regex.insides.list).next().value[4], mentions)}
						</span>
					);
				}
				case ' - ': {
					console.log('indented list');
					console.log(split);
					return (
						<span class="mdIndentedList">
							{this.formatMarkdownToJSX(split.matchAll(regex.insides.indentedList).next().value[2], mentions)}
						</span>
					);
				}
				case ' * ': {
					return (
						<span class="mdIndentedList">
							{this.formatMarkdownToJSX(split.matchAll(regex.insides.indentedList).next().value[4], mentions)}
						</span>
					);
				}
				case '```': {
					return <pre class="codeblock">{split.matchAll(regex.insides.codeBlock).next().value[2]}</pre>;
				}
				case '`': {
					return <code>{split.matchAll(regex.insides.code).next().value[2]}</code>;
				}
				case '#': {
					return <h4>{this.formatMarkdownToJSX(split.matchAll(regex.insides.header1).next().value[1], mentions)}</h4>;
				}
				case '##': {
					return <h5>{this.formatMarkdownToJSX(split.matchAll(regex.insides.header2).next().value[1], mentions)}</h5>;
				}
				case '###': {
					return <h6>{this.formatMarkdownToJSX(split.matchAll(regex.insides.header3).next().value[1], mentions)}</h6>;
				}
				case '> ': {
					return <q>{this.formatMarkdownToJSX(split.matchAll(regex.insides.quote).next().value[1], mentions)}</q>;
				}
				case '||': {
					return (
						<span class="mdSpoiler">
							{this.formatMarkdownToJSX(split.matchAll(regex.insides.spoiler).next().value[2], mentions)}
						</span>
					);
				}

				default: {
					return this.formatMarkdownToJSX(split);
				}
			}
		});

		return [...results] as Element[];
	},
	formatMarkdownToJSXPreserve(content: string, mentions: any[] = []): Element[] | Element | string {
		if (content == undefined) return '';
		let splits = content.split(allHTMLOutsides);
		splits = fixSplits(splits);
		if (splits.length == 0) return '';
		if (splits.length == 1 && !splits[0].match(markdownVerifier)) {
			return this.formatMentions(splits[0], mentions);
		}

		const results = splits.map((split) => {
			const markdownIndexes: Array<[number, string]> = getMarkdownIndexes(split);

			if (split.match(linkRegex)) {
				return split;
			}
			if (split.match(emojiRegex)) {
				// TODO:ADD EMOJI FORMATTING
				return split;
			}
			if (split.match(mentionsRegex)) {
				return this.formatMentions(split, mentions);
			}
			if (markdownIndexes.length == 0) {
				return this.formatMarkdownToJSXPreserve(split);
			}
			switch (markdownIndexes[0][1]) {
				case '**': {
					return (
						<>
							<span class="mdSuggestion">**</span>
							<b>{this.formatMarkdownToJSXPreserve(split.matchAll(regex.insides.bold).next().value[2], mentions)}</b>
							<span class="mdSuggestion">**</span>
						</>
					);
				}
				case '*': {
					return (
						<>
							<span class="mdSuggestion">*</span>
							<i>{this.formatMarkdownToJSXPreserve(split.matchAll(regex.insides.italic).next().value[2], mentions)}</i>
							<span class="mdSuggestion">*</span>
						</>
					);
				}
				case '~~': {
					return (
						<>
							<span class="mdSuggestion">~~</span>

							<s>
								{this.formatMarkdownToJSXPreserve(
									split.matchAll(regex.insides.strikethrough).next().value[2],
									mentions,
								)}
							</s>
							<span class="mdSuggestion">~~</span>
						</>
					);
				}
				case '__': {
					return (
						<>
							<span class="mdSuggestion">__</span>
							<u>
								{this.formatMarkdownToJSXPreserve(split.matchAll(regex.insides.underline).next().value[2], mentions)}
							</u>
							<span class="mdSuggestion">__</span>
						</>
					);
				}
				case '_': {
					return (
						<>
							<span class="mdSuggestion">_</span>
							<i>
								{this.formatMarkdownToJSXPreserve(
									split.matchAll(regex.insides.alternateItalic).next().value[2],
									mentions,
								)}
							</i>
							<span class="mdSuggestion">_</span>
						</>
					);
				}

				case '```': {
					return (
						<>
							<span class="mdSuggestion">```</span>
							<pre class="codeblock">{split.matchAll(regex.insides.codeBlock).next().value[2]}</pre>
							<span class="mdSuggestion">```</span>
						</>
					);
				}
				case '`': {
					return (
						<>
							<span class="mdSuggestion">`</span>
							<code>{split.matchAll(regex.insides.code).next().value[2]}</code>
							<span class="mdSuggestion">`</span>
						</>
					);
				}

				case '||': {
					return (
						<>
							<span class="mdSuggestion">||</span>
							<span class="mdSpoiler">
								{this.formatMarkdownToJSXPreserve(split.matchAll(regex.insides.spoiler).next().value[2], mentions)}
							</span>
							<span class="mdSuggestion">||</span>
						</>
					);
				}
				case '#': {
					const inside = this.formatMarkdownToJSXPreserve(
						split.matchAll(regex.insides.header1).next().value[1],
						mentions,
					);
					return <># {inside}</>;
				}
				case '##': {
					const inside = this.formatMarkdownToJSXPreserve(
						split.matchAll(regex.insides.header2).next().value[1],
						mentions,
					);
					return <>## {inside}</>;
				}
				case '###': {
					const inside = this.formatMarkdownToJSXPreserve(
						split.matchAll(regex.insides.header3).next().value[1],
						mentions,
					);
					return <>### {inside}</>;
				}
				case '> ': {
					const inside = this.formatMarkdownToJSXPreserve(
						split.matchAll(regex.insides.quote).next().value[1],
						mentions,
					);
					return (
						<>
							{'> '}
							{inside}
						</>
					);
				}
				case '- ': {
					const inside = this.formatMarkdownToJSXPreserve(split.matchAll(regex.insides.list).next().value[2], mentions);
					return <>- {inside}</>;
				}
				case '* ': {
					const inside = this.formatMarkdownToJSXPreserve(split.matchAll(regex.insides.list).next().value[4], mentions);
					return <>* {inside}</>;
				}
				case ' - ': {
					const inside = this.formatMarkdownToJSXPreserve(
						split.matchAll(regex.insides.indentedList).next().value[2],
						mentions,
					);
					return <> - {inside}</>;
				}
				case ' * ': {
					const inside = this.formatMarkdownToJSXPreserve(
						split.matchAll(regex.insides.indentedList).next().value[4],
						mentions,
					);
					return (
						<>
							{' * '}
							{inside}
						</>
					);
				}

				default: {
					return this.formatMarkdownToJSXPreserve(split);
				}
			}
		});

		return [...results] as Element[];
	},

	formatMarkdownToHTML(content: string) {
		const split = content.split(ruleSplitter);
		const combined: string[] = [];
		let isInText = false;

		split.forEach((s) => {
			if (s == undefined) s = '';
			if (s && s.match(ruleSplitter) != null) {
				combined.push(s);
				isInText = false;
			} else {
				if (!isInText) {
					combined.push(s);
					isInText = true;
				} else {
					combined[combined.length - 1] += s;
				}
			}
		});

		for (let i = 0; i < combined.length; i++) {
			if (combined[i].match(ruleSplitter) != null) {
				codeRules.forEach(([rule, template]) => {
					//this error is just plain wrong
					combined[i] = combined[i].replaceAll(rule, template);
				});
			} else {
				rules.forEach(([rule, template]) => {
					//this error is just plain wrong
					combined[i] = combined[i].replaceAll(rule, template);
				});
			}
		}

		return combined.join('');
	},

	formatMentions(content: string, mentionsInput: any[]) {
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
		if (regex.length == 0) return <>{content}</>;

		const split = content.split(new RegExp(regex, 'gm'));
		const a = [];
		for (let i = 0; i < split.length; i++) {
			a.push(split[i]);
			if (i < mentions.length) {
				a.push(mentions[i].element);
			}
		}

		return <>{...a}</>;
	},
	async sendMessage(
		channelId: string,
		content: string = '',
		attachments: string[] = [],
		isTTS: boolean = false,
		embeds: any[] = [],
		mentions: any[] = [],
	) {
		// const jsonPayload = {
		// 	content: content,
		// 	embeds: [
		// 		{
		// 			title: 'Hello, Embed!',
		// 			description: 'This is an embedded message.',
		// 			thumbnail: {
		// 				url: 'attachment://myfilename.png',
		// 			},
		// 			image: {
		// 				url: 'attachment://mygif.gif',
		// 			},
		// 		},
		// 	],
		// 	message_reference: {
		// 		message_id: '233648473390448641',
		// 	},
		// 	attachments: [
		// 		{
		// 			id: 0,
		// 			description: 'Image of a cute little cat',
		// 			filename: 'myfilename.png',
		// 		},
		// 		{
		// 			id: 1,
		// 			description: 'Rickroll gif',
		// 			filename: 'mygif.gif',
		// 		},
		// 	],
		// };
		// formData.append('payload_json', JSON.stringify(jsonPayload));
		const token = await API.getToken();
		const url = `https://discord.com/api/v10/channels/${channelId}/messages`;

		const formData = new FormData();

		content ? formData.append('content', content) : null;
		for (let i = 0; i < attachments.length; i++) {
			let fileName;
			let fileBlob;
			const attachment = attachments[i];
			console.log(attachment, typeof attachment);
			if (typeof attachment != 'string') {
				fileName = 'attachment';
				fileBlob = attachment;
				console.log(fileName, fileBlob);
			} else {
				if (attachment.includes('/')) {
					fileName = attachment.split('/')[attachment.split('/').length - 1];
				} else {
					fileName = attachment.split('\\')[attachment.split('\\').length - 1];
				}
				const filearray = await fs.readBinaryFile(attachment);
				fileBlob = new Blob([filearray]);
				console.log(fileName, filearray);
			}

			formData.append(`files[${i}]`, fileBlob, fileName);
		}
		console.warn('formData', formData);
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: token,
			},
			body: formData,
		});
		if (response.status == 200) {
			return true;
		} else {
			const json = await response.json();
			console.log(json);
			return false;
		}
	},
	// get the cursor position from .editor start
	getCursorPosition(parent: Node, node: Node, offset: number, stat: { pos: number; done: boolean }) {
		if (stat.done) return stat;

		let currentNode = null;
		if (parent.childNodes.length == 0) {
			stat.pos += parent.textContent.length;
		} else {
			for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
				currentNode = parent.childNodes[i];
				if (currentNode === node) {
					stat.pos += offset;
					stat.done = true;
					return stat;
				} else getCursorPosition(currentNode, node, offset, stat);
			}
		}
		return stat;
	},

	//find the child node and relative position and set it on range
	setCursorPosition(parent: Node, range: Range, stat: { pos: number; done: boolean }) {
		if (stat.done) return range;

		if (parent.childNodes.length == 0) {
			if (parent.textContent.length >= stat.pos) {
				range.setStart(parent, stat.pos);
				stat.done = true;
			} else {
				stat.pos = stat.pos - parent.textContent.length;
			}
		} else {
			for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
				const currentNode = parent.childNodes[i];
				this.setCursorPosition(currentNode, range, stat);
			}
		}
		return range;
	},
};
