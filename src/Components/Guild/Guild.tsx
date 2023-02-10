// SolidJS
import { A } from '@solidjs/router';
import { createEffect, onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';
import { GuildType } from '../../discord';

// Style
import style from './Guild.module.css';

interface GuildProps {
	id: string;
}

const Guild = (props: GuildProps) => {
	let pos: HTMLElement | any;
	let span: HTMLElement | any;
	let before: HTMLElement | any;
	const AppState: any = useAppState();

	const guild = AppState.userGuilds().find((x: GuildType) => x.id === props.id);
	onMount(() => {
		const observer = new ResizeObserver(([e]) => {
			/* set span position to pos position */

			span.style.top = `${
				pos.getBoundingClientRect().y + span.getBoundingClientRect().height / 6
			}px`;
			before.style.top = `${
				pos.getBoundingClientRect().y +
				before.getBoundingClientRect().height / 6
			}px`;
		});
		observer.observe(pos);
	});

	return (
		<li ref={pos} class={style.guild}>
			<div ref={before} class={style.before}></div>
			<A href={`${props.id}/${guild.system_channel_id}`}>
				<img
					src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`}
					alt={guild.name}
				/>
			</A>
			<span ref={span}>{guild.name}</span>
		</li>
	);
};

export default Guild;
