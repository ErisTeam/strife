import { open } from '@tauri-apps/plugin-shell';
export function openInBrowser(element: HTMLAnchorElement) {
	element.addEventListener('click', async (e) => {
		e.preventDefault();
		await open(element.href);
	});
}
