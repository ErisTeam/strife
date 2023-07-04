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

interface MenuProviderProps<T> {
	children: JSX.Element[] | JSX.Element;
	data: T;
}

export function MenuProvider<T>(props: MenuProviderProps<T>) {
	console.log(props);

	return <MenuContext.Provider value={props.data}>{props.children}</MenuContext.Provider>;
}
export function useMenu<T>() {
	return useContext(MenuContext as Context<T>);
}

interface ContexMenuProps<T> {
	children: JSX.Element[] | JSX.Element;
	data: T;
	mainRef: HTMLDivElement;
}
export default function ContextMenu<T>(props: ContexMenuProps<T>) {
	const [show, setShow] = createSignal(false);
	const [pos, setPos] = createSignal({ x: 0, y: 0 });

	let ref: HTMLDivElement;

	function openMenu(e: MouseEvent) {
		e.preventDefault();
		setShow(true);
		setPos({ x: e.clientX, y: e.clientY });
		let added = true;
		const f = (ev: MouseEvent) => {
			if (added) {
				added = false;
				return;
			}
			console.log(ev.target);
			if (ev.target == e.target) {
				console.log('same');
				document.removeEventListener('click', f);
				return;
			}
			if (!ref.contains(ev.target as Node) && ev.target != e.target) {
				console.log('close');
				setShow(false);

				document.removeEventListener('click', f);
			}
		};
		document.addEventListener('click', f);
	}
	onMount(() => {
		console.log(props.mainRef);
		props.mainRef.addEventListener('click', openMenu);
	});
	onCleanup(() => {
		console.log('cleanup');
		props.mainRef.removeEventListener('click', openMenu);
	});

	return (
		<Portal mount={document.getElementById('ContexMenu')}>
			<Show when={show()}>
				<div style={{ position: 'absolute', left: `${pos().x}px`, top: `${pos().y}px`, background: 'red' }} ref={ref}>
					<MenuProvider data={props.data}>{props.children}</MenuProvider>
				</div>
			</Show>
		</Portal>
	);
}
