// import {
//   addEventToCalendar,
//   deleteEventFromCalendar,
//   updateEventInCalendar,
// } from "@/utils/calendars";
// import { useEffect } from "react";

// import { Client } from "@/utils/client";

// const client = new Client();

// export function useAppointmentSync(userId: string) {
//   useEffect(() => {
//     if (!userId) return;

//     const channel = client.supabase.channel("appointments-realtime");

//     // INSERT
//     channel.on(
//       "postgres_changes",
//       {
//         event: "INSERT",
//         schema: "public",
//         table: "appointments",
//         filter: `client_id=eq.${userId}`,
//       },
//       async (payload: { new: any }) => {
//         await addEventToCalendar(payload.new);
//       }
//     );

//     // UPDATE
//     channel.on(
//       "postgres_changes",
//       {
//         event: "UPDATE",
//         schema: "public",
//         table: "appointments",
//         filter: `client_id=eq.${userId}`,
//       },
//       async (payload: { new: any }) => {
//         await updateEventInCalendar(payload.new);
//       }
//     );

//     // DELETE
//     channel.on(
//       "postgres_changes",
//       {
//         event: "DELETE",
//         schema: "public",
//         table: "appointments",
//         filter: `client_id=eq.${userId}`,
//       },
//       async (payload: { old: any }) => {
//         await deleteEventFromCalendar(payload.old.id);
//       }
//     );

//     channel.subscribe();

//     return () => {
//       client.supabase.removeChannel(channel);
//     };
//   }, [userId]);
// }
