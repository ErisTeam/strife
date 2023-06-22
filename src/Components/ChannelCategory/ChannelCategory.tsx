// SolidJS
import { For } from 'solid-js';

// API
import { Channel as ChannelType } from '../../discord';

// Components
import Channel from '../Channel/Channel';

// Style
import style from './ChannelCategory.module.css';

interface ChannelCategoryProps {
	id: string;
	className?: string;
	data: ChannelType;
	children: any[];
}

const ChannelCategory = (props: ChannelCategoryProps) => {
	return (
		<li class={[props.className, style.category].join(' ')}>
			<button>
				<h1>{props.data.name}⏬</h1>
			</button>
			<ol>{props.children}</ol>
		</li>
	);
};

export default ChannelCategory;
