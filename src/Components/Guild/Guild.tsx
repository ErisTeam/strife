// SolidJS
import { createEffect, onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';
import { Guild as GuildType, Channel } from '../../types';

// Style
import style from './Guild.module.css';
import { A } from '@solidjs/router';

interface GuildProps {
	id: string;
	className?: string;
}

const Guild = (props: GuildProps) => {
	const AppState: any = useAppState();
	let spanRef : any;
	let liRef:any;
	//my god this is so hacky
	function scrollu()
	{
		spanRef.style.visibility = "hidden";

		console.log(liRef.getBoundingClientRect().top, spanRef.style.top);
	
		spanRef.style.top = `${liRef.getBoundingClientRect().top+13}px`;
		spanRef.style.visibility = "visible";
		return ""
	}
	createEffect(() => {
		spanRef.style.top = `${(liRef.getBoundingClientRect().top+13)}px`;
		if(spanRef)
		{
		liRef.parentNode.parentNode.addEventListener("scroll", scrollu);
		}
	});


	const guild = AppState.userGuilds().find((x: GuildType) => x.id === props.id);
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
				<img src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=96`} alt={guild.name} />
			</button>
			 <span ref={spanRef} class={style.span}>{guild.name}</span> 
		{scrollu()} 

		</li>
	);
};

export default Guild;
