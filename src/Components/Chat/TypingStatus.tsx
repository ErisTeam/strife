import { Accessor, For } from 'solid-js';
import style from './css.module.css';
type TypingStatusProps = {
	typingUsers: Accessor<any[]>;
};
function TypingStatus(props: TypingStatusProps) {
	return (
		<span class={style.typingUsers}>
			<svg width="24" height="8" xmlns="http://www.w3.org/2000/svg" class={style.loadingAnimation}>
				<circle cx="5" cy="3" r="2" fill="white">
					<animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.1s" repeatCount="indefinite" />
					<animate attributeName="r" id="a1" values="2;3;2" dur="1s" begin="0.1s" repeatCount="indefinite" />
				</circle>
				<circle cx="13" cy="3" r="2" fill="white">
					<animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.2s" repeatCount="indefinite" />
					<animate attributeName="r" id="a2" values="2;3;2" dur="1s" begin="0.2s" repeatCount="indefinite" />
				</circle>
				<circle cx="21" cy="3" r="2" fill="white">
					<animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.3s" repeatCount="indefinite" />
					<animate attributeName="r" id="a3" values="2;3;2" dur="1s" begin="0.3s" repeatCount="indefinite" />
				</circle>
			</svg>
			<For each={props.typingUsers()}>
				{(r) => {
					console.log('r', r);
					return <b>{r.user.member.user.global_name}</b>;
				}}
			</For>
			is typing...
		</span>
	);
}
export default TypingStatus;
