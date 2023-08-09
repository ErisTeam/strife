import { useNavigate } from '@solidjs/router';
import { useMenu } from '../ContextMenu/ContextMenu';
import API from '../../API';
import { Channel } from '../../discord';
import { tabStoreType, useAppState } from '../../AppState';
import Chat from '../Messages/Chat';
import { unwrap } from 'solid-js/store';
import { TextChannelTab } from '../Tabs/Tabs';

export default () => {
	const menu = useMenu<{ channel: Channel }>();
	const navigate = useNavigate();

	const AppState = useAppState();
	return (
		<button
			onclick={() => {
				console.log('open in new tab');
				const tab = AppState.Tabs.tabs.find(
					(tab: tabStoreType<Channel>) => tab.type == 'textChannel' && tab.tabData.id == menu.channel.id,
				);
				if (tab) {
					AppState.Tabs.setCurrentTab(AppState.Tabs.tabs.indexOf(tab));
				} else {
					console.log(menu.channel);
					AppState.Tabs.addTab(TextChannelTab(menu.channel), true);
				}

				menu.closeMenu();
			}}
		>
			Open in new tab
		</button>
	);
};
