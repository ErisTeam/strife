import UserMention from '../Components/Chat/UserMention';
const linkRegex =
	/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;
//TODO:: ADD QUOTES AND SPOILERS BACK !!!!!MAKE ORDER INDEPENDENT!!!!
const markdownChars = ['###', '##', '#', '**', ' * ', '* ', '*', '~~', '__', '_', ' - ', '- ', '```', '`', '> ', '||'];
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
		link: /\[(?:[^\]]+)\]\((?:[^)]+)\)/g,
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
	`${regex.outsides.header3.source}|${regex.outsides.header2.source}|${regex.outsides.header1.source}|${regex.outsides.bold.source}|${regex.outsides.italic.source}|${regex.outsides.strikethrough.source}|${regex.outsides.underline.source}|${regex.outsides.alternateItalic.source}|${regex.outsides.link.source}|${regex.outsides.list.source}|${regex.outsides.indentedList.source}|${regex.outsides.codeBlock.source}|${regex.outsides.code.source}|${regex.outsides.quote.source}|${regex.outsides.spoiler.source}|(.+?)`,
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

export default {
	formatMarkdownToJSX(content: string, mentions: any[] = []): Element[] | Element | string {
		if (content == undefined) return '';
		if (content.match(linkRegex) && !content.match(regex.outsides.link)) return content;
		if (content.match(regex.outsides.link)) {
			const matches = content.matchAll(regex.insides.link).next();
			return (
				<a href={matches.value[2]} class="mdLink">
					{matches.value[1]}
				</a>
			);
		}
		let splits = content.split(allHTMLOutsides);
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

		splits = newSplits;
		if (splits.length == 0) return '';

		if (splits.length == 1 && !splits[0].match(markdownVerifier)) {
			return this.formatMentions(splits[0], mentions);
		}

		const results = splits.map((split) => {
			const markdownIndexes: Array<[number, string]> = [];

			let splitTemp = split;
			markdownChars.forEach((char) => {
				const index = splitTemp.indexOf(char);
				if (index != -1) markdownIndexes.push([index, char]);
				splitTemp = splitTemp.replaceAll(char, addX(char.length));
			});

			const orderedMarkdownIndexes = markdownIndexes.sort((a, b) => a[0] - b[0]);
			if (orderedMarkdownIndexes.length == 0) return this.formatMarkdownToJSX(split);
			switch (true) {
				case orderedMarkdownIndexes[0][1] == '**': {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.bold).next().value[2], mentions);

					return <b>{inside}</b>;
				}
				case orderedMarkdownIndexes[0][1] == '*' && split.match(regex.outsides.list) == null: {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.italic).next().value[2], mentions);
					return <i>{inside}</i>;
				}
				case orderedMarkdownIndexes[0][1] == '~~': {
					const inside = this.formatMarkdownToJSX(
						split.matchAll(regex.insides.strikethrough).next().value[2],
						mentions,
					);
					return <s>{inside}</s>;
				}
				case orderedMarkdownIndexes[0][1] == '__': {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.underline).next().value[2], mentions);
					return <u>{inside}</u>;
				}
				case orderedMarkdownIndexes[0][1] == '_': {
					const inside = this.formatMarkdownToJSX(
						split.matchAll(regex.insides.alternateItalic).next().value[2],
						mentions,
					);
					return <i>{inside}</i>;
				}
				case orderedMarkdownIndexes[0][1] == '- ': {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.list).next().value[2], mentions);
					return <span class="mdList">{inside}</span>;
				}
				case orderedMarkdownIndexes[0][1] == '* ': {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.list).next().value[4], mentions);
					return <span class="mdList">{inside}</span>;
				}
				case orderedMarkdownIndexes[0][1] == ' - ': {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.indentedList).next().value[2], mentions);
					return <span class="mdIndentedList">{inside}</span>;
				}
				case orderedMarkdownIndexes[0][1] == ' * ': {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.indentedList).next().value[4], mentions);
					return <span class="mdIndentedList">{inside}</span>;
				}
				case orderedMarkdownIndexes[0][1] == '```': {
					const inside = split.matchAll(regex.insides.codeBlock).next().value[2];
					return <pre class="codeblock">{inside}</pre>;
				}
				case orderedMarkdownIndexes[0][1] == '`': {
					const inside = split.matchAll(regex.insides.code).next().value[2];
					return <code>{inside}</code>;
				}
				case orderedMarkdownIndexes[0][1] == '#': {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.header1).next().value[1], mentions);
					return <h4>{inside}</h4>;
				}
				case orderedMarkdownIndexes[0][1] == '##': {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.header2).next().value[1], mentions);
					return <h5>{inside}</h5>;
				}
				case orderedMarkdownIndexes[0][1] == '###': {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.header3).next().value[1], mentions);
					return <h6>{inside}</h6>;
				}
				case orderedMarkdownIndexes[0][1] == '> ': {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.quote).next().value[1], mentions);
					return <q>{inside}</q>;
				}
				case orderedMarkdownIndexes[0][1] == '||': {
					const inside = this.formatMarkdownToJSX(split.matchAll(regex.insides.spoiler).next().value[2], mentions);
					return <span class="mdSpoiler">{inside}</span>;
				}

				default: {
					return this.formatMarkdownToJSX(split);
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
};
