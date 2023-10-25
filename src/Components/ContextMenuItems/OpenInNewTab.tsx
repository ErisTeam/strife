import { useMenu } from '../ContextMenu/ContextMenu';
import API from '../../API';
import { Channel } from '../../types/Channel';
import { useAppState } from '../../AppState';
import { createTextChannelTab } from '../Tabs/TabUtils';

export default () => {
	const menu = useMenu<{ channel: Channel }>();

	const AppState = useAppState();
	return (
		<button
			onclick={() => {
				console.log('open in new tab');

				const listIndex = AppState.tabs.findIndex(
					(t) => t.component == 'textChannel' && t.channelId == menu.channel.id,
				);
				if (listIndex != -1) {
					API.Tabs.setAsCurrent(listIndex);
				} else {
					API.Tabs.add(createTextChannelTab(menu.channel));
				}
				menu.closeMenu();
			}}
		>
			Open in new tab
		</button>
	);
};
