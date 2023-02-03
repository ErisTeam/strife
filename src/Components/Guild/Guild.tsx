import { Component, createSignal, Show, onMount, For } from 'solid-js';
import { useAppState } from '../../AppState';
import API from '../../API';
import { A, BeforeLeaveEventArgs, useBeforeLeave } from '@solidjs/router';
import style from './Guild.module.css';
import { GuildType } from '../../discord';

interface GuildProps {
	id: string;
}

const Guild = (props: GuildProps) => {
	const AppState: any = useAppState();
	const guild = AppState.userGuilds().find((x: GuildType) => x.id === props.id);

	return (
		<li class={style.guild}>
			<A href={`${props.id}/${guild.system_channel_id}`}>
				<img
					src={
						'https://cdn.discordapp.com/icons/' +
						guild.id +
						'/' +
						guild.icon +
						'.webp?size=96'
					}
					alt={guild.name}
				/>
			</A>
			<span>{guild.name}</span>
		</li>
	);
};
export default Guild;
