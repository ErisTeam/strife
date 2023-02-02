import { Component, createSignal, Show, onMount, For } from 'solid-js';
import { useAppState } from '../../AppState';
import API from '../../API';
import { A } from '@solidjs/router';
import style from './Guild.module.css';
import { GuildType } from '../../discord';

interface GuildProps {
	id: string;
}

const Guild = (props: GuildProps) => {
	const AppState: any = useAppState();
	const guild = AppState.userGuilds().find((x: GuildType) => x.id === props.id);
	console.log(guild);
	return (
		<li class={style.guild}>
			<A href={`/app/guild/${props.id}`}>
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
			<div></div>
		</li>
	);
};
export default Guild;