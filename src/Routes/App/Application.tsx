import { Component, createSignal, Show, onMount } from 'solid-js';
import { useAppState } from '../../AppState';
import {
	useNavigate,
	Route,
	Router,
	Routes,
	hashIntegration,
} from '@solidjs/router';
import Tests from '../../Tests';
import style from './Application.module.css';

const Application = () => {
	const AppState: any = useAppState();

	return (
		<div class={style.app}>
			<h1>LELELLEE</h1>
		</div>
	);
};
export default Application;
