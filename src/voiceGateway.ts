import { invoke } from '@tauri-apps/api';
import { gatewayOneTimeListener } from './test';

interface GatewayPacket {
	op: number;
	d: any;
}

interface Identify extends GatewayPacket {
	op: 0;
	d: {
		server_id: string;
		user_id: string;
		session_id: string;
		token: string;
	};
}
interface Ready extends GatewayPacket {
	op: 2;
	d: {
		experiments: string[];
		ip: string;
		modes: string[];
		port: number;
		ssrc: number;
		streams: Stream[];
	};
}

interface Stream {
	type: 'video' | string;
	ssrc: number;
	rtx_ssrc: number;
	rid: string;
	quality: number;
	active: boolean;
}

export function startWebRtc() {
	const pc = new RTCPeerConnection();

	// pc.currentLocalDescription
}
