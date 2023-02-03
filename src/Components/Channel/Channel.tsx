import { Component, createSignal, Show, onMount, For } from 'solid-js';
import { useAppState } from '../../AppState';
import API from '../../API';
import { A } from '@solidjs/router';
import style from './Channel.module.css';
import { ChannelType } from '../../discord';

interface ChannelProps {
	data: ChannelType;
}

const Channel = (props: ChannelProps) => {
	const AppState: any = useAppState();

	return (
		<li class={style.channel}>
			<A href={props.data.id}>{props.data.name}</A>
		</li>
	);
};
export default Channel;
