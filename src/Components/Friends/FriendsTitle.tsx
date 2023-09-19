import { t } from '../../Translation';
import style from './css.module.css';
//is a separate component because all type of sorting and filtering will be done here
function ChannelTitle() {
	return (
		<div class={style.title}>
			<h1>{t('')}</h1>
		</div>
	);
}
export default ChannelTitle;
