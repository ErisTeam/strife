// SolidJS
import { JSX, createMemo, onCleanup, onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';
// Components
import ChannelCategory from './ChannelListCategory';

//Style
import style from './css.module.css';
import ChannelListElement from './ChannelListElement';
import { ChannelType, Guild } from '../../discord';
import ChannelTitle from './ChannelTitle';
import { invoke } from '@tauri-apps/api';

interface ChannelListProps {
	className?: string;
	guild: Guild;
}

const ChannelList = (props: ChannelListProps) => {
	const AppState = useAppState();
	console.log('test', props);

	const channels = createMemo(() => {
		console.log('rendering channels');
		const channelsRender: JSX.Element[] = [];

		let children: JSX.Element[] = [];

		const guild = props.guild;

		for (let i = guild.channels.length - 1; i >= 0; i--) {
			//TODO: replace magic number
			if (guild.channels[i].type === ChannelType.GuildCategory) {
				channelsRender.push(
					<ChannelCategory id={guild.channels[i].id} data={guild.channels[i]}>
						{children}
					</ChannelCategory>,
				);
				children = [];
			} else {
				if (guild.channels[i].parent_id) {
					children.push((<ChannelListElement data={guild.channels[i]} />) as Element);
				} else {
					channelsRender.push((<ChannelListElement data={guild.channels[i]} />) as Element);
				}
			}
		}
		return channelsRender.reverse();
	});

	let resizeRef: HTMLDivElement;
	let startX: number;
	let startWidth: number;

	function resize(e: MouseEvent) {
		let endWidth = startWidth + (e.clientX - startX);
		if (endWidth < 150) endWidth = 150;
		if (endWidth > 600) endWidth = 600;
		AppState.setChannelsSize(endWidth);

		resizeRef.parentElement.style.width = `${AppState.channelsSize()}px`;
		window.getSelection().removeAllRanges();
	}

	function startResize(e: MouseEvent) {
		console.log('start resize');
		startX = e.clientX;

		startWidth = AppState.channelsSize();
		document.addEventListener('mousemove', resize);
		document.addEventListener('mouseup', stopResize);
	}
	function stopResize() {
		console.log('stop resize');
		document.removeEventListener('mousemove', resize);
	}

	onMount(() => {
		resizeRef.parentElement.style.width = `${AppState.channelsSize()}px`;
	});

	onCleanup(() => {
		document.removeEventListener('mouseup', stopResize);
	});

	return (
		<nav class={[props.className, style.list].join(' ')}>
			<ChannelTitle guild={props.guild} />
			<ol>{channels()}</ol>
			<aside onmousedown={startResize} ref={resizeRef} class={style.resize} />
		</nav>
	);
};
export default ChannelList;
