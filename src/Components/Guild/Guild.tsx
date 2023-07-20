// SolidJS
import { Show, createEffect, onCleanup, onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';

// Style
import style from './css.module.css';
import API from '../../API';
import { useTrans } from '../../Translation';

interface GuildProps {
	index: number;
	className?: string;
}

const Guild = (props: GuildProps) => {
	const AppState = useAppState();
	const [t] = useTrans();
	const guild = AppState.userGuilds[props.index];

	let toolTipRef: HTMLElement;
	let ref: HTMLLIElement;

	function updateRelativeYPositon() {
		console.log('updating relative position');
		let boundingRect = ref.getBoundingClientRect();
		toolTipRef.style.top = `${boundingRect.top + window.scrollY + boundingRect.height / 2}px`;
	}
	onMount(() => {
		let boundingRect = ref.getBoundingClientRect();
		updateRelativeYPositon();
		toolTipRef.style.left = `${boundingRect.width}px`;

		ref.parentElement.parentElement.addEventListener('scroll', updateRelativeYPositon);
	});
	onCleanup(() => {
		ref.parentElement.parentElement.removeEventListener('scroll', updateRelativeYPositon);
	});

	//TODO: rewrite data storing to use arrays to remove constant find calls

	//TODO: move to seperate component
	if (props.index === -1) {
		return (
			<li
				class={style.guild}
				role="button"
				ref={ref}
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
				/>
				<aside ref={toolTipRef}>Friends</aside>
			</li>
		);
	}
	return (
		<li
			class={style.guild}
			role="button"
			ref={ref}
			onClick={() => {
				if (AppState.currentGuild() !== guild) {
					AppState.setCurrentGuild(guild);
				} else {
					AppState.setCurrentGuild(null);
				}
			}}
		>
			<Show
				when={guild.properties.icon}
				fallback={<h1 class={style.fallbackText}>{API.getInitials(guild.properties.name)}</h1>}
			>
				<img src={guild.properties.icon} alt={t.guild.logoAlt({ guildName: guild.properties.name })} />
			</Show>
			<aside ref={toolTipRef}>{guild.properties.name}</aside>
		</li>
	);
};

export default Guild;
