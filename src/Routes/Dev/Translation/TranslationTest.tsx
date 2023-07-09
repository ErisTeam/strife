import { For, JSX, Match, createMemo, createSignal, getOwner, runWithOwner } from 'solid-js';
import { dictionaries, useTrans } from '../../../Translation';

import style from './TranslationTest.module.css';
import inputs from '../../../Styles/Inputs.module.css';
import { useI18n } from '@solid-primitives/i18n';

export default () => {
	const [t, { locale, setLocale, getDictionary }] = useTrans();

	function a(objects: Object[]) {
		const divs: JSX.Element[] = [];
		Object.keys(objects).forEach((key: string) => {
			// @ts-ignore
			if (typeof objects[key] == 'object') {
				// @ts-ignore
				divs.push(<ol>{...a(objects[key])}</ol>);
			} else {
				divs.push(
					<li>
						{key}:&nbsp;
						{
							// @ts-ignore
							objects[key]('test')
						}
					</li>
				);
			}
		});
		return divs;
	}

	const localesList = createMemo(() => {
		let ret: string[] = [];
		Object.keys(dictionaries).forEach((key) => {
			ret.push(key);
		});
		return ret;
	});

	setLocale('en_US');

	const dictionary = getDictionary();
	return (
		<div>
			<div>
				<h2>Controls</h2>

				<select
					class={inputs.default}
					value={locale()}
					oninput={(e) => {
						console.log(e.currentTarget.value);
						// @ts-ignore
						setLocale(e.currentTarget.value);
						console.log(dictionary);
					}}
				>
					<For each={localesList()}>{(value) => <option value={value} label={value} />}</For>
				</select>
			</div>
			<ol>
				<For each={Object.keys(dictionary)} fallback={<h1>Not found</h1>}>
					{(keyy) => {
						// @ts-ignore
						let key = keyy; //Object.keys(getDictionary())[0];
						console.log(key, 'keyy:', keyy);
						// @ts-ignore
						if (typeof t[key] == 'object') {
							// @ts-ignore
							return <ul>{key}:&nbsp;{...a(t[key])}</ul>;
						} else {
							return (
								<li>
									{key}:&nbsp;
									{
										// @ts-ignore
										t[key]('test')
									}
								</li>
							);
						}
					}}
				</For>
			</ol>
		</div>
	);
};
