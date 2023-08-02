import {
	Component,
	Context,
	For,
	Index,
	JSX,
	createContext,
	createMemo,
	onCleanup,
	onMount,
	useContext,
} from 'solid-js';
import { createStore, produce } from 'solid-js/store';

import style from '../ContextMenu/ContextMenu.module.css';
import { MenuProvider } from '../ContextMenu/ContextMenu';

type position = { x: number; y: number };

interface ContextMenuData<D = unknown> {
	component: Component[];
	visible?: boolean;

	position?: position;

	data?: D;
}

interface ContextData<D> {
	contextMenus: ContextMenuData[];
	addContextMenu: (contextMenu: ContextMenuData<D>) => number;
	removeContextMenu: (index: number) => void;
	setvisiblity: (index: number, state: boolean, position?: position) => void;
	hideAll: () => void;
}

const context = createContext<unknown>(null);

type ContextMenus<D> = ContextMenuData<D> & { ref?: HTMLOListElement; index: number };

export const ContextMenusProvider = <D,>(props: { children: JSX.Element[] | JSX.Element }) => {
	const [contextMenus, setContextMenus] = createStore<ContextMenus<D>[]>([]);

	function clickOutside(e: MouseEvent) {
		setContextMenus(
			(contextMenu) => contextMenu.visible && !contextMenu.ref?.contains(e.target as Node),
			produce((contextMenu) => (contextMenu.visible = false)),
		);
	}

	onMount(() => {
		document.addEventListener('mousedown', clickOutside);
	});

	onCleanup(() => {
		document.removeEventListener('mousedown', clickOutside);
	});

	const value = {
		contextMenus,
		hideAll() {
			setContextMenus(
				(contextMenu) => contextMenu.visible,
				produce((contextMenu) => (contextMenu.visible = false)),
			);
		},
		addContextMenu: (contextMenu: ContextMenuData<D>) => {
			if (contextMenu.position == undefined) {
				contextMenu.position = { x: 0, y: 0 };
			}
			const menu = Object.assign(contextMenu, { index: contextMenus.length });
			setContextMenus([...contextMenus, menu]);

			return contextMenus.length - 1;
		},
		removeContextMenu: (index: number) => {
			setContextMenus(produce((contextMenus) => contextMenus.splice(index, 1)));
		},
		setvisiblity: (index: number, state: boolean, position?: position) => {
			if (position) {
				setContextMenus(
					index,
					produce((contextMenus) => {
						contextMenus.position = position;
					}),
				);
			}
			setContextMenus(
				index,
				produce((contextMenus) => (contextMenus.visible = state)),
			);
		},
	};

	const visible = createMemo(() => contextMenus.filter((menu) => menu.visible));

	return (
		<context.Provider value={value}>
			<div class={style.contextMenuContainer}>
				<For each={visible()}>
					{(contextMenu) => (
						<ContextMenu
							updateRef={(ref: HTMLOListElement, index: number) => {
								console.log(ref, index);
								setContextMenus(
									index,
									produce((c) => (c.ref = ref)),
								);
							}}
							position={contextMenu.position}
							data={contextMenu.data}
							index={contextMenu.index}
						>
							<Index each={contextMenu.component}>
								{(component) => {
									const Component = component();
									return <Component></Component>;
								}}
							</Index>
						</ContextMenu>
					)}
				</For>
			</div>

			{props.children}
		</context.Provider>
	);
};

export function createContextMenu<D>(contextMenu: ContextMenuData<D>) {
	const c = useContext(context as Context<ContextData<D>>);
	if (!c) {
		throw new Error('not inside a ContextMenusProvider');
	}
	let index: number | undefined;

	onCleanup(() => {
		console.log('cleaning up', index);
		if (index != undefined) {
			c.removeContextMenu(index);
		}
	});

	function add() {
		if (index == undefined) {
			console.log('adding context menu');
			index = c.addContextMenu(contextMenu);
		}
	}

	const functions = {
		visible: createMemo(() => {
			if (index == undefined) return false;
			return c.contextMenus[index].visible;
		}),
		show: (position?: position) => {
			add();

			c.setvisiblity(index, true, position);
		},
		hide: () => {
			add();
			c.setvisiblity(index, false);
		},
		updateData: (data: D) => {
			add();
			c.contextMenus[index].data = data;
		},
		setVisibility: (state: boolean, position?: position) => {
			add();
			c.setvisiblity(index, state, position);
		},
		toggleVisibility: (position?: position) => {
			add();
			c.setvisiblity(index, !c.contextMenus[index].visible, position);
		},
	};

	function onContextMenu(element: HTMLElement) {
		const func = (e: MouseEvent) => {
			e.preventDefault();
			functions.toggleVisibility({ x: e.clientX, y: e.clientY });
		};
		element.addEventListener('contextmenu', func);
		onCleanup(() => {
			element.removeEventListener('contextmenu', func);
		});
	}

	return Object.defineProperties(onContextMenu, functions) as typeof onContextMenu & typeof functions;
}

interface ContextMenuProps<T> {
	position: position;
	children: JSX.Element;
	data: T;
	index: number;
	updateRef: (ref: HTMLOListElement, index: number) => void;
}
function ContextMenu<T>(props: ContextMenuProps<T>) {
	const c = useContext(context as Context<ContextData<T>>);

	let ref: HTMLOListElement;
	onMount(() => {
		props.updateRef(ref, props.index);
	});

	return (
		<ol ref={ref} style={{ left: `${props.position.x}px`, top: `${props.position.y}px` }} class={style.contexMenu}>
			<MenuProvider closeMenu={() => c.setvisiblity(props.index, false)} data={props.data}>
				{props.index}
				{props.children}
			</MenuProvider>
		</ol>
	);
}
