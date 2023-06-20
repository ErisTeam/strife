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
	//my god this is so hacky
	function scrollu() {
		spanRef.style.visibility = 'hidden';

		console.log(liRef.getBoundingClientRect().top, spanRef.style.top);

		spanRef.style.top = `${liRef.getBoundingClientRect().top + 13}px`;
		spanRef.style.visibility = 'visible';
		return '';
	}
	createEffect(() => {
		spanRef.style.top = `${liRef.getBoundingClientRect().top + 13}px`;
		if (spanRef) {
			liRef.parentNode.parentNode.addEventListener('scroll', scrollu);
		}
	});

	const guild = AppState.userGuilds()[props.index];
	console.log('userGuilds', AppState.userGuilds());
	console.log(guild);
	//TODO: rewrite data storing to use arrays to remove constant find calls

	return (
		<li class={style.li} ref={liRef}>
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
				<img
					src={`https://cdn.discordapp.com/icons/${guild.properties.id}/${guild.properties.icon}.webp?size=96`}
					alt={guild.properties.name}
				/>
			</button>
			<span ref={spanRef} class={style.span}>
				{guild.properties.name}
			</span>
			{scrollu()}
		</li>
	);
};

export default Guild;
