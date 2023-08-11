import { tabStoreType, useAppState } from '../../AppState';

import style from './Tabs.module.css';
import { Match, Switch } from 'solid-js';
import { useTrans } from '../../Translation';

import { Dynamic } from 'solid-js/web';
import { X } from 'lucide-solid';

import { useDragDropContext } from '@thisbeyond/solid-dnd';
import { Tab } from '../../types';

function TabShadow(props: { tab: Tab }) {
	const AppState = useAppState();
	const [t] = useTrans();
	if (!props.tab) return null;

	return (
		<li class={style.tab}>
			<button disabled={true}>
				<Switch fallback={'❓'}>
					<Match when={typeof props.tab.icon === 'function'}>
						<Dynamic component={props.tab.icon}></Dynamic>
					</Match>
					<Match when={typeof props.tab.icon === 'string' && props.tab.icon.startsWith('http')}>
						{/* TODO: Add translation string to alt text */}
						<img src={props.tab.icon as string} alt={t.guild.logoAlt({ guildName: props.tab.title })} />
					</Match>
					<Match when={typeof props.tab.icon === 'string'}>
						<i>{props.tab.icon as string}</i>
					</Match>
				</Switch>

				<span>{props.tab.title}</span>
			</button>
			<button disabled={true}>
				<X />
			</button>
		</li>
	);
}
export default TabShadow;
