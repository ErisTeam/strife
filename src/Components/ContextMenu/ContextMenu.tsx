import { Portal, Show } from 'solid-js/web';
import { Channel, Guild } from '../../discord';
import style from './css.module.css';
import { useAppState } from '../../AppState';
import ContextMenuItem from './ContextMenuItem';
import API from '../../API';
import { useNavigate, useParams } from '@solidjs/router';
import { Accessor, Match, Switch, createEffect, onMount } from 'solid-js';
const ContextMenu = () => {
	const AppState = useAppState();
	const params = useParams();
	let ref;
	const navigate = useNavigate();
	//on click outside
	onMount(() => {
		const listener = (e: MouseEvent) => {
			if (!ref.contains(e.target as Node)) {
				AppState.setContextMenuData('isShow', false);
			}
		};
		document.addEventListener('click', listener);
		return () => {
			document.removeEventListener('click', listener);
		};
	});

	// AppState.setContextMenuData('isShow', false);
	return (
		<Portal>
			<Show when={AppState.contextMenuData.isShow}>
				<Switch>
					<Match when={AppState.contextMenuData.type == 'channel'}>
						<ol
							ref={ref}
							class={style.contextMenu}
							style={{
								top: AppState.contextMenuData.y.toString() + 'px',
								left: AppState.contextMenuData.x.toString() + 'px',
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

										navigate(
											`/app/${(AppState.contextMenuData.channel as Channel).guild_id}/${
												(AppState.contextMenuData.channel as Channel).id
											}`
										);
									} else {
										API.addTab(AppState.contextMenuData.channel as Channel);
										navigate(
											`/app/${AppState.tabs[AppState.tabs.length - 1].guildId}/${
												AppState.tabs[AppState.tabs.length - 1].channelId
											}`
										);
									}
								}}
							/>
						</ol>
					</Match>
				</Switch>
			</Show>
		</Portal>
	);
};
export default ContextMenu;
