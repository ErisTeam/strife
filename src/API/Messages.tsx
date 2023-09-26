import { JSXElement } from 'solid-js';
import UserMention from '../Components/Chat/UserMention';
import style from '../Components/Chat/css.module.css';

export const markdownChars = ['*', '_', '~', 'Dead', '`', '|', '#', '-', '>'];
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

const allClosableRegex = `${boldRegex.source}|${italicRegex.source}|${underlineRegex.source}|${strikethroughRegex.source}|${alternateItalicRegex.source}|${codeBlockRegex.source}|${codeLineRegex.source}|${spoilerRegex.source}`;

const spaceBetweenFormattedText = `(?<=(${allClosableRegex}|(\n)))( +?)(?=(${allClosableRegex}|(\n)))`;

const fullLineRegex = `${headerOneRegex.source}|${headerTwoRegex.source}|${headerThreeRegex.source}|${listRegex.source}|${listIndentedRegex.source}|${quoteRegex.source}|${mdLinkRegex.source}`;

const regex = new RegExp(`${allClosableRegex}|(\n)|${spaceBetweenFormattedText}|${fullLineRegex}|(.*)`, 'gm');

export default {
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
	formatMarkdown(content: string, mentions: any[]) {
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
							return <span class={style.spoiler}>{this.formatMarkdown(match.replace(/\|\|/gm, ''), mentions)}</span>;
						case !!match.match(mdLinkRegex):
							return <a href={match.match(linkRegex)[0]}>{match.match(/(?<=\[).*?(?=\])/gm)[0]}</a>;
						default:
							return <>{this.formatMentions(match, mentions)}</>;
					}
				}) || []}
			</>
		);
	},
	markdownSuggestion(content: string) {
		return (
			<>
				<span class="mdSuggestion">{content}</span>
			</>
		);
	},
	formatMarkdownPreserve(content: string, mentions: any[] = []): JSXElement {
		const matches = content.match(regex) || [];

		if (matches.length == 0) {
			return this.formatMentions(content, mentions);
		}
		return (
			<>
				{...matches.map((match) => {
					switch (true) {
						case !!match.match(codeBlockRegex):
							return (
								<>
									{this.markdownSuggestion('```')}
									<pre class="codeblock">{match.replace(/```/gm, '')}</pre>
									{this.markdownSuggestion('```')}
								</>
							);
						case !!match.match(codeLineRegex):
							return (
								<>
									{this.markdownSuggestion('`')}
									<code>{match.replace(/`/gm, '')}</code>
									{this.markdownSuggestion('`')}
								</>
							);
						case !!match.match(boldRegex):
							return (
								<>
									{this.markdownSuggestion('**')}
									<strong>{this.formatMarkdownPreserve(match.replace(/\*\*/gm, ''), mentions)}</strong>
									{this.markdownSuggestion('**')}
								</>
							);
						case !!match.match(italicRegex):
							return (
								<>
									{this.markdownSuggestion('*')}
									<em>{this.formatMarkdownPreserve(match.replace(/(?<!\*)\*(?!\*)/gm, ''), mentions)}</em>
									{this.markdownSuggestion('*')}
								</>
							);

						case !!match.match(underlineRegex):
							return (
								<>
									{this.markdownSuggestion('__')}
									<u>{this.formatMarkdownPreserve(match.replace(/__/gm, ''), mentions)}</u>
									{this.markdownSuggestion('__')}
								</>
							);
						case !!match.match(alternateItalicRegex):
							return (
								<>
									{this.markdownSuggestion('_')}
									<em>{this.formatMarkdownPreserve(match.replace(/(?<!_)_(?!_)/gm, ''), mentions)}</em>
									{this.markdownSuggestion('_')}
								</>
							);
						case !!match.match(strikethroughRegex):
							return (
								<>
									{this.markdownSuggestion('~~')}
									<s>{this.formatMarkdownPreserve(match.replace(/~~/gm, ''), mentions)}</s>
									{this.markdownSuggestion('~~')}
								</>
							);
						case !!match.match(newlineRegex):
							return <br />;
						case !!match.match(headerOneRegex):
							return match;
						case !!match.match(headerTwoRegex):
							return match;
						case !!match.match(headerThreeRegex):
							return match;
						case !!match.match(listRegex):
							return match;
						case !!match.match(listIndentedRegex):
							return match;
						case !!match.match(quoteRegex):
							return match;
						case !!match.match(spoilerRegex):
							return (
								<>
									{this.markdownSuggestion('||')}
									<span class={style.spoiler}>
										{this.formatMarkdownPreserve(match.replace(/\|\|/gm, ''), mentions)}
									</span>
									{this.markdownSuggestion('||')}
								</>
							);
						case !!match.match(mdLinkRegex):
							return match;
						default:
							return <>{this.formatMentions(match, mentions)}</>;
					}
				}) || []}
			</>
		);
	},
};
