import { invoke } from '@tauri-apps/api/tauri';
import { Show, createMemo, createResource, createSignal, onMount } from 'solid-js';
import API from '../../API';
import { useAppState } from '../../AppState';
import { CONSTANTS } from '../../Constants';
import { Message as MessageType } from '../../discord';
import { gatewayOneTimeListener, startGatewayListener, useTaurListener } from '../../test';
import { useTabContext } from '../Tabs/TabUtils';
import Message from './Message';
import style from './css.module.css';

export default function Chat() {
	const TabContext = useTabContext();
	console.log('TabContext', TabContext);
	const AppState = useAppState();

	let chatref: HTMLOListElement;
	let textarea: HTMLDivElement;

	//TODO: make it possible to select multiple characters

	// get the cursor position from .editor start
	function getCursorPosition(parent: Node, node: Node, offset: number, stat: { pos: number; done: boolean }) {
		if (stat.done) return stat;

		let currentNode = null;
		if (parent.childNodes.length == 0) {
			stat.pos += parent.textContent.length;
		} else {
			for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
				currentNode = parent.childNodes[i];
				if (currentNode === node) {
					stat.pos += offset;
					stat.done = true;
					return stat;
				} else getCursorPosition(currentNode, node, offset, stat);
			}
		}
		return stat;
	}

	//find the child node and relative position and set it on range
	function setCursorPosition(parent: Node, range: Range, stat: { pos: number; done: boolean }) {
		if (stat.done) return range;

		if (parent.childNodes.length == 0) {
			if (parent.textContent.length >= stat.pos) {
				range.setStart(parent, stat.pos);
				stat.done = true;
			} else {
				stat.pos = stat.pos - parent.textContent.length;
			}
		} else {
			for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
				const currentNode = parent.childNodes[i];
				setCursorPosition(currentNode, range, stat);
			}
		}
		return range;
	}

	//!THIS IS BROKEN AS HELL
	onMount(() => {
		textarea.addEventListener('keyup', (e) => {
			console.log('keyup', e.key);
			let isSelectAll = false;
			if (e.key == 'a' && e.ctrlKey) {
				isSelectAll = true;
			}
			if (e.key == 'Enter' && e.shiftKey) {
				console.log('newLine');
			}
			if (e.key == 'Enter' && !e.shiftKey) {
				e.preventDefault();
				console.log('send');
			} else if (
				e.key != 'ArrowUp' &&
				e.key != 'ArrowDown' &&
				e.key != 'ArrowLeft' &&
				e.key != 'ArrowRight' &&
				e.key != 'Shift' &&
				e.key != 'Control' &&
				e.key != 'Alt' &&
				e.key != 'Meta' &&
				isSelectAll != true
			) {
				//get current cursor position
				const sel = window.getSelection();
				const node = sel.focusNode;
				const offset = sel.focusOffset;
				const pos = getCursorPosition(textarea, node, offset, { pos: 0, done: false });
				if (offset === 0) pos.pos += 0.5;
				const temp = API.Messages.formatMarkdownPreserve(textarea.innerText);

				textarea.innerHTML = temp;

				sel.removeAllRanges();
				const range = setCursorPosition(textarea, document.createRange(), {
					pos: pos.pos,
					done: false,
				});
				range.collapse(true);
				sel.addRange(range);
			}
		});
	});

	function scrollToBottom() {
		chatref.scrollTo(0, chatref.scrollHeight);
	}
	const listener = startGatewayListener(AppState.userId);
	listener.on<any>('messageCreate', (event) => {
		console.log(TabContext.channelId, event.data.channel_id, event.data.content);
		if (event.data.channel_id === TabContext.channelId) {
			const newMessage = {
				id: event.data.id,
				channel_id: event.data.channel_id,
				content: event.data.content,
				timestamp: event.data.timestamp,
				author: event.data.author,
				embeds: event.data.embeds,
				attachments: event.data.attachments,
				mentions: event.data.mentions,
				mention_roles: event.data.mention_roles,
			} as MessageType;

			let isAtBottom = false;
			if (chatref.scrollTop + chatref.clientHeight >= chatref.scrollHeight) {
				isAtBottom = true;
			}
			console.log('newMessage', newMessage);
			setMessages(messages().concat(newMessage));

			if (isAtBottom) {
				scrollToBottom();
			}
		}
	});

	const [isVoiceChannel, setIsVoiceChannel] = createSignal(false);

	const [messages, { mutate: setMessages }] = createResource(async () => {
		const messages = await API.getMessages(TabContext.channelId);
		return messages.reverse();
	});

	function updateMessage(updated: Partial<MessageType>) {
		setMessages((messages) => {
			const index = messages.findIndex((message) => message.id == updated.id);
			if (index == -1) return messages;
			messages[index] = { ...messages[index], ...updated };
			return messages;
		});
	}
	onMount(() => {
		const channel = API.getChannelById(TabContext.guildId, TabContext.type); //TODO: Move VoiceChannels to their own component
		if (channel && channel.type == CONSTANTS.GUILD_VOICE) {
			console.log('voice channel');
			setIsVoiceChannel(true);
		}
		scrollToBottom();
	});
	async function startVoice() {
		await invoke('send_voice_state_update', {
			userId: AppState.userId,
			guildId: TabContext.tab.guildId,
			channelId: TabContext.tab.guildId,
		});

		const listener = useTaurListener('voice_gateway', (event) => {
			console.log('event', event);
		});

		const voiceStateUpdate = await gatewayOneTimeListener(AppState.userId, 'voiceStateUpdate');
		console.log('voice_state', voiceStateUpdate);
		const voiceServerUpdate = await gatewayOneTimeListener(AppState.userId, 'voiceServerUpdate');
		console.log('voice_server', voiceServerUpdate);

		console.log(
			await invoke('start_voice_gateway', {
				userId: AppState.userId,
				guildId: TabContext.guildId,
				endpoint: voiceServerUpdate.data.endpoint,
				voiceToken: voiceServerUpdate.data.token,
				sessionId: voiceStateUpdate.data.session_id,
			}),
		);

		window.sendToVoice = (data: string) => {
			console.log('sending', data);
			invoke('send_to_voice_gateway', { packet: JSON.stringify(data) });
		};
	}
	const renderableMessages = createMemo(() => {
		const renderableMessages = [];
		let lastAuthor = '';

		const messagesToRender = messages();
		if (!messagesToRender) return [];
		console.log('messagesToRender', messagesToRender);
		for (let i = 0; i < messagesToRender.length; i++) {
			if (
				messagesToRender[i].author.id == lastAuthor
				//&& messagesToRender[i].timestamp - messagesToRender[i - 1].timestamp < 1000 * 60 * 7
			) {
				renderableMessages.push(<Message same={true} message={messagesToRender[i]} updateMessage={updateMessage} />);
			} else {
				renderableMessages.push(<Message message={messagesToRender[i]} updateMessage={updateMessage} />);
				lastAuthor = messagesToRender[i].author.id as string;
			}
		}
		console.log('renderableMessages', renderableMessages);
		return renderableMessages;
	});

	return (
		<main class={style.main}>
			<ol ref={chatref}>
				{renderableMessages()}
				<Show when={isVoiceChannel()}>
					<button onclick={startVoice}>Join Voice Channel</button>
				</Show>
			</ol>
			{/* style="position: relative; outline: none; white-space: pre-wrap; overflow-wrap: break-word;"  */}
			<section>
				<h1>CHAT INPUT WILL BE HERE</h1>
				<div
					class={style.textarea}
					role="textbox"
					aria-multiline="true"
					spellcheck={true}
					aria-autocomplete="list"
					contenteditable={true}
					ref={textarea}
				/>
			</section>
		</main>
	);
}
