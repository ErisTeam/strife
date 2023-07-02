import { Channel, Guild } from '../../discord';
import style from './css.module.scss';
interface IContextMenu {
	type: 'channel' | 'message' | 'user' | 'guild' | 'guildMember' | 'image' | 'video' | 'audio' | 'file' | 'other';
	channel?: Channel;
	message?: any; //TODO: Replace with Message type
	user?: any; //TODO: Replace with User type
	guild?: Guild;
	attachment?: any; //TODO: Replace with Attachment type
	children?: Element;
}
const ContextMenu = (props: IContextMenu) => {
switch (props.type) {
	case 'channel':
		return (
			<ol class={style.contextMenu}> </ol>

		)
	// case 'message':
	// 	return ()
	// case 'user':
	// 	return ()
	// case 'guild':
	// 	return ()
	// case 'guildMember':
	// 	return ()
	// case 'image':
	// 	return ()
	// case 'video':
	// 	return ()
	// case 'audio':
	// 	return ()
	// case 'file':
	// 	return ()
	// case 'other':
	// 	return ()
	default:
};
export default ContextMenu;
