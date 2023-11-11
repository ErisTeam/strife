import { Accessor, For, Setter, Show, Signal, createEffect, createSignal, onMount } from 'solid-js';
import style from './css.module.css';
import { UploadFile } from './Chat';
import { formatMarkdownToJSXPreserve, getCursorPosition, setCursorPosition } from '@/API/Messages';
import { GuildMember } from '@/types/Guild';

type MessageEditorProps = {
	text: Accessor<string>;
	setText: Setter<string>;
	files: Accessor<UploadFile[]>;
	setFiles: Setter<UploadFile[]>;
	recipients: GuildMember[];
	setMentionList: Setter<GuildMember[]>;
	mentionList: Accessor<GuildMember[]>;
};
const mentionRegex = /(@\S+)/g;
const DISABLED_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'Control', 'Alt', 'Meta'];
const MARKDOWN_KEYS = ['*', '_', 'Dead', '`'];
export default function MessageEditor(props: MessageEditorProps) {
	console.log('editor text', props.text());
	const [editor, setEditor] = createSignal<any>(formatMarkdownToJSXPreserve(props.text()));
	const [isTyping, setIsTyping] = createSignal(false);
	const [showMentions, setShowMentions] = createSignal(false);
	const [currentMention, setCurrentMention] = createSignal('');

	let textarea: HTMLDivElement;
	createEffect(() => {
		if (props.text() == '') {
			textarea.innerHTML = '';
			setIsTyping(false);
		}
	});
	createEffect(() => {
		//get members whos name starts with currentMention
		console.log('currentMention', currentMention());
		console.warn('recipients', props.recipients);

		if (showMentions() && currentMention() && props.recipients) {
			let members = props.recipients.filter((member) => member.user.username.startsWith(currentMention().substring(1)));
			props.setMentionList(members);
			console.log('mentionList', props.mentionList());
		}
	});
	onMount(() => {
		console.log('editor recipients', props.recipients);
		textarea.addEventListener('paste', (e) => {
			e.preventDefault();

			if (!e.clipboardData.files[0]) {
				let text = e.clipboardData.getData('text');

				const selection = window.getSelection();
				if (!selection.rangeCount) return;
				selection.deleteFromDocument();
				selection.getRangeAt(0).insertNode(document.createTextNode(text));
				selection.collapseToEnd();
			} else {
				for (let i = 0; i < e.clipboardData.files.length; i++) {
					let blob = e.clipboardData.files[i];
					let fileName = blob.name;
					props.setFiles((files) => [...files, { name: fileName, blob: blob }]);
				}
			}
		});

		textarea.addEventListener('keyup', (e) => {
			props.setText(textarea.innerText);

			if (e.key == 'Enter' && e.shiftKey) {
				console.log('newLine');
			}
			if (e.key == 'Enter' && !e.shiftKey) {
				console.log('send');
			} else if (e.key == 'Backspace' && textarea.innerText.length < 1) {
				setIsTyping(false);
			} else if (!DISABLED_KEYS.includes(e.key) && !(e.key == 'a' && e.ctrlKey) && !(e.key == 'v' && e.metaKey)) {
				setIsTyping(true);

				const sel = window.getSelection();

				const pos = getCursorPosition(textarea, sel.focusNode, sel.focusOffset, { pos: 0, done: false });
				console.log('pos', pos.pos);
				if (sel.focusOffset === 0) pos.pos += 0.5;
				//word starts at closest @ before cursor
				let wordStart = textarea.innerText.substring(0, pos.pos).lastIndexOf('@');
				console.log('wordStart', wordStart);
				//word ends at closest space after cursor
				let wordEnd = pos.pos;
				console.log('wordEnd', wordEnd);
				if (wordEnd == -1) wordEnd = textarea.innerText.length;
				if (wordStart == -1) wordStart = 0;
				const word = textarea.innerText.substring(wordStart, wordEnd);

				console.log('word', word);
				if (word.match(mentionRegex)) {
					console.log('mention');
					setShowMentions(true);
					setCurrentMention(word);
				} else {
					console.log('not mention');
					setShowMentions(false);
					setCurrentMention('');
				}
				if (MARKDOWN_KEYS.includes(e.key) || e.key == 'Backspace') {
					const sel = window.getSelection();

					const pos = getCursorPosition(textarea, sel.focusNode, sel.focusOffset, { pos: 0, done: false });
					if (sel.focusOffset === 0) pos.pos += 0.5;
					setEditor(textarea.innerText);

					setEditor(formatMarkdownToJSXPreserve(textarea.innerText));

					sel.removeAllRanges();
					const range = setCursorPosition(textarea, document.createRange(), {
						pos: pos.pos,
						done: false,
					});
					range.collapse(true);
					sel.addRange(range);
				} else {
					if (textarea.innerText.length < 1) setIsTyping(false);
				}
			}
		});
	});
	return (
		<div class={style.editor}>
			<Show when={showMentions()}>
				<ul class={style.mentions}>
					<For each={props.mentionList()}>
						{(member) => {
							return <li>{member.user.username}</li>;
						}}
					</For>
				</ul>
			</Show>
			<Show when={!isTyping()}>
				<div class={style.placeholder}>PLACEHOLDER TEXT</div>
			</Show>
			<div
				title="TEMP"
				class={style.textarea}
				role="textbox"
				aria-multiline="true"
				spellcheck={true}
				aria-autocomplete="list"
				contenteditable={true}
				ref={textarea}
			>
				{editor()}
			</div>
		</div>
	);
}
