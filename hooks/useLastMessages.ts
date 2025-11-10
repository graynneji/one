// import { Client } from "@/utils/client";
// import { useEffect, useState } from "react";

// interface LastMessage {
//   message: string;
//   created_at: string;
//   sender_id: string;
//   reciever_id: string;
// }
// // "message, created_at, sender_id, reciever_id"
// interface UseLastMessagesProps {
//   table: string;

//   senderId: string;
//   receiverIds: string[];
//   enabled?: boolean;
// }

// const client = new Client();

// export function useLastMessages({
//   table,
//   senderId,
//   receiverIds,
//   enabled = true,
// }: UseLastMessagesProps) {
//   const [lastMessages, setLastMessages] = useState<
//     Record<string, LastMessage | null>
//   >({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!enabled || !senderId || receiverIds.length === 0) {
//       setLoading(false);
//       return;
//     }

//     // ✅ Only include valid UUIDs (to prevent 22P02 errors)
//     const validReceiverIds = receiverIds.filter(
//       (id) => typeof id === "string" && /^[0-9a-fA-F-]{36}$/.test(id)
//     );

//     if (validReceiverIds.length === 0) {
//       console.warn("No valid UUID receiver IDs found");
//       setLoading(false);
//       return;
//     }

//     const fetchLastMessages = async () => {
//       try {
//         const { data, error } = await client.supabase
//           .from(table)
//           .select("message, created_at, sender_id, reciever_id")
//           .in("sender_id", [senderId, ...validReceiverIds])
//           .in("reciever_id", [senderId, ...validReceiverIds])
//           .order("created_at", { ascending: false });

//         if (error) throw error;

//         const latestMap: Record<string, LastMessage | null> = {};

//         validReceiverIds.forEach((rid) => {
//           const lastMsg = data.find(
//             (msg) =>
//               (msg.sender_id === senderId && msg.reciever_id === rid) ||
//               (msg.sender_id === rid && msg.reciever_id === senderId)
//           );
//           latestMap[rid] = lastMsg || null;
//         });

//         setLastMessages(latestMap);
//       } catch (err) {
//         console.error("Error fetching last messages:", err);
//         setLastMessages({});
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLastMessages();

//     // ✅ Real-time updates
//     const channel = client.supabase
//       .channel(`last-messages-${senderId}`)
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "messages" },
//         (payload: any) => {
//           const msg = payload.new;
//           const isBetweenSenderAndReceivers =
//             (msg.sender_id === senderId &&
//               validReceiverIds.includes(msg.reciever_id)) ||
//             (msg.reciever_id === senderId &&
//               validReceiverIds.includes(msg.sender_id));

//           if (isBetweenSenderAndReceivers) {
//             const receiverId =
//               msg.sender_id === senderId ? msg.reciever_id : msg.sender_id;

//             setLastMessages((prev) => ({
//               ...prev,
//               [receiverId]: msg,
//             }));
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       client.supabase.removeChannel(channel);
//     };
//   }, [senderId, JSON.stringify(receiverIds), enabled]);

//   return { lastMessages, loading };
// }
import { Client } from "@/utils/client";
import { useEffect, useState } from "react";

interface LastMessage {
  message: string;
  created_at: string;
  sender_id: string;
  reciever_id: string;
  is_read?: boolean;
}

interface UseLastMessagesProps {
  table: string;
  senderId: string;
  receiverIds: string[];
  enabled?: boolean;
}

const client = new Client();

export function useLastMessages({
  table,
  senderId,
  receiverIds,
  enabled = true,
}: UseLastMessagesProps) {
  const [lastMessages, setLastMessages] = useState<
    Record<string, LastMessage | null>
  >({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !senderId || receiverIds.length === 0) {
      setLoading(false);
      return;
    }

    // ✅ Only include valid UUIDs (to prevent 22P02 errors)
    const validReceiverIds = receiverIds.filter(
      (id) => typeof id === "string" && /^[0-9a-fA-F-]{36}$/.test(id)
    );

    if (validReceiverIds.length === 0) {
      console.warn("No valid UUID receiver IDs found");
      setLoading(false);
      return;
    }

    const fetchLastMessages = async () => {
      try {
        // Fetch all relevant messages between sender & receivers
        const { data, error } = await client.supabase
          .from(table)
          .select("message, created_at, sender_id, reciever_id, is_read")
          .in("sender_id", [senderId, ...validReceiverIds])
          .in("reciever_id", [senderId, ...validReceiverIds])
          .order("created_at", { ascending: false });

        if (error) throw error;

        const latestMap: Record<string, LastMessage | null> = {};
        const unreadMap: Record<string, number> = {};

        validReceiverIds.forEach((rid) => {
          // Get the last message involving sender ↔ receiver
          const lastMsg = data.find(
            (msg) =>
              (msg.sender_id === senderId && msg.reciever_id === rid) ||
              (msg.sender_id === rid && msg.reciever_id === senderId)
          );
          latestMap[rid] = lastMsg || null;

          // Count messages that are unread for the sender
          const unread = data.filter(
            (msg) =>
              msg.sender_id === rid && // received by sender
              msg.reciever_id === senderId &&
              msg.is_read === false
          ).length;

          unreadMap[rid] = unread;
        });

        setLastMessages(latestMap);
        setUnreadCounts(unreadMap);
      } catch (err) {
        console.error("Error fetching last messages:", err);
        setLastMessages({});
        setUnreadCounts({});
      } finally {
        setLoading(false);
      }
    };

    fetchLastMessages();

    // ✅ Realtime updates
    const channel = client.supabase
      .channel(`last-messages-${senderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: any) => {
          const msg = payload.new;
          const isBetweenSenderAndReceivers =
            (msg.sender_id === senderId &&
              validReceiverIds.includes(msg.reciever_id)) ||
            (msg.reciever_id === senderId &&
              validReceiverIds.includes(msg.sender_id));

          if (!isBetweenSenderAndReceivers) return;

          const receiverId =
            msg.sender_id === senderId ? msg.reciever_id : msg.sender_id;

          // Update last message and unread count dynamically
          setLastMessages((prev) => ({
            ...prev,
            [receiverId]: msg,
          }));

          if (msg.sender_id !== senderId && msg.is_read === false) {
            // new unread message from receiver
            setUnreadCounts((prev) => ({
              ...prev,
              [receiverId]: (prev[receiverId] || 0) + 1,
            }));
          } else if (msg.is_read === true) {
            // message just marked as read
            setUnreadCounts((prev) => ({
              ...prev,
              [receiverId]: Math.max((prev[receiverId] || 1) - 1, 0),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      client.supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderId, JSON.stringify(receiverIds), enabled]);

  return { lastMessages, unreadCounts, loading };
}
