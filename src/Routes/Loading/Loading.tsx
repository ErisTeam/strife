// Style
import style from './Loading.module.css';

import buttons from '../../Styles/Buttons.module.css';

const Loading = () => {
	return (
		<div class={style.main}>
			<iframe id="frame" src="/splashscreen.html" style={{ width: '200px', height: '400px' }}></iframe>
			<button
				class={buttons.default}
				onClick={() => {
					let frame: HTMLIFrameElement = document.getElementById('frame') as HTMLIFrameElement;
					frame.src += '';
				}}
			>
				Reload
			</button>
		</div>
	);
};

export default Loading;
