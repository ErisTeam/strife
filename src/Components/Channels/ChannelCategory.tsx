// API
import { JSX, children, createSignal } from 'solid-js';
import { Channel as ChannelType } from '../../discord';
import { ChevronDown } from 'lucide-solid';
// Components
// Style
import style from './css.module.css';

interface ChannelCategoryProps {
	id: string;
	className?: string;
	data: ChannelType;
	children: JSX.Element[];
}

const ChannelCategory = (props: ChannelCategoryProps) => {
	const [isExpanded, setIsExpanded] = createSignal(true);
	return (
		<li class={[props.className, style.category].join(' ')}>
			<button
				onClick={() => {
					setIsExpanded(!isExpanded());
				}}
			>
				<span>{props.data.name}</span>
				<ChevronDown class={isExpanded() == true ? style.rotate : null} />
			</button>
			<ol classList={{ [style.expand]: isExpanded() }} style={`--childCount: ${props.children.length}`}>
				{props.children}
			</ol>
		</li>
	);
};

export default ChannelCategory;
