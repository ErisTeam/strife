import { expect, test } from 'vitest';
import { formatMarkdownToJSXPreserve } from '@api/Messages';
import '@testing-library/jest-dom';

test('plain text', () => {
	const x = formatMarkdownToJSXPreserve('hello');
	expect(x).toStrictEqual([<>hello</>]);
});
test('bold', () => {
	const x = formatMarkdownToJSXPreserve('**hello**').flat(Infinity);

	expect(x).toEqual(
		<>
			<span class="mdSuggestion">**</span>
			<b>hello</b>
			<span class="mdSuggestion">**</span>
		</>,
	);
});
test('bold italic', () => {
	const x = formatMarkdownToJSXPreserve('***hello***').flat(Infinity);
	expect(x).toStrictEqual(
		<>
			<span class="mdSuggestion">**</span>

			<b>
				<span class="mdSuggestion">*</span>

				<i>hello</i>
				<span class="mdSuggestion">*</span>
			</b>
			<span class="mdSuggestion">**</span>
		</>,
	);
});
test('italic', () => {
	const x = formatMarkdownToJSXPreserve('*hello*').flat(Infinity);
	expect(x).toStrictEqual(
		<>
			<span class="mdSuggestion">*</span>
			<i>hello</i>
			<span class="mdSuggestion">*</span>
		</>,
	);
});
test('underline', () => {
	const x = formatMarkdownToJSXPreserve('__hello__').flat(Infinity);
	expect(x).toStrictEqual(
		<>
			<span class="mdSuggestion">__</span>
			<u>hello</u>
			<span class="mdSuggestion">__</span>
		</>,
	);
});
test('strikethrough', () => {
	const x = formatMarkdownToJSXPreserve('~~hello~~').flat(Infinity);
	expect(x).toStrictEqual(
		<>
			<span class="mdSuggestion">~~</span>
			<s>hello</s>
			<span class="mdSuggestion">~~</span>
		</>,
	);
});
test('all combined', () => {
	const x = formatMarkdownToJSXPreserve('~~__***hello***__~~').flat(Infinity);
	expect(x).toStrictEqual(
		<>
			<span class="mdSuggestion">~~</span>
			<s>
				<span class="mdSuggestion">__</span>
				<u>
					<span class="mdSuggestion">**</span>
					<b>
						<span class="mdSuggestion">*</span>
						<i>hello</i>
						<span class="mdSuggestion">*</span>
					</b>
					<span class="mdSuggestion">**</span>
				</u>
				<span class="mdSuggestion">__</span>
			</s>
			<span class="mdSuggestion">~~</span>
		</>,
	);
});
test('header 1', () => {
	const x = formatMarkdownToJSXPreserve('# hello').flat(Infinity);
	expect(x).toStrictEqual(['# ', 'hello']);
});
test('header 1 with bold', () => {
	const x = formatMarkdownToJSXPreserve('# **hello**').flat(Infinity);
	expect(x).toStrictEqual(
		<>
			# <span class="mdSuggestion">**</span>
			<b>hello</b>
			<span class="mdSuggestion">**</span>
		</>,
	);
});
test('header 2', () => {
	const x = formatMarkdownToJSXPreserve('## hello').flat(Infinity);
	expect(x).toStrictEqual(['## ', 'hello']);
});
test('header 3', () => {
	const x = formatMarkdownToJSXPreserve('### hello').flat(Infinity);
	expect(x).toStrictEqual(['### ', 'hello']);
});
test('link', () => {
	const x = formatMarkdownToJSXPreserve('[hello](https://google.com)');
	expect(x).toStrictEqual(['[hello](https://google.com)']);
});
test('code', () => {
	const x = formatMarkdownToJSXPreserve('`hello`').flat(Infinity);
	expect(x).toStrictEqual(
		<>
			<span class="mdSuggestion">`</span>
			<code>hello</code>
			<span class="mdSuggestion">`</span>
		</>,
	);
});
test('code with bold', () => {
	const x = formatMarkdownToJSXPreserve('`**hello**`').flat(Infinity);
	expect(x).toStrictEqual(
		<>
			<span class="mdSuggestion">`</span>
			<code>**hello**</code>
			<span class="mdSuggestion">`</span>
		</>,
	);
});
test('codeblock with bold', () => {
	const x = formatMarkdownToJSXPreserve('```**hello**```').flat(Infinity);
	expect(x).toStrictEqual(
		<>
			<span class="mdSuggestion">```</span>
			<pre class="codeblock">**hello**</pre>
			<span class="mdSuggestion">```</span>
		</>,
	);
});

