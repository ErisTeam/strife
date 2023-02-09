/** @format */

// Components
import Input from './test/components/Input/Input';
import Button from './test/components/Button/Button';
import CheckBox from './test/components/CheckBox/CheckBox';
import Switch from './test/components/Switch/Switch';
import TextArea from './test/components/TextArea/TextArea';

// Style
import style from './Tests.module.css';

function Tests() {
	return (
		<div class={style.mainDiv}>
			<h1>Tests</h1>
			<Input type="text" placeholder="Gami to Furras" />
			<Button type="submit">Gami to Furras</Button>
			<CheckBox value="Test CheckBox" />
			<Switch rounded />
			<TextArea wrap="hard" placeholder="Gami to Furras" />
		</div>
	);
}

export default Tests;
