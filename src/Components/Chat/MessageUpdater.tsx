import { Accessor, For, Setter, createSignal } from 'solid-js';
import style from './css.module.css';
import { open } from '@tauri-apps/api/dialog';
import API from '../../API';
import MessageEditor from './MessageEditor';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { UploadFile } from './Chat';
type MessageUpdaterProps = {
	channelId: string;
	messageId: string;
	//files are passed down so i can later implement drag and drop file functionality for the whole chat window and not just the message editor field, tho we can change that if thats what we prefer, that way we wont need to pass this down
	setIsEditing: Setter<boolean>;
	msgText: string;
};
export default function MessageUpdater(props: MessageUpdaterProps) {
	const [msgText, setMsgText] = createSignal(props.msgText);
	const [files, setFiles] = createSignal<UploadFile[]>([]);

	console.log('updater props', props);

	function updateMessage() {
		API.Messages.editMessage(props.channelId, props.messageId, msgText(), files());
		props.setIsEditing(false);
	}
	function cancel() {
		props.setIsEditing(false);
	}
	function uploadFile() {
		open({
			multiple: true,
		}).then((selected) => {
			if (Array.isArray(selected)) {
				setFiles((files) => [...files, ...selected]);
				// user selected multiple files
			} else if (selected === null) {
				// user cancelled the selection
			} else {
				setFiles((files) => [...files, selected]);
			}
		});
	}
	return (
		<section class={style.messageUpdater}>
			<ul>
				<For each={files()}>
					{(file) => {
						if (typeof file == 'string') {
							let assetUrl = convertFileSrc(file, 'asset');

							return (
								<li>
									<button
										onClick={() => {
											setFiles((files) => files.filter((f) => f != file));
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
											setFiles((files) => files.filter((f) => f != file));
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
				<MessageEditor setText={setMsgText} text={msgText} files={files} setFiles={setFiles} />

				<div class={style.buttonContainer}>
					<button class={style.send} onClick={updateMessage}>
						Update
					</button>
				</div>
			</div>
		</section>
	);
}
