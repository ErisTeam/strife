import { createSignal, createContext, useContext } from "solid-js";
const [ticket, setTicket] = createSignal("");
const [token, setToken] = createSignal("");
const LoginState = createContext({ ticket, setTicket, token, setToken });
//todo remove this
export function LoginStateProvider(props: any) {
	return (
		<LoginState.Provider value={{ ticket, setTicket, token, setToken }}>
			{props.children}
		</LoginState.Provider>
	);
}

export function useLoginState() {
	return useContext(LoginState);
}
