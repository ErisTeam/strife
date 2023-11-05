import { Accessor, Setter, Show, createSignal } from 'solid-js';

import { Portal } from 'solid-js/web';
import ContextMenu, { useMenu } from '../../../Components/ContextMenu/ContextMenu';

import SplashText from '../../../Components/Dev/SplashText';
import {
	ContextMenusProvider,
	createContextMenu as createContextMenu,
} from '../../../Components/ContextMenuNew/ContextMenu';
import { useAppState } from '../../../AppState';
import { Channel } from '../../../types/Channel';
import { Guild } from '../../../types/Guild';

interface channelContextMenu {
	channel: Accessor<Channel>;
}
interface guildContextMenu {
	guild: Accessor<Guild>;
}

function ChannelTestElement() {
	const menu = useMenu<channelContextMenu>();
	console.log(menu);
	return <div>channel id: {menu.channel().id}</div>;
}
function GuildTestElement() {
	const menu = useMenu<guildContextMenu>();
	console.log(menu);
	return <div>guild id: {menu.guild().properties.id}</div>;
}

function TestElement2() {
	const appState = useAppState();
	return <div>userId: {appState.userId}</div>;
}

function ContextChannel() {
	const [channel, setChannel] = createSignal<Channel>({
		id: '123467807654',
		guild_id: '123456789',
		name: 'test',
		type: 0,
		position: 0,
		permission_overwrites: [],
		rtc_region: null,
		parent_id: null,
		nsfw: false,
		last_message_id: null,
		bitrate: 0,
	});
	let ref;
	return (
		<>
			<div style={{ background: 'green', width: '5rem', height: '5rem' }} ref={ref}>
				Click Here
			</div>
			<ContextMenu
				openRef={ref}
				data={{
					channel: channel,
				}}
			>
				<ChannelTestElement />
				<TestElement2 />
			</ContextMenu>
		</>
	);
}
function ContextGuild() {
	const [guild, setGuild] = createSignal<Guild>({
		properties: {
			id: '123456789',
			name: 'test',
			icon: '',
			system_channel_id: null,
			owner_id: '123456789',
		},
		description: '',
		splash: '',
		banner: '',
		member_count: 0,
		presence_count: 0,
		features: [],
		channels: [],
		roles: [],
	});

	let ref;
	return (
		<>
			<div ref={ref} style={{ background: 'green', width: '5rem', height: '5rem' }}>
				Click Here
			</div>
			<ContextMenu
				openRef={ref}
				data={{
					guild: guild,
				}}
			>
				<GuildTestElement />
			</ContextMenu>
		</>
	);
}

function ContextMenuNewTest() {
	const [channel, setChannel] = createSignal<Channel>({
		id: '123467807654',
		guild_id: '123456789',
		name: 'test',
		type: 0,
		position: 0,
		permission_overwrites: [],
		rtc_region: null,
		parent_id: null,
		nsfw: false,
		last_message_id: null,
		bitrate: 0,
	});
	const [name, setName] = createSignal('test');

	function TestElement3() {
		const context = useMenu<{ name: Accessor<string>; setName: Setter<string> }>();
		return (
			<div>
				{context.name()}
				<input type="text" value={context.name()} oninput={(e) => context.setName(e.currentTarget.value)} />
			</div>
		);
	}

	const contextMenu = createContextMenu({
		component: [TestElement3, ChannelTestElement],
		data: { channel, name, setName },
	});

	return (
		<>
			<button
				style={{ background: 'green', width: '5rem', height: '5rem' }}
				oncontextmenu={(e) => {
					e.preventDefault();
					contextMenu.toggleVisibility({ x: e.clientX, y: e.clientY });
				}}
			>
				Click here
			</button>
		</>
	);
}

export default () => {
	console.log('test');

	const [show, setShow] = createSignal(false);
	return (
		<div style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}>
			<Portal>
				<div id="ContexMenu"></div>
			</Portal>
			Test
			<ContextGuild />
			<ContextChannel />
			<div>
				<button onclick={() => setShow(!show())}>Toggle</button>

				<SplashText text="New ContextMenu">ContextMenu</SplashText>

				<ContextMenusProvider>
					<Show when={show()}>
						<ContextMenuNewTest />
					</Show>
				</ContextMenusProvider>
			</div>
		</div>
	);
};
