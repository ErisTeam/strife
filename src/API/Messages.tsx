import UserMention from '../Components/Chat/UserMention';
import style from '../Components/Chat/css.module.css';

export const markdownChars = ['*', '_', '~', 'Dead', '`', '|', '#', '-', '>'];
//TODO:: ADD QUOTES AND SPOILERS BACK !!!!!MAKE ORDER INDEPENDENT!!!!
const ruleSplitter = /(`{3}(?:.+?)`{3})(?!`)|(`{1}(?:.+?[^`+])`{1})(?!`)/gm;
const codeRules = [
	//codeblock
	[/(`{3}(.+?)`{3})(?!`)/gm, '<pre class="codeblock">$2</pre>'],
	//code
	[/(`{1}(.+?[^`+])`{1})(?!`)/g, '<code>$2</code>'],
];
const rules = [
	//header rules

	[/#{3}\s?([^\n]+)/g, '<h6>$1</h6>'],
	[/#{2}\s?([^\n]+)/g, '<h5>$1</h5>'],
	[/#{1}\s?([^\n]+)/g, '<h4>$1</h4>'],

	//bold, italics, strikethrough and paragragh rules
	[/(\*{2}(.+?)\*{2})(?!\*)/gm, '<b>$2</b>'],
	[/(?<!\*)(\*(?!\*)(.+?)\*)(?!\*)/gm, '<i>$2</i>'],
	[/(~{2}(.+?)~{2})/g, '<s>$2</s>'],
	[/(__(.+?)__)(?!_)/g, '<u>$2</u>'],
	[/(?<!_)(_(?!_)(.+?)_)(?!_)/g, '<i>$2</i>'],
	// [/([^\n]+\n?)/g, '<p>$1</p>'],

	//links
	[/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'],
	// return <span class={style.list}>{this.formatMarkdown(match.slice(2), mentions)}</span>;
	// 		case !!match.match(listIndentedRegex):
	// 			return <span class={style.indentedList}>{this.formatMarkdown(match.slice(3), mentions)}</span>;

	// //Lists
	[/(^- (.*))|(^\* (.*))/g, '<span class="mdList">$2</span>'],
	[/(^ - (.*))|(^ \* (.*))/g, '<span class="mdIndentedList">$2</span>'],

	// [/([^\n]+)(\*)([^\n]+)/g, '<ul><li>$3</li></ul>'],
];

const header3 = /(<h6>(.+?)<\/h6>)/gm;
const header2 = /(<h5>(.+?)<\/h5>)/gm;
const header1 = /(<h4>(.+?)<\/h4>)/gm;
const bold = /(<b>(.+?)<\/b>)/gm;
const italic = /(<i>(.+?)<\/i>)/gm;
const strikethrough = /(<s>(.+?)<\/s>)/gm;
const underline = /(<u>(.+?)<\/u>)/gm;
const link = /(<a href="(.+?)">(.+?)<\/a>)/gm;
const list = /(<span class="mdList">(.+?)<\/span>)/gm;
const indentedList = /(<span class="mdIndentedList">(.+?)<\/span>)/gm;
const codeBlock = /(<pre class="codeblock">(.+?)<\/pre>)/gm;
const code = /(<code>(.+?)<\/code>)/gm;
const allHTML = new RegExp(
	`${header3.source}|${header2.source}|${header1.source}|${bold.source}|${italic.source}|${strikethrough.source}|${underline.source}|${link.source}|${list.source}|${indentedList.source}|${codeBlock.source}|${code.source}|(.+)`,
	'gm',
);

export default {
	formatMarkdown(content: string) {
		return this.formattedMarkdownStringToJSX(this.formatMarkdownToString(content));
	},
	formattedMarkdownStringToJSX(html: string) {
		console.log('html', html);
		if (html == undefined) return <></>;
		const matches = html.match(allHTML) || [];
		console.log('allHTML', allHTML);
		console.log('matches', matches);

		if (matches.length == 0) {
			return html;
		}
		const results =
			matches.map((match) => {
				switch (true) {
					case !!match.match(codeBlock):
						return <pre class="codeblock">{match.match(/((?<=<pre class="codeblock">)(.+?)(?=<\/pre>))/gm)[0]}</pre>;
					case !!match.match(code):
						return <code>{match.match(/((?<=<code>)(.+?)(?=<\/code>))/gm)[0]}</code>;
					case !!match.match(bold):
						console.log('bold', match.match(/((?<=<b>)(.+?)(?=<\/b>))/gm));
						return <b>{this.formattedMarkdownStringToJSX(match.match(/((?<=<b>)(.+?)(?=<\/b>))/gm)[0])}</b>;
					case !!match.match(italic):
						console.log('italic', match.match(/((?<=<i>)(.+?)(?=<\/i>))/gm));
						return <i>{this.formattedMarkdownStringToJSX(match.match(/((?<=<i>)(.+?)(?=<\/i>))/gm)[0])}</i>;
					case !!match.match(underline):
						console.log('underline', match.match(/((?<=<u>)(.+?)(?=<\/u>))/gm));
						return <u>{this.formattedMarkdownStringToJSX(match.match(/((?<=<u>)(.+?)(?=<\/u>))/gm)[0])}</u>;

					case !!match.match(strikethrough):
						console.log('strikethrough', match.match(/((?<=<s>)(.+?)(?=<\/s>))/gm));
						return <s>{this.formattedMarkdownStringToJSX(match.match(/((?<=<s>)(.+?)(?=<\/s>))/gm)[0])}</s>;

					case !!match.match(header1):
						return <h4>{this.formattedMarkdownStringToJSX(match.match(/((?<=<h4>)(.+?)(?=<\/h4>))/gm)[0])}</h4>;
					case !!match.match(header2):
						return <h5>{this.formattedMarkdownStringToJSX(match.match(/((?<=<h5>)(.+?)(?=<\/h5>))/gm)[0])}</h5>;
					case !!match.match(header3):
						return <h6>{this.formattedMarkdownStringToJSX(match.match(/((?<=<h6>)(.+?)(?=<\/h6>))/gm)[0])}</h6>;
					case !!match.match(list):
						return (
							<span class={style.list}>
								{this.formattedMarkdownStringToJSX(match.match(/((?<=<span class="mdList">)(.+?)(?=<\/span>))/gm)[0])}
							</span>
						);
					case !!match.match(indentedList):
						return (
							<span class={style.indentedList}>
								{this.formattedMarkdownStringToJSX(
									match.match(/((?<=<span class="mdIndentedList">)(.+?)(?=<\/span>))/gm)[0],
								)}
							</span>
						);
					// case !!match.match(quoteRegex):
					// 	return <q>{this.formatMarkdown(match.slice(2), mentions)}</q>;
					// case !!match.match():
					// 	return <span class="mdSpoiler">{this.formatMarkdown(match.replace(/\|\|/gm, ''), mentions)}</span>;
					case !!match.match(link):
						return (
							<a class="mdLink" href={match.match(link)[1]}>
								{match.match(link)[2]}
							</a>
						);
					default:
						return <>{match}</>;
				}
			}) || [];
		console.log('results', results);
		return <>{results}</>;
	},
	formatMarkdownToString(content: string) {
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

	/**
	 * @deprecated working on new version
	 */ formatMentions(content: string, mentionsInput: any[]) {
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
	/**
	 * @deprecated working on new version
	 */ formatMarkdownOld(content: string, mentions: any[]) {
		const matches = content.match(regex) || [];

		if (matches.length == 0) {
			return this.formatMentions(content, mentions);
		}
		return (
			<>
				{...matches.map((match) => {
					switch (true) {
						case !!match.match(codeBlockRegex):
							return <pre class="codeblock">{match.replace(/```/gm, '')}</pre>;
						case !!match.match(codeLineRegex):
							return <code>{match.replace(/`/gm, '')}</code>;
						case !!match.match(boldRegex):
							return <strong>{this.formatMarkdown(match.replace(/\*\*/gm, ''), mentions)}</strong>;
						case !!match.match(italicRegex):
							return <em>{this.formatMarkdown(match.replace(/(?<!\*)\*(?!\*)/gm, ''), mentions)}</em>;
						case !!match.match(underlineRegex):
							return <u>{this.formatMarkdown(match.replace(/__/gm, ''), mentions)}</u>;
						case !!match.match(alternateItalicRegex):
							return <em>{this.formatMarkdown(match.replace(/(?<!_)_(?!_)/gm, ''), mentions)}</em>;
						case !!match.match(strikethroughRegex):
							return <s>{this.formatMarkdown(match.replace(/~~/gm, ''), mentions)}</s>;
						case !!match.match(newlineRegex):
							return <br />;
						case !!match.match(headerOneRegex):
							return <h4>{this.formatMarkdown(match.slice(1), mentions)}</h4>;
						case !!match.match(headerTwoRegex):
							return <h5>{this.formatMarkdown(match.slice(2), mentions)}</h5>;
						case !!match.match(headerThreeRegex):
							return <h6>{this.formatMarkdown(match.slice(3), mentions)}</h6>;
						case !!match.match(listRegex):
							return <span class={style.list}>{this.formatMarkdown(match.slice(2), mentions)}</span>;
						case !!match.match(listIndentedRegex):
							return <span class={style.indentedList}>{this.formatMarkdown(match.slice(3), mentions)}</span>;
						case !!match.match(quoteRegex):
							return <q>{this.formatMarkdown(match.slice(2), mentions)}</q>;
						case !!match.match(spoilerRegex):
							return <span class="mdSpoiler">{this.formatMarkdown(match.replace(/\|\|/gm, ''), mentions)}</span>;
						case !!match.match(mdLinkRegex):
							return (
								<a class="mdLink" href={match.match(linkRegex)[0]}>
									{match.match(/(?<=\[).*?(?=\])/gm)[0]}
								</a>
							);
						default:
							return <>{this.formatMentions(match, mentions)}</>;
					}
				}) || []}
			</>
		);
	},
	/**
	 * @deprecated working on new version
	 */ markdownSuggestion(content: string) {
		return `<span class="mdSuggestion">${content}</span>`;
	},
	// THIS IS GOOFY AS FUCK
	/**
	 * @deprecated working on new version
	 */ formatMarkdownPreserveOld(content: string): string {
		const matches = content.match(regex) || [];
		console.log('matches', matches);
		let result = '';
		if (matches.length == 0) {
			return content;
		}
		matches.forEach((match) => {
			if (match == 'undefined') {
				return;
			}
			if (match.match(codeBlockRegex)) {
				result +=
					'<pre class="codeblock">' +
					this.markdownSuggestion('```') +
					match.replace('```', '').replace(/```(?=[^```]*$)/, '') +
					this.markdownSuggestion('```') +
					'</pre>';

				return;
			}
			if (match.match(codeLineRegex)) {
				result +=
					'<code>' +
					this.markdownSuggestion('`') +
					match.replace('`', '').replace(/`(?=[^`]*$)/, '') +
					this.markdownSuggestion('`') +
					'</code>';
				return;
			}
			if (match.match(newlineRegex)) {
				result += '\n';
			}
			if (
				match.match(boldRegex) ||
				match.match(italicRegex) ||
				match.match(underlineRegex) ||
				match.match(alternateItalicRegex) ||
				match.match(strikethroughRegex) ||
				match.match(spoilerRegex)
			) {
				console.log('inputted match: ', match);
				result += this.formatMarkdowPreserveStep(match);
			} else {
				result += match;
			}
		});
		return result;
	},
	/**
	 * @deprecated working on new version
	 */ getMarkdownOrder(match: string): string[] {
		const markdownOrder = [];
		while (match.length > 0) {
			if (
				match[0] + match[1] == '**' ||
				match[0] + match[1] == '__' ||
				match[0] + match[1] == '~~' ||
				match[0] + match[1] == '||'
			) {
				markdownOrder.push(match[0] + match[1]);
				match = match.slice(2, match.length);
			} else if ((match[0] == '*' && match[1] != '*') || (match[0] == '_' && match[1] != '_')) {
				markdownOrder.push(match[0]);
				match = match.slice(1, match.length);
			} else {
				//remove first char
				match = match.slice(1, match.length);
				markdownOrder.push('x');
			}
		}
		return markdownOrder;
	},
	/**
	 * @deprecated working on new version
	 */
	formatMarkdowPreserveStep(match: string) {
		const left: SideType[] = [];
		const right: SideType[] = [];
		const markdownOrder = this.getMarkdownOrder(match);

		if (match.match(boldRegex)) {
			console.log('boldRegex:', match.match(boldRegex));
			match = match.replace('**', '').replace(/\*\*(?=[^**]*$)/, '');
			left.push({ content: '<strong>' + this.markdownSuggestion('**'), char: '**' });
			right.unshift({ content: this.markdownSuggestion('**') + '</strong>', char: '**' });
		}
		if (match.match(italicRegex)) {
			match = match.replace('*', '').replace(/\*(?=[^*]*$)/, '');
			left.push({ content: '<em>' + this.markdownSuggestion('*'), char: '*' });
			right.unshift({ content: this.markdownSuggestion('*') + '</em>', char: '*' });
		}
		if (match.match(underlineRegex)) {
			match = match.replace('__', '').replace(/__(?=[^__]*$)/, '');

			left.push({ content: '<u>' + this.markdownSuggestion('__'), char: '__' });
			right.unshift({ content: this.markdownSuggestion('__') + '</u>', char: '__' });
		}
		if (match.match(alternateItalicRegex)) {
			match = match.replace('_', '').replace(/_(?=[^_]*$)/, '');

			left.push({ content: '<em>' + this.markdownSuggestion('_'), char: '_' });
			right.unshift({ content: this.markdownSuggestion('_') + '</em>', char: '_' });
		}
		if (match.match(strikethroughRegex)) {
			match = match.replace('~~', '').replace(/~~(?=[^~~]*$)/, '');

			left.push({ content: '<s>' + this.markdownSuggestion('~~'), char: '~~' });
			right.unshift({ content: this.markdownSuggestion('~~') + '</s>', char: '~~' });
		}
		if (match.match(spoilerRegex)) {
			match = match.replace('||', '').replace(/\|\|(?=[^||]*$)/, '');

			left.push({ content: '<span class="mdSpoiler">' + this.markdownSuggestion('||'), char: '||' });
			right.unshift({ content: this.markdownSuggestion('||') + '</span>', char: '||' });
		}

		let leftReal = '';
		let rightReal = '';

		let hasXed = false;
		for (let i = 0; i < markdownOrder.length; i++) {
			if (markdownOrder[i] == 'x') {
				hasXed = true;
			} else if (hasXed) {
				rightReal += right.find((r) => r.char == markdownOrder[i]).content;
			} else {
				leftReal += left.find((l) => l.char == markdownOrder[i]).content;
			}
		}
		console.log('match: ', match);
		console.log('markDownOrder:', markdownOrder, 'left:', leftReal, 'right:', rightReal);
		console.log(regex.source);
		console.log('spaceBetween', spaceBetweenFormattedText);

		return leftReal + match + rightReal;
	},
};
/**
 * @deprecated working on new version
 */
type SideType = {
	content: string;
	char: string;
};
