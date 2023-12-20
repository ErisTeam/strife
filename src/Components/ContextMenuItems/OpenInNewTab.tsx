import { useMenu } from '../ContextMenu/ContextMenu';
import { Channel, ChannelType } from '../../types/Channel';
import { useAppState } from '../../AppState';
import { createTextChannelTab } from '../Tabs/TabUtils';
import { add, setAsCurrent } from '@/API/Tabs';

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
					setAsCurrent(listIndex);
				} else {
					const tab = createTextChannelTab(menu.channel);
					if (menu.channel.type == ChannelType.GuildVoice) {
						tab.component = 'voiceChannel';
					}
					add(tab);
				}
				menu.closeMenu();
			}}
		>
			Open in new tab
		</button>
	);
};
