import { tauri } from "@tauri-apps/api";
import { listen, Event } from "@tauri-apps/api/event";

async function startListener(on_event: (event: Event<string>) => void) {
  console.log("start");
  await listen("mobileAuth", on_event);
}
export { startListener };
