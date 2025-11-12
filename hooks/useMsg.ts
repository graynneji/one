import { getErrorMessage } from "@/utils";
import { Client } from "@/utils/client";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

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

/**
 * Hook 1: Get last message for each receiver
 */
export function useLastMessages({
  table,
  senderId,
  receiverIds,
  enabled = true,
}: UseLastMessagesProps) {
  const [lastMessages, setLastMessages] = useState<
    Record<string, LastMessage | null>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !senderId || receiverIds.length === 0) {
      setLoading(false);
      return;
    }

    // Only include valid UUIDs
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
        const { data, error } = await client.supabase
          .from(table)
          .select("message, created_at, sender_id, reciever_id, is_read")
          .in("sender_id", [senderId, ...validReceiverIds])
          .in("reciever_id", [senderId, ...validReceiverIds])
          .order("created_at", { ascending: false });

        if (error) throw error;

        const latestMap: Record<string, LastMessage | null> = {};

        validReceiverIds.forEach((rid) => {
          const lastMsg = data.find(
            (msg) =>
              (msg.sender_id === senderId && msg.reciever_id === rid) ||
              (msg.sender_id === rid && msg.reciever_id === senderId)
          );
          latestMap[rid] = lastMsg || null;
        });

        setLastMessages(latestMap);
      } catch (err) {
        setLastMessages({});
        Toast.show({
          type: "error",
          text1: "Error Occurred",
          text2: getErrorMessage(err),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLastMessages();

    // Real-time updates for last messages
    const channel = client.supabase
      .channel(`last-messages-${senderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: any) => {
          const msg = payload.new;

          if (!msg) return;

          const isBetweenSenderAndReceivers =
            (msg.sender_id === senderId &&
              validReceiverIds.includes(msg.reciever_id)) ||
            (msg.reciever_id === senderId &&
              validReceiverIds.includes(msg.sender_id));

          if (!isBetweenSenderAndReceivers) return;

          const receiverId =
            msg.sender_id === senderId ? msg.reciever_id : msg.sender_id;

          setLastMessages((prev) => ({
            ...prev,
            [receiverId]: msg,
          }));
        }
      )
      .subscribe();

    return () => {
      client.supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderId, JSON.stringify(receiverIds), enabled, table]);

  return { lastMessages, loading };
}

/**
 * Hook 2: Get unread count for individual conversations
 */
export function useIndividualUnreadCounts({
  table,
  senderId,
  receiverIds,
  enabled = true,
}: UseLastMessagesProps) {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !senderId || receiverIds.length === 0) {
      setLoading(false);
      return;
    }

    const validReceiverIds = receiverIds.filter(
      (id) => typeof id === "string" && /^[0-9a-fA-F-]{36}$/.test(id)
    );

    if (validReceiverIds.length === 0) {
      console.warn("No valid UUID receiver IDs found");
      setLoading(false);
      return;
    }

    const fetchUnreadCounts = async () => {
      try {
        const { data, error } = await client.supabase
          .from(table)
          .select("sender_id, reciever_id, is_read")
          .eq("reciever_id", senderId)
          .eq("is_read", false)
          .in("sender_id", validReceiverIds);

        if (error) throw error;

        const unreadMap: Record<string, number> = {};

        validReceiverIds.forEach((rid) => {
          const count = data.filter((msg) => msg.sender_id === rid).length;
          unreadMap[rid] = count;
        });

        setUnreadCounts(unreadMap);
      } catch (err) {
        setUnreadCounts({});
        Toast.show({
          type: "error",
          text1: "Error Occurred",
          text2: getErrorMessage(err),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCounts();

    // Real-time updates for unread counts
    const channel = client.supabase
      .channel(`individual-unread-${senderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: any) => {
          const msg = payload.new || payload.old;

          if (!msg) return;
          if (msg.reciever_id !== senderId) return;
          if (!validReceiverIds.includes(msg.sender_id)) return;

          const receiverId = msg.sender_id;

          if (payload.eventType === "INSERT" && msg.is_read === false) {
            setUnreadCounts((prev) => ({
              ...prev,
              [receiverId]: (prev[receiverId] || 0) + 1,
            }));
          }

          if (payload.eventType === "UPDATE" && msg.is_read === true) {
            setUnreadCounts((prev) => ({
              ...prev,
              [receiverId]: Math.max((prev[receiverId] || 1) - 1, 0),
            }));
          }

          if (
            payload.eventType === "DELETE" &&
            payload.old?.is_read === false
          ) {
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
  }, [senderId, JSON.stringify(receiverIds), enabled, table]);

  return { unreadCounts, loading };
}

/**
 * Hook 3: Get total unread message count for sender (all conversations)
 */
interface UseTotalUnreadCountProps {
  table: string;
  senderId: string;
  enabled?: boolean;
}

export function useTotalUnreadCount({
  table,
  senderId,
  enabled = true,
}: UseTotalUnreadCountProps) {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !senderId) {
      setLoading(false);
      return;
    }

    const fetchTotalUnreadCount = async () => {
      try {
        const { count, error } = await client.supabase
          .from(table)
          .select("*", { count: "exact", head: true })
          .eq("reciever_id", senderId)
          .eq("is_read", false);

        if (error) throw error;

        setTotalUnreadCount(count || 0);
      } catch (err) {
        setTotalUnreadCount(0);
        Toast.show({
          type: "error",
          text1: "Error Occurred",
          text2: getErrorMessage(err),
        });
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchTotalUnreadCount();

    // Real-time updates for total unread count
    const channel = client.supabase
      .channel(`total-unread-${senderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: any) => {
          console.log("🔔 Realtime event received:", payload.eventType);
          const msg = payload.new || payload.old;

          if (!msg) return;
          if (msg.reciever_id !== senderId) return;

          if (payload.eventType === "INSERT" && msg.is_read === false) {
            setTotalUnreadCount((prev) => prev + 1);
          }

          if (payload.eventType === "UPDATE") {
            const wasUnread = payload.old?.is_read === false;
            const isNowRead = msg.is_read === true;

            if (wasUnread && isNowRead) {
              setTotalUnreadCount((prev) => Math.max(prev - 1, 0));
            }
          }

          if (
            payload.eventType === "DELETE" &&
            payload.old?.is_read === false
          ) {
            setTotalUnreadCount((prev) => Math.max(prev - 1, 0));
          }
        }
      )
      .subscribe();

    return () => {
      client.supabase.removeChannel(channel);
    };
  }, [table, senderId, enabled]);

  return { totalUnreadCount, loading };
}
