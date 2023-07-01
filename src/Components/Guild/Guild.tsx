// SolidJS
import { createEffect } from 'solid-js';

// API
import { useAppState } from '../../AppState';

// Style
import style from './Guild.module.css';

interface GuildProps {
	index: number;
	className?: string;
}

const Guild = (props: GuildProps) => {
	const AppState = useAppState();
	let spanRef: HTMLSpanElement | undefined;
	let liRef: HTMLLIElement | undefined;
	let beforeRef: HTMLDivElement | undefined;

	function scrollu() {
		if (spanRef && beforeRef && liRef) {
			spanRef.style.transitionDuration = '0s';
			beforeRef.style.transitionDuration = '0s';
			spanRef.style.top = `${liRef.getBoundingClientRect().top + 13}px`;
			beforeRef.style.top = `${liRef.getBoundingClientRect().top + 19}px`;

			spanRef.style.transitionDuration = '0.3s';
			beforeRef.style.transitionDuration = '0.3s';
		}
	}
	createEffect(() => {
		if (spanRef && beforeRef && liRef) {
			spanRef.style.top = `${liRef.getBoundingClientRect().top + 13}px`;
			beforeRef.style.top = `${liRef.getBoundingClientRect().top + 19}px`;

			liRef.parentNode?.parentNode?.addEventListener('scroll', scrollu);
		}
	});

	const guild = AppState.userGuilds[props.index];

	//TODO: rewrite data storing to use arrays to remove constant find calls

	if (props.index === -1) {
		return (
			<li class={style.li} ref={liRef}>
				<div class={style.before} ref={beforeRef} />
				<button
					class={style.guild}
					onClick={() => {
						if (AppState.currentGuild() !== 'friends') {
							AppState.setCurrentGuild('friends');
						} else {
							AppState.setCurrentGuild(null);
						}
					}}
				>
					<img
						src={
							'https://variety.com/wp-content/uploads/2021/07/Rick-Astley-Never-Gonna-Give-You-Up.png?w=681&h=383&crop=1'
						}
						alt={AppState.t.friendsAlt()}
					/>
				</button>
				<span ref={spanRef} class={style.span}>
					{AppState.t.friends()}
				</span>
			</li>
		);
	}
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
				<img src={guild.properties.icon} alt={AppState.t.guild.logoAlt({ guildName: guild.properties.name })} />
			</button>
			<span ref={spanRef} class={style.span}>
				{guild.properties.name}
			</span>
		</li>
	);
};

export default Guild;
