import { For, Match, Show, Switch, createMemo } from 'solid-js';
import { Embed as EmbedType } from '../../discord';
import style from './Embed.module.css';
import API from '../../API';
import { useAppState } from '../../AppState';
import openInBrowser from '../../API/anchor';
import TwitterEmbed from './embeds/TwitterEmbed';
import { X } from 'lucide-solid';
export type EmbedProps = {
	embed: EmbedType;
	showCloseButton?: boolean;
};

export default function Embed(props: EmbedProps) {
	console.log(props.embed);
	const AppState = useAppState();
	const dateFormater = new Intl.DateTimeFormat(AppState.localeJsFormat(), {
		dateStyle: 'short',
		timeStyle: 'short',
	});

	return (
		<Switch
			fallback={
				<article
					class={style.embed}
					style={{ '--embed-color': `#${props.embed.color?.toString(16).padStart(6, '0')}` }}
				>
					{props.showCloseButton && (
						<aside class={style.closeButton}>
							<X />
						</aside>
					)}

					<Show when={props.embed.author}>
						<header class={style.author}>
							{props.embed.author.icon_url && <img src={props.embed.author.icon_url} />}
							<span>{props.embed.author.name}</span>
						</header>
					</Show>
					<Switch>
						<Match when={props.embed.url}>
							<a class={style.title + ' mdLink'}>{props.embed.title}</a>
						</Match>
						<Match when={!props.embed.url && props.embed.title}>
							<h1 class={style.title}>{props.embed.title}</h1>
						</Match>
					</Switch>
					{props.embed.description && (
						<p class={style.description}>{API.Messages.formatMarkdownToJSX(props.embed.description, [])}</p>
					)}
					<section class={style.fields}>
						<For each={props.embed.fields || []}>
							{(field) => {
								return (
									<section class={style.field}>
										<span class={style.name}>{field.name}</span>
										<span>{field.value}</span>
									</section>
								);
							}}
						</For>
					</section>
					{props.embed.image && <img class={style.image} src={props.embed.image.url} />}
					{props.embed.thumbnail && <img class={style.thumbnail} src={props.embed.thumbnail.url} />}
					{props.embed.footer && (
						<footer>
							{props.embed.footer.icon_url && <img src={props.embed.footer.proxy_icon_url} />}
							{props.embed.footer.text}
							{props.embed.timestamp && <time>{dateFormater.format(new Date(props.embed.timestamp))}</time>}
						</footer>
					)}
				</article>
			}
		>
			<Match when={props.embed.url?.startsWith('https://twitter.com/')}>
				<TwitterEmbed embed={props.embed} />
			</Match>
		</Switch>
	);
}
