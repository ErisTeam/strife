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

const Application = () => {
	const AppState: any = useAppState();

	return (
		<div>
			<h1>LELELLEE</h1>
		</div>
	);
};
export default Application;