test('list', () => {
	const x = formatMarkdownToJSXPreserve('- hello').flat(Infinity);
	expect(x).toStrictEqual(['- ', 'hello']);
});
test('list with bold', () => {
	const x = formatMarkdownToJSXPreserve('- **hello**').flat(Infinity);
	const expected = [
		'- ',
		<>
			<span class="mdSuggestion">**</span>
			<b>hello</b>
			<span class="mdSuggestion">**</span>
		</>,
	];
	expect(x).toStrictEqual(expected.flat(Infinity));
});
test('indented list', () => {
	const x = formatMarkdownToJSXPreserve(' - hello').flat(Infinity);
	expect(x).toStrictEqual([' - ', 'hello']);
});
test('indented list with bold', () => {
	const x = formatMarkdownToJSXPreserve(' - **hello**').flat(Infinity);
	const expected = [
		' - ',
		<>
			<span class="mdSuggestion">**</span>
			<b>hello</b>
			<span class="mdSuggestion">**</span>
		</>,
	];
	expect(x).toStrictEqual(expected.flat(Infinity));
});
test('quote', () => {
	const x = formatMarkdownToJSXPreserve('> quote').flat(Infinity);
	expect(x).toStrictEqual(['> ', 'quote']);
});
test('quote with bold', () => {
	const x = formatMarkdownToJSXPreserve('> **quote**').flat(Infinity);
	const expected = [
		'> ',
		<>
			<span class="mdSuggestion">**</span>
			<b>quote</b>
			<span class="mdSuggestion">**</span>
		</>,
	];
	expect(x).toStrictEqual(expected.flat(Infinity));
});
test('spoiler', () => {
	const x = formatMarkdownToJSXPreserve('||hello||').flat(Infinity);
	const expected = [
		<>
			<span class="mdSuggestion">||</span>
			<span class="mdSpoiler">hello</span>
			<span class="mdSuggestion">||</span>
		</>,
	];
	expect(x).toStrictEqual(expected.flat(Infinity));
});
test('monster', () => {
	const x = formatMarkdownToJSXPreserve('*italics* _alternate italics_ **bold** __underline__ ~~Strikethrough~~').flat(
		Infinity,
	);
	const expected = [
		<>
			<span class="mdSuggestion">*</span>
			<i>italics</i>
			<span class="mdSuggestion">*</span> <span class="mdSuggestion">_</span>
			<i>alternate italics</i>
			<span class="mdSuggestion">_</span> <span class="mdSuggestion">**</span>
			<b>bold</b>
			<span class="mdSuggestion">**</span> <span class="mdSuggestion">__</span>
			<u>underline</u>
			<span class="mdSuggestion">__</span> <span class="mdSuggestion">~~</span>
			<s>Strikethrough</s>
			<span class="mdSuggestion">~~</span>
		</>,
	];
	expect(x).toStrictEqual(expected.flat(Infinity));
});
test('fake header', () => {
	const x = formatMarkdownToJSXPreserve('#### Header');
	expect(x).toStrictEqual([<>#### Header</>]);
});

test('alternate list', () => {
	const x = formatMarkdownToJSXPreserve('* hello').flat(Infinity);
	expect(x).toStrictEqual(['* ', 'hello']);
});
test('alternate indented list', () => {
	const x = formatMarkdownToJSXPreserve(' * hello').flat(Infinity);
	expect(x).toStrictEqual([' * ', 'hello']);
});
test('weird edge case', () => {
	const x = formatMarkdownToJSXPreserve('_z_').flat(Infinity);
	expect(x).toStrictEqual(
		<>
			<span class="mdSuggestion">_</span>
			<i>z</i>
			<span class="mdSuggestion">_</span>
		</>,
	);
});
test('link with italic in url', () => {
	const x = formatMarkdownToJSXPreserve('https://reddit.com/r/super_test_yes').flat(Infinity);
	expect(x).toStrictEqual(['https://reddit.com/r/super_test_yes']);
});

test('link with italic in url plus bold test', () => {
	const x = formatMarkdownToJSXPreserve('https://reddit.com/r/super_test_yes **test**').flat(Infinity);
	expect(x).toStrictEqual(
		<>
			https://reddit.com/r/super_test_yes<> </>
			<span class="mdSuggestion">**</span>
			<b>test</b>
			<span class="mdSuggestion">**</span>
		</>,
	);
});
