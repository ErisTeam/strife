import { expect, test } from "vitest";
import { formatMarkdownToHTML } from "@api/Messages";

test("Markdown formatting of bold text", () => {
	const text = formatMarkdownToHTML("**bold text**");
	expect(text).toBe("<b>bold text</b>");
});
test("Markdown formatting of bold text with html element", () => {
	const text = formatMarkdownToHTML("**bold <h1>Test</h1> text**");
	expect(text).toBe("<b>bold &lt;h1&gt;Test&lt;/h1&gt; text</b>");
});
test("Markdown formatting of two bold texts", () => {
	const text = formatMarkdownToHTML("**bold text** **bold text**");
	expect(text).toBe("<b>bold text</b> <b>bold text</b>");
});
test("Markdown formatting of italic text", () => {
	const text = formatMarkdownToHTML("*italic text*");
	expect(text).toBe("<i>italic text</i>");
});
test("Markdown formatting of alternate italic text", () => {
	const text = formatMarkdownToHTML("_alternate italic text_");
	expect(text).toBe("<i>alternate italic text</i>");
});
test("Markdown formatting of underlined text", () => {
	const text = formatMarkdownToHTML("__underlined text__");
	expect(text).toBe("<u>underlined text</u>");
});
test("Markdown formatting of strikethrough text", () => {
	const text = formatMarkdownToHTML("~~strikethrough text~~");
	expect(text).toBe("<s>strikethrough text</s>");
});
test("Markdown formatting of bold italic text", () => {
	const text = formatMarkdownToHTML("***bold italic text***");
	expect(text).toBe("<b><i>bold italic text</i></b>");
});
test("Markdown formatting of underline bold italic text", () => {
	const text = formatMarkdownToHTML("__***underline bold italic text***__");
	expect(text).toBe("<u><b><i>underline bold italic text</i></b></u>");
});
test("Markdown formatting of underline bold text", () => {
	const text = formatMarkdownToHTML("__**underline bold text**__");
	expect(text).toBe("<u><b>underline bold text</b></u>");
});
test("Markdown formatting of underline italic text", () => {
	const text = formatMarkdownToHTML("__*underline italic text*__");
	expect(text).toBe("<u><i>underline italic text</i></u>");
});
test("Markdown formatting of all styles together", () => {
	const text = formatMarkdownToHTML(
		"__**~~underline bold strikethrough text~~**__",
	);

	expect(text).toBe("<u><b><s>underline bold strikethrough text</s></b></u>");
});
test("Markdown formatting of code text", () => {
	const text = formatMarkdownToHTML("`code text`");
	expect(text).toBe("<code>code text</code>");
});
test("Markdown formatting of 2 code texts", () => {
	const text = formatMarkdownToHTML("`code text` `code text`");
	expect(text).toBe("<code>code text</code> <code>code text</code>");
});
test("Markdown formatting of code text with bold text inside", () => {
	const text = formatMarkdownToHTML("`**bold text**`");
	expect(text).toBe("<code>**bold text**</code>");
});
test("Markdown formatting of code block", () => {
	const text = formatMarkdownToHTML("```code block```");
	expect(text).toBe('<pre class="codeblock">code block</pre>');
});
test("Markdown formatting of 2 code blocks", () => {
	const text = formatMarkdownToHTML("```code block``` ```code block```");
	expect(text).toBe(
		'<pre class="codeblock">code block</pre> <pre class="codeblock">code block</pre>',
	);
});
test("Markdown formatting of code block with bold text inside", () => {
	const text = formatMarkdownToHTML("```**bold text**```");
	expect(text).toBe('<pre class="codeblock">**bold text**</pre>');
});
test("Markdown formatting of text with no styles", () => {
	const text = formatMarkdownToHTML("plain text");
	expect(text).toBe("plain text");
});
test("Markdown formatting of text with header level 1", () => {
	const text = formatMarkdownToHTML("# header level 1");
	expect(text).toBe("<h4>header level 1</h4>");
});
test("Markdown formatting of text with header level 2", () => {
	const text = formatMarkdownToHTML("## header level 2");
	expect(text).toBe("<h5>header level 2</h5>");
});
test("Markdown formatting of text with header level 3", () => {
	const text = formatMarkdownToHTML("### header level 3");
	expect(text).toBe("<h6>header level 3</h6>");
});
test("Markdown formatting of text with header level 1 and text after it", () => {
	const text = formatMarkdownToHTML("# header level 1 #test");
	expect(text).toBe("<h4>header level 1 #test</h4>");
});
test("Markdown formatting of link text", () => {
	const text = formatMarkdownToHTML("[google](http://goc)");
	expect(text).toBe('<a class="mdLink" href="http://goc">google</a>');
});
test("Markdown formatting of link text failing", () => {
	const text = formatMarkdownToHTML("[google](http://goc");
	expect(text).toBe("[google](http://goc");
});
test("Markdown formatting of a list", () => {
	const text = formatMarkdownToHTML("- list item 1");
	expect(text).toBe('<span class="mdList">list item 1 </span><br>');
});
test("Markdown formatting of a list with indent", () => {
	const text = formatMarkdownToHTML(" - list item 1");
	expect(text).toBe('<span class="mdIndentedList">list item 1</span>');
});
test("Markdown formatting of a multiline code block", () => {
	const text = formatMarkdownToHTML("```\ncode block\n```");
	expect(text).toBe('<pre class="codeblock">\ncode block\n</pre>');
});

test("Markdown formatting of a list and indented list", () => {
	const text = formatMarkdownToHTML("- list item 1\n - list item 2");
	expect(text).toBe(
		'<span class="mdList">list item 1 </span><br>\n<span class="mdIndentedList">list item 2</span>',
	);
});
