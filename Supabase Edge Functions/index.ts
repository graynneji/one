// Supabase Edge Function to send push notifications via Expo Push Notification Service
// Uncomment and deploy to Supabase Edge Functions if needed
// Go to supabase dashboard -> edge functions -> new function -> paste code below and deploy
// Dont forget to set the required environment variables in the Supabase project settings

// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// const EXPO_ACCESS_TOKEN = Deno.env.get("PUSH_NOTIFICATION")!;
// const SUPABASE_URL = Deno.env.get("URL")!;
// const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE")!;

// interface PushNotification {
//   to: string | string[];
//   title: string;
//   body: string;
//   data?: Record<string, any>;
//   sound?: string;
//   priority?: "default" | "normal" | "high";
//   channelId?: string;
// }

// interface ExpoPushMessage {
//   to: string;
//   sound: string;
//   title: string;
//   body: string;
//   data?: Record<string, any>;
//   priority?: "default" | "normal" | "high";
//   channelId?: string;
// }

// serve(async (req) => {
//   // Handle CORS
//   if (req.method === "OPTIONS") {
//     return new Response("ok", {
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "POST",
//         "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//       },
//     });
//   }

//   try {
//     const notification: PushNotification = await req.json();

//     // Validate input
//     if (!notification.to || !notification.title || !notification.body) {
//       return new Response(
//         JSON.stringify({ error: "Missing required fields: to, title, body" }),
//         {
//           status: 400,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     // Prepare messages for Expo Push API
//     const messages: ExpoPushMessage[] = [];
//     const tokens = Array.isArray(notification.to) ? notification.to : [notification.to];

//     for (const token of tokens) {
//       // Validate Expo push token format
//       if (!token.startsWith("ExponentPushToken[") && !token.startsWith("ExpoPushToken[")) {
//         console.warn(`Invalid push token format: ${token}`);
//         continue;
//       }

//       messages.push({
//         to: token,
//         sound: notification.sound || "default",
//         title: notification.title,
//         body: notification.body,
//         data: notification.data || {},
//         priority: notification.priority || "high",
//         channelId: notification.channelId,
//       });
//     }

//     if (messages.length === 0) {
//       return new Response(
//         JSON.stringify({ error: "No valid push tokens provided" }),
//         {
//           status: 400,
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//     }

//     // Send to Expo Push Notification Service
//     const response = await fetch("https://exp.host/--/api/v2/push/send", {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Accept-Encoding": "gzip, deflate",
//         "Content-Type": "application/json",
//         ...(EXPO_ACCESS_TOKEN && { Authorization: `Bearer ${EXPO_ACCESS_TOKEN}` }),
//       },
//       body: JSON.stringify(messages),
//     });

//     const result = await response.json();

//     // Log results to database
//     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

//     for (let i = 0; i < result.data.length; i++) {
//       const pushResult = result.data[i];
//       const message = messages[i];

//       // Extract user_id from data if available
//       const userId = message.data?.userId || message.data?.receiverId;

//       await supabase.from("notification_logs").insert({
//         user_id: userId,
//         notification_type: message.data?.type || "other",
//         title: message.title,
//         body: message.body,
//         data: message.data,
//         status: pushResult.status === "ok" ? "sent" : "failed",
//         error_message: pushResult.message || pushResult.details?.error,
//       });
//     }

//     return new Response(JSON.stringify(result), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "*",
//       },
//     });
//   } catch (error) {
//     console.error("Error sending push notification:", error);
//     return new Response(
//       JSON.stringify({ error: error.message }),
//       {
//         status: 500,
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//   }
// });
