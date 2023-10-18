import { Download } from 'lucide-solid';
import { JSXElement, Show, createSignal, onMount } from 'solid-js';
import style from './css.module.css';

type AttachmentsProps = {
	attachments: any[];
};
export default function Attachments(props: AttachmentsProps) {
	//! REPLACE TYPE AFTER IT GETS ADDED TO PROTOBUF
	const [formattedImages, setFormattedImages] = createSignal<JSXElement[]>([]);
	const [formattedVideos, setFormattedVideos] = createSignal<JSXElement[]>([]);
	const [formattedAudios, setFormattedAudios] = createSignal<JSXElement[]>([]);
	onMount(() => {
		formatAttachments(props.attachments);
	});
	function formatAttachments(ats: any[]) {
		const images = [];
		const videos = [];
		const audios = [];
		if (ats.length == 0) return;
		for (let i = 0; i < ats.length; i++) {
			if (ats[i].content_type.includes('image')) {
				images.push(
					<li class={style.image}>
						<a class={style.download} href={ats[i].url} target="_blank">
							<Download />
						</a>
						<img src={ats[i].url} />
					</li>,
				);
			}
			if (ats[i].content_type.includes('video')) {
				videos.push(
					<li class={style.video}>
						<a class={style.download} href={ats[i].url} target="_blank">
							<Download />
						</a>
						<video controls src={ats[i].url} />
					</li>,
				);
			}
			if (ats[i].content_type.includes('audio')) {
				audios.push(
					<li>
						<a class={style.download} href={ats[i].url} target="_blank">
							<Download />
						</a>
						<span>{ats[i].filename}</span>
						<audio controls src={ats[i].url} />
					</li>,
				);
			}
		}
		setFormattedImages(images);
		setFormattedVideos(videos);
		setFormattedAudios(audios);
	}
	return (
		<>
			<Show when={formattedImages().length > 0 || formattedVideos().length > 0}>
				<ul class={style.attachments}>
					{formattedVideos()}
					{formattedImages()}
				</ul>
			</Show>
			<Show when={formattedAudios().length > 0}>
				<ul class={style.audios}>{formattedAudios()}</ul>
			</Show>
		</>
	);
}