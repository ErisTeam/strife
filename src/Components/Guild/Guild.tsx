// SolidJS
import { Accessor, createEffect, onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';
import { Guild as GuildType, Channel } from '../../discord';

// Style
import style from './Guild.module.css';
import { A } from '@solidjs/router';

interface GuildProps {
	index: number;
	className?: string;
}

const Guild = (props: GuildProps) => {
	const AppState: any = useAppState();
	let spanRef: any;
	let liRef: any;
	let beforeRef: any;

	function scrollu() {
		spanRef.style.transitionDuration = '0s';
		beforeRef.style.transitionDuration = '0s';
		spanRef.style.top = `${liRef.getBoundingClientRect().top + 13}px`;
		beforeRef.style.top = `${liRef.getBoundingClientRect().top + 19}px`;

		spanRef.style.transitionDuration = '0.3s';
		beforeRef.style.transitionDuration = '0.3s';
	}
	createEffect(() => {
		if (spanRef && beforeRef) {
			spanRef.style.top = `${liRef.getBoundingClientRect().top + 13}px`;
			beforeRef.style.top = `${liRef.getBoundingClientRect().top + 19}px`;

			liRef.parentNode.parentNode.addEventListener('scroll', scrollu);
		}
	});

	const guild = AppState.userGuilds()[props.index];

	//TODO: rewrite data storing to use arrays to remove constant find calls

	return (
		<li class={style.li} ref={liRef}>
			<div class={style.before} ref={beforeRef} />
			<button
				class={style.guild}
				onClick={() => {
					if (AppState.currentGuild() !== guild) {
						AppState.setCurrentGuild(guild);
					} else {
						AppState.setCurrentGuild(null);
					}
				}}
			>
				<img src={guild.properties.icon} alt={guild.properties.name} />
			</button>
			<span ref={spanRef} class={style.span}>
				{guild.properties.name}
			</span>
		</li>
	);
};

export default Guild;
