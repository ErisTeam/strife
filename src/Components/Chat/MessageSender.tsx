import { Accessor, For, Setter, createSignal } from 'solid-js';
import style from './css.module.css';
import { open } from '@tauri-apps/api/dialog';
import MessageEditor from './MessageEditor';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { UploadFile } from './Chat';
import { sendMessage } from '@/API/Messages';
import { MessageReference } from '@/types/Messages';
type MessageSenderProps = {
	channelId: string;
	//files are passed down so i can later implement drag and drop file functionality for the whole chat window and not just the message editor field, tho we can change that if thats what we prefer, that way we wont need to pass this down
	files: Accessor<UploadFile[]>;
	setFiles: Setter<UploadFile[]>;
	reference: Accessor<MessageReference | null>;
	setReference: Setter<MessageReference | null>;
};
export default function MessageSender(props: MessageSenderProps) {
	const [msgText, setMsgText] = createSignal('');

	function sendMsg() {
		console.warn('WOOO');
		if (!msgText() && props.files().length == 0) return;
		if (props.reference()) {
			console.log('props.reference()', props.reference());
		}
		sendMessage(props.channelId, null, msgText(), props.files(), false, [], [], false, props.reference());
		setMsgText('');
		props.setFiles([]);
	}
	function uploadFile() {
		open({
			multiple: true,
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
		<section class={style.messageSender}>
			<ul>
				<For each={props.files()}>
					{(file) => {
						if (typeof file == 'string') {
							let assetUrl = convertFileSrc(file, 'asset');

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
						} else {
							return (
								<li>
									<button
										onClick={() => {
											props.setFiles((files) => files.filter((f) => f != file));
										}}
									>
										X
									</button>
									<img style="width: 50px; height:50px" src={URL.createObjectURL(file.blob)} alt="lol" />
								</li>
							);
						}
					}}
				</For>
			</ul>
			<div class={style.editorWrapper}>
				<div class={style.buttonContainer}>
					<button class={style.uploadTest} onClick={uploadFile}>
						UPLOAD
					</button>
				</div>
				<MessageEditor setText={setMsgText} text={msgText} files={props.files} setFiles={props.setFiles} />

				<div class={style.buttonContainer}>
					<button class={style.send} onClick={sendMsg}>
						Send
					</button>
				</div>
			</div>
		</section>
	);
}
