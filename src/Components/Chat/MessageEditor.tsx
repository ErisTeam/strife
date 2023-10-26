import { Accessor, Setter, Show, Signal, createEffect, createSignal, onMount } from 'solid-js';
import style from './css.module.css';
import API from '../../API';
import { UploadFile } from './Chat';

type MessageEditorProps = {
	text: Accessor<string>;
	setText: Setter<string>;
	files: Accessor<UploadFile[]>;
	setFiles: Setter<UploadFile[]>;
};
const DISABLED_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'Control', 'Alt', 'Meta'];
const MARKDOWN_KEYS = ['*', '_', 'Dead', '`'];
export default function MessageEditor(props: MessageEditorProps) {
	const [editor, setEditor] = createSignal<any>();
	const [isTyping, setIsTyping] = createSignal(false);
	let textarea: HTMLDivElement;
	createEffect(() => {
		if (props.text() == '') {
			textarea.innerHTML = '';
			setIsTyping(false);
		}
	});
	onMount(() => {
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

				if (MARKDOWN_KEYS.includes(e.key) || e.key == 'Backspace') {
					const sel = window.getSelection();

					const pos = API.Messages.getCursorPosition(textarea, sel.focusNode, sel.focusOffset, { pos: 0, done: false });
					if (sel.focusOffset === 0) pos.pos += 0.5;
					setEditor(textarea.innerText);

					setEditor(API.Messages.formatMarkdownToJSXPreserve(textarea.innerText));

					sel.removeAllRanges();
					const range = API.Messages.setCursorPosition(textarea, document.createRange(), {
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
