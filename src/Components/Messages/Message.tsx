import { useAppState } from '../../AppState';
interface IMessage {
	msg: any;
	setEditing: (val: any) => void;
	setMessage: (val: string) => void;
	editing: () => any;
	reference: () => any;
	setReference: (val: any) => void;
}
const Message = ({ msg, setEditing, setMessage, editing, reference, setReference }: IMessage) => {
	const AppState = useAppState();
	let embed;
	const val = msg;
	const intl = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'short',
		timeStyle: 'medium',
	});
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
	return (
		<li>
			{intl.format(val.timestamp)} <br /> {val.author.username}: {val.content}
			{!!embed && embed}
			{val.author.id == AppState.userId() && (
				<button
					onClick={() => {
						if (editing()?.id == val.id) {
							setEditing(null);
							setMessage('');
							return;
						}
						setEditing(val);
						setMessage(val.content);
						//setReference(val.)
					}}
				>
					edit
				</button>
			)}
			<button
				onClick={() => {
					if (reference()?.message_id == val.id) {
						setReference(null);
						return;
					}
					setReference({
						channel_id: val.channel_id,
						message_id: val.id,
						guild_id: params.guildId,
					});
				}}
			>
				reply
			</button>
		</li>
	);
};
export default Message;
