import { createResource } from 'solid-js';
import { useAppState } from './AppState';

const subReddits = ['aww'];
const time = 'month';

import style from './Err.module.css';
export default () => {
	const state = useAppState();

	const [image] = createResource(async () => {
		console.log('fetching');
		let s = subReddits;
		if (state.userID() == '362958640656941056') {
			s.push('gfur');
		}

		const subReddit = s[Math.floor(Math.random() * s.length)];
		const url = `https://www.reddit.com/r/${subReddit}/top.json?sort=top&t=${time}&limit=100"`;
		let res = await (await fetch(url)).json();
		console.log(res);
		let count = 0;
		while (count < 100) {
			let child =
				res.data.children[Math.floor(Math.random() * res.data.children.length)];
			console.log(child.data.post_hint, child.data.is_gallery);
			if (child.data.post_hint === 'image' && !child.data.is_gallery) {
				return { type: 'image', src: child.data.url };
			} else if (child.data.post_hint === 'hosted:video') {
				return {
					type: 'video',
					src: child.data.media.reddit_video.fallback_url,
				};
			}

			count++;
		}

		return {
			type: 'image',
			src: 'https://geographical.co.uk/wp-content/uploads/panda1200-1.jpg',
		};
	});
	return (
		<div class={style.container}>
			{() => {
				if (image.loading)
					return (
						<div class={style.fallback}>
							<h1>Loading...</h1>
						</div>
					);
				else if (image()?.type == 'image')
					return (
						<div>
							<img class={style.media} src={image()?.src} />
						</div>
					);
				else if (image()?.type == 'video')
					return (
						<div class={style.media}>
							<video src={image()?.src} autoplay loop muted />
						</div>
					);
			}}
			<h1 class={style.message}>UwU, somethin went wong</h1>
		</div>
	);
};
