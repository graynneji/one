import { Client } from "@/utils/client";
import { useEffect, useState } from "react";

interface UseUnreadCountProps {
  table: string;
  senderId: string; // The current user
  enabled?: boolean;
}

const client = new Client();

export function useAllUnreadCount({
  table,
  senderId,
  enabled = true,
}: UseUnreadCountProps) {
  const [unreadAllCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !senderId) {
      setLoading(false);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        // ✅ Count all messages where user is the receiver and message is unread
        const { count, error } = await client.supabase
          .from(table)
          .select("*", { count: "exact", head: true })
          .eq("reciever_id", senderId)
          .eq("is_read", false);

        if (error) throw error;

        setUnreadCount(count || 0);
      } catch (err) {
        console.error("Error fetching unread count:", err);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // ✅ Real-time updates (listen for new or updated messages)
    const channel = client.supabase
      .channel(`unread-count-${senderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        async (payload: any) => {
          const msg = payload.new;

          // only react to messages involving this user
          if (!msg) return;
          if (msg.reciever_id !== senderId) return;

          // If a new unread message is received
          if (payload.eventType === "INSERT" && msg.is_read === false) {
            setUnreadCount((prev) => prev + 1);
          }

          // If a message becomes read
          if (payload.eventType === "UPDATE" && msg.is_read === true) {
            setUnreadCount((prev) => Math.max(prev - 1, 0));
          }

          // If a message is deleted (optional safeguard)
          if (payload.eventType === "DELETE" && msg.is_read === false) {
            setUnreadCount((prev) => Math.max(prev - 1, 0));
          }
        }
      )
      .subscribe();

    return () => {
      client.supabase.removeChannel(channel);
    };
  }, [table, senderId, enabled]);

  return { unreadAllCount, loading };
}
