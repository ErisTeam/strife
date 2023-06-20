import { Outlet } from '@solidjs/router';
import { invoke } from '@tauri-apps/api';
import { Show, createResource } from 'solid-js';
import Loading from '../Loading/Loading';
import { AppState } from '../../types';
import R from '../../R';

interface Props {
	state: AppState;
	force?: boolean;
}
export default (props: Props) => {
	return <R state={props.state} force={props.force} component={Outlet} />;
};
