import { X } from 'lucide-solid';
import { useAppState } from '../../../AppState';
import style from '../Embed.module.css';
import { EmbedProps } from '../Embed';
//TODO: translate component
export default function TwitterEmbed(props: EmbedProps) {
	const AppState = useAppState();
	const dateFormater = new Intl.DateTimeFormat(AppState.localeJsFormat(), {
		dateStyle: 'medium',
		timeStyle: 'short',
	});
	const numberFormater = new Intl.NumberFormat(AppState.localeJsFormat(), {
		notation: 'compact',
	});

	const tweetId = props.embed.url.match(/\/\d+/)[0].slice(1);

	function onImageError(e: Event) {
		(e.target as HTMLImageElement).src = '/Friends/falback.png';
	}

	return (
		<article class={`${style.embed} ${style.twitter}`}>
			{props.showCloseButton && (
				<aside class={style.closeButton}>
					<X />
				</aside>
			)}

			<aside class={style.author}>
				<a class={style.profileImage} href={props.embed.author.url} title="View profile on Twitter">
					<img src={props.embed.author.proxy_icon_url} onerror={onImageError} />
				</a>
				<span>
					<a class={style.username} title="View profile on Twitter">
						{props.embed.author.name.replace(/\(@.*?\)/g, '')}
					</a>
					<a class={style.profileLink} href={props.embed.author.url} title="View profile on Twitter">
						{props.embed.author.name.match(/@.*?\)/g)[0].slice(0, -1)}
					</a>
				</span>
				<img class={style.icon} src={props.embed.footer.proxy_icon_url} alt="" />
			</aside>
			<p class={style.description}>{props.embed.description}</p>
			<aside class={style.time}>
				<a href={props.embed.url} title={dateFormater.format(new Date(props.embed.timestamp))}>
					<time>{dateFormater.format(new Date(props.embed.timestamp))}</time>
				</a>
			</aside>
			<section class={style.fields}>
				<a class={style.like} title="Like this post" href={`https://twitter.com/intent/like?tweet_id=${tweetId}`}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<g>
							<path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
						</g>
					</svg>
					{numberFormater.format(parseInt(props.embed.fields[0].value))}
				</a>
				<a
					class={style.reply}
					title="Reply to this post"
					href={`https://twitter.com/intent/tweet?in_reply_to=${tweetId}`}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<g>
							<path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z"></path>
						</g>
					</svg>
					Reply
				</a>
				<a class={style.retweets} title="Retweet this post" href={props.embed.url}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<g>
							<path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path>
						</g>
					</svg>
					{numberFormater.format(parseInt(props.embed.fields[1].value))}
				</a>
				{/* <a class={style.share} title="Share this post">
					<svg viewBox="0 0 24 24" aria-hidden="true" style="">
						<g>
							<path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
						</g>
					</svg>
					Share
				</a> */}
			</section>
			<a href={props.embed.url} class={style.replies} title="Read replies">
				Read replies
			</a>
		</article>
	);
}
