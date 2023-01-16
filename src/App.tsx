import { createSignal } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/tauri";
import { emit, listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [name, setName] = createSignal("");

  const [login, setLogin] = createSignal("");
  const [password, setPassword] = createSignal("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name: name() }));
  }
  async function test() {
    setGreetMsg(await invoke("test", { login: login(), password: password() }));
  }

  async function event() {
    await listen("rs2js", (event) => {
      console.log("js: rs2js: " + event);
      let input = event.payload;
    });
  }

  return (
    <div class="container">
      <h1>Welcome to Tauri!</h1>

      <div class="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={logo} class="logo solid" alt="Solid logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and Solid logos to learn more.</p>

      <div class="row">
        <div>
          <input id="greet-input" onChange={(e) => setName(e.currentTarget.value)} placeholder="Enter a name..." />
          <button type="button" onClick={() => greet()}>
            Greet
          </button>
        </div>
      </div>

      <div>
        <input type="text" onChange={(e) => setLogin(e.currentTarget.value)} />
        <input type="password" onChange={(e) => setPassword(e.currentTarget.value)} />
        <button onclick={() => test()}>test</button>
      </div>

      <p>{greetMsg}</p>
    </div>
  );
}

export default App;
