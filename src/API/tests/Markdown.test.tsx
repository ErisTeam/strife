import { expect, test } from 'vitest';
import '@testing-library/jest-dom';
import { formatMarkdownToJSX } from '@api/Messages';

test('plain text', () => {
	const x = formatMarkdownToJSX('hello');
	expect(x).toStrictEqual(<>hello</>);
});
test('bold', () => {
	const x = formatMarkdownToJSX('**hello**');
	console.log('x', x);
	expect(x).toEqual([<b>hello</b>]);
});
test('bold italic', () => {
	const x = formatMarkdownToJSX('***hello***');
	expect(x).toStrictEqual([
		<b>
			<i>hello</i>
		</b>,
	]);
});
test('italic', () => {
	const x = formatMarkdownToJSX('*hello*');
	expect(x).toStrictEqual([<i>hello</i>]);
});
test('underline', () => {
	const x = formatMarkdownToJSX('__hello__');
	expect(x).toStrictEqual([<u>hello</u>]);
});
test('strikethrough', () => {
	const x = formatMarkdownToJSX('~~hello~~');
	expect(x).toStrictEqual([<s>hello</s>]);
});
test('all combined', () => {
	const x = formatMarkdownToJSX('~~__***hello***__~~');
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
	const x = formatMarkdownToJSX('# hello');
	expect(x).toStrictEqual([<h4>hello</h4>]);
});
test('header 1 with bold', () => {
	const x = formatMarkdownToJSX('# **hello**');
	expect(x).toStrictEqual([
		<h4>
			<b>hello</b>
		</h4>,
	]);
});
test('header 2', () => {
	const x = formatMarkdownToJSX('## hello');
	expect(x).toStrictEqual([<h5>hello</h5>]);
});
test('header 3', () => {
	const x = formatMarkdownToJSX('### hello');
	expect(x).toStrictEqual([<h6>hello</h6>]);
});
test('link', () => {
	const x = formatMarkdownToJSX('[hello](https://google.com)');
	expect(x).toStrictEqual([
		<a class="mdLink" href="https://google.com">
			hello
		</a>,
	]);
});
test('link plus text', () => {
	const x = formatMarkdownToJSX('[hello](https://google.com) world');
	expect(x).toStrictEqual([
		<a class="mdLink" href="https://google.com">
			hello
		</a>,
		' world',
	]);
});
test('code', () => {
	const x = formatMarkdownToJSX('`hello`');
	expect(x).toStrictEqual([<code>hello</code>]);
});
test('code with bold', () => {
	const x = formatMarkdownToJSX('`**hello**`');
	expect(x).toStrictEqual([<code>**hello**</code>]);
});
test('codeblock with bold', () => {
	const x = formatMarkdownToJSX('```**hello**```');
	expect(x).toStrictEqual([<pre class="codeblock">**hello**</pre>]);
});

test('list', () => {
	const x = formatMarkdownToJSX('- hello');
	expect(x).toStrictEqual([<span class="mdList">hello</span>]);
});
test('list with bold', () => {
	const x = formatMarkdownToJSX('- **hello**');
	expect(x).toStrictEqual([
		<span class="mdList">
			<b>hello</b>
		</span>,
	]);
});
test('indented list', () => {
	const x = formatMarkdownToJSX(' - hello');
	expect(x).toStrictEqual([<span class="mdIndentedList">hello</span>]);
});
test('indented list with bold', () => {
	const x = formatMarkdownToJSX(' - **hello**');
	expect(x).toStrictEqual([
		<span class="mdIndentedList">
			<b>hello</b>
		</span>,
	]);
});
test('quote', () => {
	const x = formatMarkdownToJSX('> quote');
	expect(x).toStrictEqual([<q>quote</q>]);
});
test('quote with bold', () => {
	const x = formatMarkdownToJSX('> **quote**');
	expect(x).toStrictEqual([
		<q>
			<b>quote</b>
		</q>,
	]);
});
test('spoiler', () => {
	const x = formatMarkdownToJSX('||hello||');
	expect(x).toStrictEqual([<span class="mdSpoiler">hello</span>]);
});
test('monster', () => {
	const x = formatMarkdownToJSX('*italics* _alternate italics_ **bold** __underline__ ~~Strikethrough~~');
	expect(x).toStrictEqual(
		<>
			<i>italics</i> <i>alternate italics</i> <b>bold</b> <u>underline</u> <s>Strikethrough</s>
		</>,
	);
});
test('fake header', () => {
	const x = formatMarkdownToJSX('#### Header');
	expect(x).toStrictEqual(<>#### Header</>);
});

test('alternate list', () => {
	const x = formatMarkdownToJSX('* hello');
	expect(x).toStrictEqual([<span class="mdList">hello</span>]);
});
test('alternate indented list', () => {
	const x = formatMarkdownToJSX(' * hello');
	expect(x).toStrictEqual([<span class="mdIndentedList">hello</span>]);
});
test('weird edge case', () => {
	const x = formatMarkdownToJSX('_z_');
	expect(x).toStrictEqual([<i>z</i>]);
});
test('link with italic in url', () => {
	const x = formatMarkdownToJSX('https://reddit.com/r/super_test_yes');
	expect(x).toStrictEqual(['https://reddit.com/r/super_test_yes']);
});

test('link with italic in url plus bold test', () => {
	const x = formatMarkdownToJSX('https://reddit.com/r/super_test_yes **test**');
	expect(x).toStrictEqual(
		<>
			https://reddit.com/r/super_test_yes<> </>
			<b>test</b>
		</>,
	);
});
test('emoji', () => {
	const x = formatMarkdownToJSX('test <:gb_folder:1042838908737695804> test');
	expect(x).toStrictEqual(['test ', '<:gb_folder:1042838908737695804>', ' test']);
});
