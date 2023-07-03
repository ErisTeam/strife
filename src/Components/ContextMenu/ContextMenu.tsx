import { Portal, Show } from 'solid-js/web';
import { Channel, Guild } from '../../discord';
import style from './css.module.css';
import { useAppState } from '../../AppState';
import ContextMenuItem from './ContextMenuItem';
import API from '../../API';
import { useNavigate, useParams } from '@solidjs/router';
import { Accessor } from 'solid-js';
import clickOutside from '../../clickOutside';
const ContextMenu = () => {
	const AppState = useAppState();
	const params = useParams();
	const navigate = useNavigate();

	switch (AppState.contextMenuData.type) {
		case 'channel':
			return (
				<Portal>
					<Show when={AppState.contextMenuData.isShow}>
						<ol
							class={style.contextMenu}
							style={{
								left: AppState.contextMenuData.x.toPrecision(1) + 'px',
								top: AppState.contextMenuData.y.toPrecision(1) + 'px',
							}}
							use:clickOutside={() => {
								AppState.setContextMenuData('isShow', false);
								console.log('click outside');
							}}
						>
							<ContextMenuItem
								text="TEMP Open channel in new tab"
								fn={() => {
									AppState.setContextMenuData('isShow', false);
									API.addTab(AppState.contextMenuData.channel as Channel);
									navigate(
										`/app/${AppState.tabs[AppState.tabs.length - 1].guildId}/${
											AppState.tabs[AppState.tabs.length - 1].channelId
										}`
									);
								}}
							/>
							<ContextMenuItem
								text="TEMP Open channel"
								fn={() => {
									AppState.setContextMenuData('isShow', false);

									if (params.channelId) {
										API.replaceCurrentTab(AppState.contextMenuData.channel as Channel, params.channelId);
									} else {
										API.addTab(AppState.contextMenuData.channel as Channel);
									}
								}}
							/>
						</ol>
					</Show>
				</Portal>
			);
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
			return <></>;
	}
};
export default ContextMenu;
