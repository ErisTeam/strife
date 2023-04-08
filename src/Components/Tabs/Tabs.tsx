// API
import API from '../../API';
import { useAppState } from '../../AppState';

// Components
import Guild from '../Guild/Guild';

// Style
import style from './Tabs.module.css';

interface TabsProps {
	className?: string;
}

const Tabs = (props: TabsProps) => {
	const AppState: any = useAppState();

	return (
		<nav class={[props.className].join(' ')}>
			<ul></ul>
		</nav>
	);
};
interface TabProps {
	className?: string;
}
const Tab = (props: TabProps) => {};

export default Tabs;
