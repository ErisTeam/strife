## Common
1. Write protobuf types

## Backend
1. Split the current code into crates:
    - `discord` - Types, discord specific logic (logging in), type conversion from discord types to ours
    - `types` - Our protobuf types
    - `src_tauri`
2. Rewrite `src_taruri` to use a backend trait that will have functions such as `fetch-channel-messages`, `connect-to-websocket` that will allow us to easily reimplement those functions if we'd like to switch to our backend (from discord to our blazingly fast ultra hyper pro mega alfa sigma self hosted server).

## Frontend
1. Reimplement for our new types.
