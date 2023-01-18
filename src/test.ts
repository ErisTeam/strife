import { tauri } from "@tauri-apps/api";
import { listen, Event } from "@tauri-apps/api/event";

async function startMobileAuthListener(on_event: (event: Event<string>) => void) {
  console.log("start");
  await listen("mobileAuth", on_event);
}
export { startMobileAuthListener as startListener };
