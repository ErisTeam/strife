import { invoke, tauri } from "@tauri-apps/api";
import { listen, Event } from "@tauri-apps/api/event";

async function startMobileAuthListener(on_event: (event: Event<string>) => void) {
  console.log("start");
  await listen("mobileAuth", on_event);
}
async function getToken(user_id: string) {
  return (await invoke("get_token", { id: user_id })) as string | null;
}

export { startMobileAuthListener as startListener, getToken };
