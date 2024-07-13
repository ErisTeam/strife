import { For, Show, createResource, createSignal, onMount } from "solid-js";
import { useAppState } from "../../AppState";
import type {
  MessageReference,
  Message as MessageType,
} from "../../types/Messages";
import { type messageCreate, startGatewayListener } from "../../test";
import { useTabContext } from "../Tabs/TabUtils";
import { Message } from "./Message";
import style from "./css.module.css";
import { MessageSender } from "./MessageSender";
import { getMessages } from "@/API/Messages";
import {
  addAdditionalGuildDataToState,
  getListIdForChannel as computeChannelListHash,
  requestLazyGuilds,
} from "@/API/Guilds";
import { RecipientsList } from "./Recipients/RecipientsList";
import type { GuildListUpdate } from "@/types/Guild";
import { TypingStatus } from "./TypingStatus";
import { getChannelById } from "@/API/Channels";
import { Dev } from "../Dev/Dev";
import { invoke } from "@tauri-apps/api/core";

export type UploadFile =
  | string
  | {
      name: string;
      blob?: Blob;
      attachmentId?: string;
      attachmentUrl?: string;
    };
export function Chat() {
  const TabContext = useTabContext<{ channelId: string; guildId: string }>();
  const [typingUsers, setTypingUsers] = createSignal<any[]>([]);
  console.log("TabContext", TabContext);
  const AppState = useAppState();
  let chatref: HTMLOListElement;

  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const [replyingTo, setReplyingTo] = createSignal<MessageReference | null>(
    null
  );

  const hash = computeChannelListHash(
    getChannelById(TabContext.guildId, TabContext.channelId)
  );

  //TODO: make it possible to select multiple characters

  // function scrollToBottom() {
  // 	chatref.scrollTo(0, chatref.scrollHeight);
  // }
  const listener = startGatewayListener(AppState.userId());
  listener.on<messageCreate>("messageCreate", (event) => {
    console.log(
      TabContext.channelId,
      event.data.channel_id,
      event.data.content
    );
    if (event.data.channel_id === TabContext.channelId) {
      const newMessage = {
        id: event.data.id,
        channel_id: event.data.channel_id,
        content: event.data.content,
        timestamp: event.data.timestamp,
        author: event.data.author,
        embeds: event.data.embeds,
        attachments: event.data.attachments,
        mentions: event.data.mentions,
        mention_roles: event.data.mention_roles,
      } as unknown as MessageType;

      let isAtBottom = false;
      if (chatref.scrollTop + chatref.clientHeight >= chatref.scrollHeight) {
        isAtBottom = true;
      }
      console.log("newMessage", newMessage);
      setMessages(messages().concat(newMessage));

      // if (isAtBottom) {
      // 	scrollToBottom();
      // }
    }
  });
  listener.on<any>("typingStart", (event) => {
    if (event.data.channel_id !== TabContext.channelId) {
      return;
    }
    console.log("typingStart", event);
    if (
      typingUsers().findIndex(
        (user) => user.user.member.user.id === event.data.user_id
      ) !== -1
    ) {
      setTypingUsers((prev) => {
        const newUsers = prev.map((user) => {
          if (user.user.member.user.id === event.data.user_id) {
            return { ...user, left: 3 };
          }
          return user;
        });
        return newUsers;
      });
    } else {
      setTypingUsers((prev) => [...prev, { left: 3, user: event.data }]);
    }
    if (typingUsers().length > 1) {
      return;
    }
    console.log("typingUsers", typingUsers());
    const end = setInterval(() => {
      setTypingUsers((prev) => {
        const newUsers = prev.map((user) => {
          return { ...user, left: user.left - 1 };
        });
        return newUsers.filter((user) => user.left > 0);
      });
      if (typingUsers().length === 0) {
        clearInterval(end);
      }
    }, 1000);
  });
  listener.on<{ data: GuildListUpdate }>("guildMemberListUpdate", (event) => {
    console.log(event);

    addAdditionalGuildDataToState(event.data);
  });
  listener.on<any>("GuildMembersChunk", (event) => {
    console.log(event);
    // addAdditionalGuildDataToState(event.data);
  });

  const [messages, { mutate: setMessages }] = createResource(async () => {
    const messages = await getMessages(TabContext.channelId);
    return messages.reverse();
  });

  function updateMessage(updated: Partial<MessageType>) {
    setMessages((messages) => {
      const index = messages.findIndex((message) => message.id === updated.id);
      if (index === -1) return messages;
      messages[index] = { ...messages[index], ...updated };
      return messages;
    });
  }

  const [isDragging, setIsDragging] = createSignal(false);

  let mainref: HTMLDivElement;
  onMount(() => {
    // const channel = API.getChannelById(TabContext.guildId, TabContext.type); //TODO: Move VoiceChannels to their own component
    // if (channel && channel.type == CONSTANTS.GUILD_VOICE) {
    // 	console.log('voice channel');
    // 	setIsVoiceChannel(true);
    // }

    /* requestLazyGuilds(AppState.userId(), TabContext.guildId, {
		 	typing: true,
		 	threads: true,
		 	activities: true,
		 });*/

    if (!AppState.openedGuildsAdditionalData[TabContext.guildId]?.[hash]) {
      requestLazyGuilds(AppState.userId(), TabContext.guildId, [
        TabContext.channelId,
      ]);
    }

    console.warn(
      "test",
      AppState.openedGuildsAdditionalData["1085131579652845609"]
    );
    mainref.ondrop = (e) => {
      e.preventDefault();
      console.log("drop", e);
      const files = e.dataTransfer.files;
      console.log("files", files);
      for (let i = 0; i < files.length; i++) {
        const blob = files[i];
        const fileName = blob.name;
        setFiles((files) => [...files, { name: fileName, blob: blob }]);
      }
      setIsDragging(false);
    };
    mainref.ondragenter = (e) => {
      e.preventDefault();
      console.log("dragenter", e);

      setIsDragging(true);
    };
    mainref.ondragend = (e) => {
      e.preventDefault();
      console.log("dragend", e);
      setIsDragging(false);
    };

    mainref.ondragleave = (e: DragEvent | MouseEvent) => {
      e.preventDefault();
      if (!mainref.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    };

    // scrollToBottom();
    console.log(
      "recipients chat",
      AppState.openedGuildsAdditionalData[TabContext.guildId]?.recipients
    );
  });
  let lastAuthor = "";
  return (
    <main
      class={style.main}
      classList={{ [style.fileDrop]: isDragging() }}
      ref={mainref}
    >
      <Show when={replyingTo()}>
        <h1>{replyingTo().channel_id}</h1>
      </Show>

      <Dev>
        <button
          type="button"
          onclick={() => {
            console.log(
              messages()
                .map((msg) => msg.author.id)
                .filter((value, index, self) => self.indexOf(value) === index)
                .filter((id) => id !== AppState.userId())
            );
            invoke("get_members_info", {
              userId: AppState.userId(),
              guildId: TabContext.guildId,
              members: messages()
                .map((msg) => msg.author.id)
                .filter((value, index, self) => self.indexOf(value) === index)
                .filter((id) => id !== AppState.userId()),
            });
          }}
        >
          request users
        </button>
      </Dev>

      {/* <Show when={messages()}>
				<MessageListVirtualized messages={messages} updateMessage={updateMessage} setReplyingTo={setReplyingTo} />
			</Show> */}
      <ol class={style.TEST} ref={chatref}>
        <For each={messages()}>
          {(message) => {
            let msgRef: MessageType;
            if (message.message_reference) {
              msgRef = messages().find(
                (msg) => msg.id === message.message_reference.message_id
              );
            }
            const same = message.author.id === lastAuthor;
            if (!same) {
              lastAuthor = message.author.id;
            }
            return (
              <Message
                refMsg={msgRef}
                same={same}
                setReference={setReplyingTo}
                message={message}
                updateMessage={updateMessage}
              />
            );
          }}
        </For>
      </ol>

      <section class={style.senderWrapper}>
        <Show when={typingUsers().length > 0}>
          <TypingStatus typingUsers={typingUsers} />
        </Show>
        <MessageSender
          reference={replyingTo}
          setReference={setReplyingTo}
          files={files}
          setFiles={setFiles}
          channelId={TabContext.channelId}
          recipients={
            AppState.openedGuildsAdditionalData[TabContext.guildId]
              ?.recipients || []
          }
        />
      </section>

      <section class={style.recipientsList}>
        <RecipientsList guildId={TabContext.guildId} listId={hash} />
      </section>
    </main>
  );
}
