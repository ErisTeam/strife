// SolidJS
import { Show, createEffect, onCleanup, onMount } from 'solid-js';

// API
import { useAppState } from '../../AppState';

// Style
import style from './css.module.css';
import API from '../../API';
import { useTrans } from '../../Translation';
const FriendsTab = () => {
	const AppState = useAppState();
	const [t] = useTrans();

	let toolTipRef: HTMLElement;
	let ref: HTMLLIElement;

	function updateRelativeYPositon() {
		console.log('updating relative position');
		const boundingRect = ref.getBoundingClientRect();
		toolTipRef.style.top = `${boundingRect.top + window.scrollY + boundingRect.height / 2}px`;
	}
	onMount(() => {
		const boundingRect = ref.getBoundingClientRect();
		updateRelativeYPositon();
		toolTipRef.style.left = `${boundingRect.width}px`;

		ref.parentElement.parentElement.addEventListener('scroll', updateRelativeYPositon);
	});
	onCleanup(() => {
		ref.parentElement.parentElement.removeEventListener('scroll', updateRelativeYPositon);
	});

	//TODO: rewrite data storing to use arrays to remove constant find calls

	//TODO: move to seperate component

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
			<aside ref={toolTipRef}>{t.friends()}</aside>
		</li>
	);
};
export default FriendsTab;
