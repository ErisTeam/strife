import { Accessor, For, Setter, createSignal } from 'solid-js';
import style from './css.module.css';
import { open } from '@tauri-apps/api/dialog';
import API from '../../API';
import MessageEditor from './MessageEditor';
import { convertFileSrc } from '@tauri-apps/api/tauri';
type MessageSenderProps = {
	channelId: string;
	//files are passed down so i can later implement drag and drop file functionality for the whole chat window and not just the message editor field, tho we can change that if thats what we prefer, that way we wont need to pass this down
	files: Accessor<string[]>;
	setFiles: Setter<string[]>;
};
export default function MessageSender(props: MessageSenderProps) {
	const [msgText, setMsgText] = createSignal('');

	function sendMessage() {
		API.Messages.sendMessage(props.channelId, msgText(), props.files());
		setMsgText('');
		props.setFiles([]);
	}
	function uploadFile() {
		open({
			multiple: true,
			filters: [
				{
					name: 'Image',
					extensions: ['png', 'jpeg'],
				},
			],
		}).then((selected) => {
			if (Array.isArray(selected)) {
				props.setFiles((files) => [...files, ...selected]);
				// user selected multiple files
			} else if (selected === null) {
				// user cancelled the selection
			} else {
				props.setFiles((files) => [...files, selected]);
			}
		});
	}
	return (
		<>
			<ul>
				<For each={props.files()}>
					{(file) => {
						const assetUrl = convertFileSrc(file, 'asset');
						return (
							<li>
								<button
									onClick={() => {
										props.setFiles((files) => files.filter((f) => f != file));
									}}
								>
									X
								</button>
								<img style="width: 50px; height:50px" src={assetUrl} alt="lol" />
							</li>
						);
					}}
				</For>
			</ul>
			<div class={style.editorWrapper}>
				<div class={style.buttonContainer}>
					<button class={style.uploadTest} onClick={uploadFile}>
						UPLOAD
					</button>
				</div>
				<MessageEditor setText={setMsgText} text={msgText} />

				<div class={style.buttonContainer}>
					<button class={style.send} onClick={sendMessage}>
						Send
					</button>
				</div>
			</div>
		</>
	);
}
