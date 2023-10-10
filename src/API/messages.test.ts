import { expect, test } from 'vitest';
import API from '../API';

test('Markdown formatting of bold text', () => {
	const text = API.Messages.formatMarkdownToHTML('**bold text**');
	expect(text).toBe('<b>bold text</b>');
});
test('Markdown formatting of two bold texts', () => {
	const text = API.Messages.formatMarkdownToHTML('**bold text** **bold text**');
	expect(text).toBe('<b>bold text</b> <b>bold text</b>');
});
test('Markdown formatting of italic text', () => {
	const text = API.Messages.formatMarkdownToHTML('*italic text*');
	expect(text).toBe('<i>italic text</i>');
});
test('Markdown formatting of alternate italic text', () => {
	const text = API.Messages.formatMarkdownToHTML('_alternate italic text_');
	expect(text).toBe('<i>alternate italic text</i>');
});
test('Markdown formatting of underlined text', () => {
	const text = API.Messages.formatMarkdownToHTML('__underlined text__');
	expect(text).toBe('<u>underlined text</u>');
});
test('Markdown formatting of strikethrough text', () => {
	const text = API.Messages.formatMarkdownToHTML('~~strikethrough text~~');
	expect(text).toBe('<s>strikethrough text</s>');
});
test('Markdown formatting of bold italic text', () => {
	const text = API.Messages.formatMarkdownToHTML('***bold italic text***');
	expect(text).toBe('<b><i>bold italic text</i></b>');
});
test('Markdown formatting of underline bold italic text', () => {
	const text = API.Messages.formatMarkdownToHTML('__***underline bold italic text***__');
	expect(text).toBe('<u><b><i>underline bold italic text</i></b></u>');
});
test('Markdown formatting of underline bold text', () => {
	const text = API.Messages.formatMarkdownToHTML('__**underline bold text**__');
	expect(text).toBe('<u><b>underline bold text</b></u>');
});
test('Markdown formatting of underline italic text', () => {
	const text = API.Messages.formatMarkdownToHTML('__*underline italic text*__');
	expect(text).toBe('<u><i>underline italic text</i></u>');
});
test('Markdown formatting of all styles together', () => {
	const text = API.Messages.formatMarkdownToHTML('__**~~underline bold strikethrough text~~**__');

	expect(text).toBe('<u><b><s>underline bold strikethrough text</s></b></u>');
});
test('Markdown formatting of code text', () => {
	const text = API.Messages.formatMarkdownToHTML('`code text`');
	expect(text).toBe('<code>code text</code>');
});
test('Markdown formatting of 2 code texts', () => {
	const text = API.Messages.formatMarkdownToHTML('`code text` `code text`');
	expect(text).toBe('<code>code text</code> <code>code text</code>');
});
test('Markdown formatting of code text with bold text inside', () => {
	const text = API.Messages.formatMarkdownToHTML('`**bold text**`');
	expect(text).toBe('<code>**bold text**</code>');
});
test('Markdown formatting of code block', () => {
	const text = API.Messages.formatMarkdownToHTML('```code block```');
	expect(text).toBe('<pre class="codeblock">code block</pre>');
});
test('Markdown formatting of 2 code blocks', () => {
	const text = API.Messages.formatMarkdownToHTML('```code block``` ```code block```');
	expect(text).toBe('<pre class="codeblock">code block</pre> <pre class="codeblock">code block</pre>');
});
test('Markdown formatting of code block with bold text inside', () => {
	const text = API.Messages.formatMarkdownToHTML('```**bold text**```');
	expect(text).toBe('<pre class="codeblock">**bold text**</pre>');
});
test('Markdown formatting of text with no styles', () => {
	const text = API.Messages.formatMarkdownToHTML('plain text');
	expect(text).toBe('plain text');
});
test('Markdown formatting of text with header level 1', () => {
	const text = API.Messages.formatMarkdownToHTML('# header level 1');
	expect(text).toBe('<h4>header level 1</h4>');
});
test('Markdown formatting of text with header level 2', () => {
	const text = API.Messages.formatMarkdownToHTML('## header level 2');
	expect(text).toBe('<h5>header level 2</h5>');
});
test('Markdown formatting of text with header level 3', () => {
	const text = API.Messages.formatMarkdownToHTML('### header level 3');
	expect(text).toBe('<h6>header level 3</h6>');
});
test('Markdown formatting of text with header level 1 and text after it', () => {
	const text = API.Messages.formatMarkdownToHTML('# header level 1 #test');
	expect(text).toBe('<h4>header level 1 #test</h4>');
});
test('Markdown formatting of link text', () => {
	const text = API.Messages.formatMarkdownToHTML('[google](http://goc)');
	expect(text).toBe('<a href="http://goc">google</a>');
});
test('Markdown formatting of link text failing', () => {
	const text = API.Messages.formatMarkdownToHTML('[google](http://goc');
	expect(text).toBe('[google](http://goc');
});
// <span class="mdList">$2</span>
// 	<span class="mdIndentedList">$2</span>
test('Markdown formatting of a list', () => {
	const text = API.Messages.formatMarkdownToHTML('- list item 1');
	expect(text).toBe('<span class="mdList">list item 1</span>');
});
test('Markdown formatting of a list with indent', () => {
	const text = API.Messages.formatMarkdownToHTML(' - list item 1');
	expect(text).toBe('<span class="mdIndentedList">list item 1</span>');
});
