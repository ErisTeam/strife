// API
import { Channel as ChannelType } from '../../discord';

// Components
// Style
import style from './css.module.css';

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
