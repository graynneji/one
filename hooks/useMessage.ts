// import { CrudAdapter, ReadOptions } from "@/adapter/crudAdapter";
// import { CrudService } from "@/services/crudService";
// import { playSound } from "@/utils";
// import { Client } from "@/utils/client";
// import { useEffect, useState } from "react";

// interface UseRealTimeProps {
//   table: string;
//   filters: Record<any, any>;
//   column: string;
//   options?: ReadOptions;
//   pageSize?: number;
//   senderId: string;
//   receiverId: string;
// }

// const client = new Client();
// const crudAdapter = new CrudAdapter(client);
// const crudService = new CrudService(crudAdapter);

// export function useMessage({
//   table,
//   filters,
//   column,
//   options,
//   pageSize = 30,
//   senderId,
//   receiverId,
// }: UseRealTimeProps) {
//   const [messages, setMessages] = useState<any[]>([]);
//   const [hasMore, setHasMore] = useState(true);
//   useEffect(() => {
//     if (!senderId || !receiverId) return;
//     const fetchInitial = async () => {
//       // Step 1: get total count
//       const response = await crudService.getUserById(table, filters, column, {
//         ...options,
//         count: "exact",
//       });
//       const count = response?.count;
//       // Step 2: calculate range
//       const from = Math.max((count ?? 0) - pageSize, 0);
//       const to = (count ?? 0) - 1;

//       // Step 3: fetch latest N messages
//       const latestResp = await crudService.getUserById(table, filters, column, {
//         ...options,
//         order: { column: "created_at", ascending: true },
//         range: { from, to },
//       });

//       const latestResult = latestResp?.result ?? [];
//       setMessages(latestResult);
//       if ((count ?? 0) <= pageSize) setHasMore(false);
//     };

//     fetchInitial();

//     // Realtime subscription
//     const channel = client.supabase
//       .channel(`chat-${filters?.sender_id}-${filters?.receiver_id}`)
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table },
//         async (payload: { new: any }) => {
//           await playSound();
//           const newMessage = payload.new;
//           const isBetweenCurrentUsers =
//             (newMessage?.sender_id === senderId &&
//               newMessage?.reciever_id === receiverId) ||
//             (newMessage?.sender_id === receiverId &&
//               newMessage?.reciever_id === senderId);

//           if (isBetweenCurrentUsers) {
//             setMessages((prev) => [...prev, newMessage]);
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       client.supabase.removeChannel(channel);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [senderId, receiverId]);

//   // Fetch older messages before the oldest
//   const fetchOlder = async () => {
//     if (!messages.length) return;

//     const oldest = messages[0]?.created_at;
//     const olderResp = await crudService.getUserById(table, filters, column, {
//       ...options,
//       order: { column: "created_at", ascending: false },
//       lt: { column: "created_at", value: oldest },
//       range: { from: 0, to: pageSize - 1 },
//     });

//     const olderResult = olderResp?.result ?? [];
//     if (olderResult.length === 0) {
//       setHasMore(false);
//       return;
//     }

//     // Prepend older messages (use a non-mutating reversed copy)
//     setMessages((prev) => [...olderResult.slice().reverse(), ...prev]);
//   };

//   return { messages, fetchOlder, hasMore };
// }

import { CrudAdapter, ReadOptions } from "@/adapter/crudAdapter";
import { useAudio } from "@/context/AudioContext";
import { CrudService } from "@/services/crudService";
// import { notificationService } from "@/services/notificationService";
import { Client } from "@/utils/client";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

interface UseRealTimeProps {
  table: string;
  filters: Record<any, any>;
  column: string;
  options?: ReadOptions;
  pageSize?: number;
  senderId: string;
  receiverId: string;
}

const client = new Client();
const crudAdapter = new CrudAdapter(client);
const crudService = new CrudService(crudAdapter);

export function useMessage({
  table,
  filters,
  column,
  options,
  pageSize = 30,
  senderId,
  receiverId,
}: UseRealTimeProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const { playMessageSound } = useAudio();

  useEffect(() => {
    if (!senderId || !receiverId) return;

    const fetchInitial = async () => {
      // Step 1: get total count
      const response = await crudService.getUserById(table, filters, column, {
        ...options,
        count: "exact",
      });
      const count = response?.count;
      // Step 2: calculate range
      const from = Math.max((count ?? 0) - pageSize, 0);
      const to = (count ?? 0) - 1;

      // Step 3: fetch latest N messages
      const latestResp = await crudService.getUserById(table, filters, column, {
        ...options,
        order: { column: "created_at", ascending: true },
        range: { from, to },
      });

      const latestResult = latestResp?.result ?? [];
      setMessages(latestResult);
      if ((count ?? 0) <= pageSize) setHasMore(false);
    };

    fetchInitial();

    // Realtime subscription
    const channel = client.supabase
      .channel(`chat-${filters?.sender_id}-${filters?.receiver_id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table },
        async (payload: { new: any }) => {
          const newMessage = payload.new;
          const isBetweenCurrentUsers =
            (newMessage?.sender_id === senderId &&
              newMessage?.reciever_id === receiverId) ||
            (newMessage?.sender_id === receiverId &&
              newMessage?.reciever_id === senderId);

          if (isBetweenCurrentUsers) {
            // Only play sound if the message was sent BY the other user TO the current user
            const isReceivedMessage =
              newMessage?.sender_id === receiverId &&
              newMessage?.reciever_id === senderId;

            if (isReceivedMessage) {
              const appState = AppState.currentState;

              if (appState === "active") {
                // App is in foreground - just play sound
                await playMessageSound();
              } else {
                // App is in background - send notification
                // await notificationService.sendMessageNotification(
                //   newMessage.sender_name || "New Message",
                //   newMessage.content || "You have a new message",
                //   newMessage.id,
                //   newMessage.sender_id
                // );
              }
            }

            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      client.supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderId, receiverId]);

  // Fetch older messages before the oldest
  const fetchOlder = async () => {
    if (!messages.length) return;

    const oldest = messages[0]?.created_at;
    const olderResp = await crudService.getUserById(table, filters, column, {
      ...options,
      order: { column: "created_at", ascending: false },
      lt: { column: "created_at", value: oldest },
      range: { from: 0, to: pageSize - 1 },
    });

    const olderResult = olderResp?.result ?? [];
    if (olderResult.length === 0) {
      setHasMore(false);
      return;
    }

    // Prepend older messages (use a non-mutating reversed copy)
    setMessages((prev) => [...olderResult.slice().reverse(), ...prev]);
  };

  return { messages, fetchOlder, hasMore };
}
