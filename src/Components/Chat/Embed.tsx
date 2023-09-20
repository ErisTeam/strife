import style from './Embed.module.css';
import { Embed as EmbedType } from '../../discord';
type EmbedProps = {
	embed: EmbedType;
};

export default function Embed(props: EmbedProps) {
	console.log(props.embed);
	return (
		<div class={style.embed} style={{ '--embed-color': `#${props.embed.color.toString(16).padStart(6, '0')}` }}>
			{props.embed.title && <h1>{props.embed.title}</h1>}
			{props.embed.description && <p>{props.embed.description}</p>} //TODO: Add markdown support
			{/* {props.embed.} */}
		</div>
	);
}
