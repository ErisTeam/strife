import { Accessor, For, Setter, createSignal, onMount } from 'solid-js';
import style from './css.module.css';
import { message, open } from '@tauri-apps/api/dialog';
import MessageEditor from './MessageEditor';
import { Message as MessageType } from '../../types/Messages';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { UploadFile } from './Chat';
import { sendMessage } from '@/API/Messages';
type MessageUpdaterProps = {
	message: MessageType;
	setIsEditing: Setter<boolean>;
};
export default function MessageUpdater(props: MessageUpdaterProps) {
	const [msgText, setMsgText] = createSignal(props.message.content);
	const [files, setFiles] = createSignal<UploadFile[]>([]);

	console.log('updater props', props);

	function updateMessage() {
		sendMessage(props.message.channel_id, props.message.id, msgText(), files(), false, [], [], true);
		props.setIsEditing(false);
	}
	// TODO:ADD BUTTON
	function cancel() {
		props.setIsEditing(false);
	}
	onMount(() => {
		props.message.attachments.forEach((attachment) => {
			console.log('test2');
			setFiles((files) => [
				...files,
				{ name: attachment.filename, attachmentId: attachment.id, attachmentUrl: attachment.url },
			]);
		});
	});
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
						} else if (file.attachmentUrl) {
							return (
								<li>
									<button
										onClick={() => {
											setFiles((files) => files.filter((f) => f != file));
										}}
									>
										X
									</button>
									<img style="width: 50px; height:50px" src={file.attachmentUrl} alt="lol" />
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
