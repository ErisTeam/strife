import { useNavigate } from '@solidjs/router';
import { useMenu } from '../ContextMenu/ContextMenu';
import API from '../../API';
import { Channel } from '../../discord';

export default () => {
	const menu = useMenu<{ channel: Channel }>();
	const navigate = useNavigate();
	return (
		<button
			onclick={() => {
				console.log('open in new tab');
				const [, tab] = API.Tabs.addNewTab(menu.channel, navigate);
				if (API.Tabs.addNewTab(menu.channel, navigate)[0] == 'alreadyexists') {
					API.Tabs.openTab(tab, navigate);
				}

				//menu.closeMenu();
			}}
		>
			Open in new tab
		</button>
	);
};
