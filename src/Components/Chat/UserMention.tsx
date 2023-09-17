import { createContextMenu } from '../ContextMenuNew/ContextMenu';

type UserMentionProps = {
	mentioned_user: any; //TODO: User type
};
export default (props: UserMentionProps) => {
	//!DOESNT WORK WHEN USERNAME IS NOT KNOWN TODO:FIX
	const contextMenu = createContextMenu({
		component: [() => <div>{props.mentioned_user.username}</div>],
		data: props.mentioned_user,
	});
	console.log(contextMenu.toggleVisibility);
	return (
		<span style={{ background: 'blue' }} onclick={(e) => contextMenu.toggleVisibility({ x: e.clientX, y: e.clientY })}>
			{props.mentioned_user.username}
		</span>
	);
};
