import { A } from '@tauri-apps/api/cli-373e13ed';
import {
	Accessor,
	Context,
	JSX,
	Setter,
	Show,
	createContext,
	createSignal,
	onCleanup,
	onMount,
	useContext,
} from 'solid-js';
import { Portal } from 'solid-js/web';
let MenuContext = createContext<any>(null);

interface MenuProviderData {
	closeMenu: () => void;
}

interface MenuProviderProps<T> {
	children: JSX.Element[] | JSX.Element;
	data: T;
	closeMenu: () => void;
}

export function MenuProvider<T>(props: MenuProviderProps<T>) {
	console.log(props);

	return (
		<MenuContext.Provider value={{ closeMenu: props.closeMenu, ...props.data }}>{props.children}</MenuContext.Provider>
	);
}
export function useMenu<T>() {
	return useContext(MenuContext as Context<T & MenuProviderData>);
}

interface ContexMenuProps<T> {
	children: JSX.Element[] | JSX.Element;
	data: T;
	openRef: HTMLElement;
}
export default function ContextMenu<T>(props: ContexMenuProps<T>) {
	const [show, setShow] = createSignal(false);
	const [pos, setPos] = createSignal({ x: 0, y: 0 });

	let ref: HTMLOListElement;

	const closeMenu = (ev: MouseEvent) => {
		if (ev.target == props.openRef) {
			document.removeEventListener('mousedown', closeMenu);
			return;
		}
		if (!ref.contains(ev.target as Node)) {
			console.log('close');
			c();
		}
	};

	function c() {
		setShow(false);
		document.removeEventListener('mousedown', closeMenu);
	}

	function openMenu(e: MouseEvent) {
		e.preventDefault();
		setShow(true);
		setPos({ x: e.clientX, y: e.clientY });

		document.addEventListener('mousedown', closeMenu);
	}
	onMount(() => {
		props.openRef.addEventListener('contextmenu', openMenu);
	});
	onCleanup(() => {
		props.openRef.removeEventListener('contextmenu', openMenu);
		document.removeEventListener('mousedown', closeMenu);
	});
	console.log(document.getElementById('ContextMenu'));

	return (
		<Show when={show()}>
			<Portal mount={document.getElementById('ContextMenu')}>
				<ol style={{ position: 'absolute', left: `${pos().x}px`, top: `${pos().y}px`, background: 'red' }} ref={ref}>
					<MenuProvider data={props.data} closeMenu={c}>
						{props.children}
					</MenuProvider>
				</ol>
			</Portal>
		</Show>
	);
}
