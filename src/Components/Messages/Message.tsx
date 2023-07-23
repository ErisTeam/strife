import { Accessor, For } from 'solid-js';
import { useAppState } from '../../AppState';
import ContextMenu from '../ContextMenu/ContextMenu';
import { Message as MessageType } from '../../discord';
interface MessageProps {
	message: MessageType;
	updateMessage: (val: Partial<MessageType>) => void;
	setReference?: (id: string) => void;
}
const Message = ({ message, updateMessage, setReference }: MessageProps) => {
	let embed;

	const val = message;
	const intl = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'short',
		timeStyle: 'medium',
	});

	function formatContent(content: string) {
		const mention = /<@!?(\d+)>/gm;
		console.log(content, content.match(mention), message);
		content.match(mention)?.forEach((element) => {
			console.log(element);
		});
	}
	formatContent(message.content);

	function formatEmbed(embed: any) {}

	if (val.embeds && val.embeds[0]) {
		console.log(val);
		switch (val.embeds[0].type) {
			case 'gifv':
				embed = (
					<video
						src={val.embeds[0].video.proxy_url}
						autoplay={true}
						loop={true}
						width={val.embeds[0].video.width}
						height={val.embeds[0].video.height}
					></video>
				);
				break;
			case 'video':
				embed = (
					<img
						src={val.embeds[0].video.proxy_url}
						width={val.embeds[0].video.width}
						height={val.embeds[0].video.height}
					></img>
				);
				break;
			default:
				embed = <h2>{JSON.stringify(val.embeds[0])}</h2>;
				break;
		}
	}
	let ref: HTMLElement;
	return (
		<li style={{ display: 'flex', 'flex-direction': 'column' }}>
			<span>
				<button>{message.author.display_name}</button>
				{intl.format(new Date(message.timestamp))}
			</span>
			<span ref={ref}>{message.content}</span>
			{/* <For></For> */}
			<ContextMenu data={{}} openRef={ref}>
				<button>edit</button>
			</ContextMenu>
		</li>
	);
};
export default Message;
