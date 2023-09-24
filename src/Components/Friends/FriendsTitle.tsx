import { t } from '../../Translation';
import style from './css.module.css';
//is a separate component because all type of sorting and filtering will be done here
function FriendsTitle() {
	return (
		<div class={style.title}>
			<h1>{t.friends()}</h1>
		</div>
	);
}
export default FriendsTitle;
