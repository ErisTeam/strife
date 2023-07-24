import { useTrans } from '../../Translation';
import style from './css.module.css';
//is a separate component because all type of sorting and filtering will be done here
function ChannelTitle() {
	const [t] = useTrans();

	return (
		<div class={style.title}>
			<h1>{t.friends()}</h1>
		</div>
	);
}
export default ChannelTitle;
