import style from './css.module.css';
import { Mic, Headphones, Video, Settings } from 'lucide-solid';
function MediaPanel() {
	return (
		<div class={style.mediaPanel}>
			<button>
				<Mic />
			</button>
			<button>
				<Headphones />
			</button>
			<button>
				<Video />
			</button>
			<button>
				<Settings />
			</button>
		</div>
	);
}
export default MediaPanel;
