import { onCleanup } from 'solid-js';
import { open } from '@tauri-apps/api/shell';
export default function openInBrowser(element: HTMLAnchorElement) {
	element.addEventListener('click', async (e) => {
		e.preventDefault();
		await open(element.href);
	});
}
