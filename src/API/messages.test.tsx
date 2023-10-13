import { expect, test } from 'vitest';
import API from '../API';
import '@testing-library/jest-dom';
test('plain text', () => {
	const x = API.Messages.formatMarkdownToJSX('hello');
	expect(x).toStrictEqual(<>hello</>);
});
test('bold', () => {
	const x = API.Messages.formatMarkdownToJSX('**hello**');
	console.log('x', x);
	expect(x).toEqual([<b>hello</b>]);
});
test('bold italic', () => {
	const x = API.Messages.formatMarkdownToJSX('***hello***');
	expect(x).toStrictEqual([
		<b>
			<i>hello</i>
		</b>,
	]);
});
test('italic', () => {
	const x = API.Messages.formatMarkdownToJSX('*hello*');
	expect(x).toStrictEqual([<i>hello</i>]);
});
test('underline', () => {
	const x = API.Messages.formatMarkdownToJSX('__hello__');
	expect(x).toStrictEqual([<u>hello</u>]);
});
test('strikethrough', () => {
	const x = API.Messages.formatMarkdownToJSX('~~hello~~');
	expect(x).toStrictEqual([<s>hello</s>]);
});
test('all combined', () => {
	const x = API.Messages.formatMarkdownToJSX('~~__***hello***__~~');
	expect(x).toStrictEqual([
		<s>
			<u>
				<b>
					<i>hello</i>
				</b>
			</u>
		</s>,
	]);
});
test('header 1', () => {
	const x = API.Messages.formatMarkdownToJSX('# hello');
	expect(x).toStrictEqual([<h4>hello</h4>]);
});
test('header 1 with bold', () => {
	const x = API.Messages.formatMarkdownToJSX('# **hello**');
	expect(x).toStrictEqual([
		<h4>
			<b>hello</b>
		</h4>,
	]);
});
test('header 2', () => {
	const x = API.Messages.formatMarkdownToJSX('## hello');
	expect(x).toStrictEqual([<h5>hello</h5>]);
});
test('header 3', () => {
	const x = API.Messages.formatMarkdownToJSX('### hello');
	expect(x).toStrictEqual([<h6>hello</h6>]);
});
test('link', () => {
	const x = API.Messages.formatMarkdownToJSX('[hello](https://google.com)');
	expect(x).toStrictEqual(
		<a class="mdLink" href="https://google.com">
			hello
		</a>,
	);
});
test('code', () => {
	const x = API.Messages.formatMarkdownToJSX('`hello`');
	expect(x).toStrictEqual([<code>hello</code>]);
});
test('code with bold', () => {
	const x = API.Messages.formatMarkdownToJSX('`**hello**`');
	expect(x).toStrictEqual([<code>**hello**</code>]);
});
test('codeblock with bold', () => {
	const x = API.Messages.formatMarkdownToJSX('```**hello**```');
	expect(x).toStrictEqual([<pre class="codeblock">**hello**</pre>]);
});

test('list', () => {
	const x = API.Messages.formatMarkdownToJSX('- hello');
	expect(x).toStrictEqual([<span class="mdList">hello</span>]);
});
test('list with bold', () => {
	const x = API.Messages.formatMarkdownToJSX('- **hello**');
	expect(x).toStrictEqual([
		<span class="mdList">
			<b>hello</b>
		</span>,
	]);
});
test('indented list', () => {
	const x = API.Messages.formatMarkdownToJSX(' - hello');
	expect(x).toStrictEqual([<span class="mdIndentedList">hello</span>]);
});
test('indented list with bold', () => {
	const x = API.Messages.formatMarkdownToJSX(' - **hello**');
	expect(x).toStrictEqual([
		<span class="mdIndentedList">
			<b>hello</b>
		</span>,
	]);
});
test('quote', () => {
	const x = API.Messages.formatMarkdownToJSX('> quote');
	expect(x).toStrictEqual([<q>quote</q>]);
});
test('quote with bold', () => {
	const x = API.Messages.formatMarkdownToJSX('> **quote**');
	expect(x).toStrictEqual([
		<q>
			<b>quote</b>
		</q>,
	]);
});
test('spoiler', () => {
	const x = API.Messages.formatMarkdownToJSX('||hello||');
	expect(x).toStrictEqual([<span class="mdSpoiler">hello</span>]);
});
test('monster', () => {
	const x = API.Messages.formatMarkdownToJSX('*italics* _alternate italics_ **bold** __underline__ ~~Strikethrough~~');
	expect(x).toStrictEqual(
		<>
			<i>italics</i> <i>alternate italics</i> <b>bold</b> <u>underline</u> <s>Strikethrough</s>
		</>,
	);
});
test('fake header', () => {
	const x = API.Messages.formatMarkdownToJSX('#### Header');
	expect(x).toStrictEqual(<>#### Header</>);
});

test('alternate list', () => {
	const x = API.Messages.formatMarkdownToJSX('* hello');
	expect(x).toStrictEqual([<span class="mdList">hello</span>]);
});
test('alternate indented list', () => {
	const x = API.Messages.formatMarkdownToJSX(' * hello');
	expect(x).toStrictEqual([<span class="mdIndentedList">hello</span>]);
});
test('weird edge case', () => {
	const x = API.Messages.formatMarkdownToJSX('_z_');
	expect(x).toStrictEqual([<i>z</i>]);
});
test('link with italic', () => {
	const x = API.Messages.formatMarkdownToJSX('https://reddit.com/r/super_test_yes');
	expect(x).toStrictEqual('https://reddit.com/r/super_test_yes');
});
