import { createVirtualizer } from '@tanstack/solid-virtual';
import { Accessor, For, Resource, Setter } from 'solid-js';
import { MessageReference, Message as MessageType } from '../../types/Messages';
import style from './css.module.css';
import Message from './Message';

const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const sentences = new Array(10000).fill(true).map(() => randomNumber(20, 70));
type MessageListVirtualizedProps = {
	messages: Accessor<MessageType[]>;
	updateMessage: (updated: Partial<MessageType>) => void;
	setReplyingTo: Setter<MessageReference | null>;
};
export default function MessageListVirtualized(props: MessageListVirtualizedProps) {
	let parentRef: HTMLOListElement;

	const count = props.messages().length;
	const virtualizer = createVirtualizer({
		count,
		getScrollElement: () => parentRef,
		estimateSize: () => 50,
	});

	const items = virtualizer.getVirtualItems();
	let lastAuthor = '';

	return (
		<ol class={style.TEST} ref={parentRef}>
			<div
				style={{
					height: virtualizer.getTotalSize() + 'px',
					width: '100%',
					position: 'relative',
				}}
			>
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						transform: `translateY(${items[0]?.start ?? 0}px)`,
					}}
				>
					<For each={items}>
						{(virtualRow) => {
							let msgRef;
							if (props.messages()[virtualRow.index].message_reference) {
								msgRef = props
									.messages()
									.find((msg) => msg.id == props.messages()[virtualRow.index].message_reference.message_id);
							}
							let same = props.messages()[virtualRow.index].author.id == lastAuthor;
							if (!same) {
								lastAuthor = props.messages()[virtualRow.index].author.id;
							}
							return (
								<Message
									dataIndex={virtualRow.index}
									propsRef={(element) => {
										element.setAttribute('data-index', virtualRow.index.toString());
										virtualizer.measureElement;
									}}
									refMsg={msgRef}
									same={same}
									setReference={props.setReplyingTo}
									message={props.messages()[virtualRow.index]}
									updateMessage={props.updateMessage}
								/>
							);
						}}
					</For>
				</div>
			</div>
		</ol>
	);
}
{
	/* <For each={messages()}>
					{(message) => {
						let msgRef;
						if (message.message_reference) {
							msgRef = messages().find((msg) => msg.id == message.message_reference.message_id);
						}
						let same = message.author.id == lastAuthor;
						if (!same) {
							lastAuthor = message.author.id;
						}
						return (
							<Message
								refMsg={msgRef}
								same={same}
								setReference={setReplyingTo}
								message={message}
								updateMessage={updateMessage}
							/>
						);
					}}
				</For> */
}
