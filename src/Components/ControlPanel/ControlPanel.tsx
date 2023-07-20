import style from './css.module.css';
import UserPanel from './UserPanel';
import ContextPanel from './ContextPanel';
import MediaPanel from './MediaPanel';
interface ControlPanelProps {
	className?: string;
}
function ControlPanel(props: ControlPanelProps) {
	return (
		<section class={[style.controlPanel, props.className].join(' ')}>
			<UserPanel />
			<ContextPanel />
			<MediaPanel />
		</section>
	);
}
export default ControlPanel;
