/** @format */

import { createSignal, onMount } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/tauri";
import { emit, listen } from "@tauri-apps/api/event";
import "./App.css";

import qrcode from "qrcode";
import { startListener } from "./test";

function App() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [name, setName] = createSignal("");

  const [login, setLogin] = createSignal("");
  const [password, setPassword] = createSignal("");

  const [qr, setQr] = createSignal("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name: name() }));
  }
  async function test() {
    setGreetMsg(await invoke("test", { login: login(), password: password() }));
  }

  onMount(async () => {
    startListener((event) => {
      console.log("js: rs2js: " + event);
      let input = JSON.parse(event.payload) as { type: string };
      console.log(input);
      if (input.type == "qrcode") {
        let i = input as { type: string; qrcode: string };

        qrcode.toDataURL(i.qrcode, (err: any, url: any) => {
          setQr(url);
        });
      } else if (input.type == "ticketData") {
        let i = input as { type: string; userId: string; discriminator: string; username: string; avatarHash: string };
        setGreetMsg(`userId: ${i.userId}, discriminator: ${i.discriminator}, username: ${i.username}, avatarHash: ${i.avatarHash}`);
        setQr(`https://cdn.discordapp.com/avatars/${i.userId}/${i.avatarHash}.webp?size=128`);
      }
    });
  });

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
        <img src={qr()} />
      </div>

      <p>{greetMsg}</p>
    </div>
  );
}

export default App;
