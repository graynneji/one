// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Calendar from "expo-calendar";
// import { Platform } from "react-native";

// const MAPPING_KEY = "calendarMappings";

// /**
//  * Request calendar (and reminders for iOS) permissions
//  */
// async function requestPermissions() {
//   const { status: calendarStatus } =
//     await Calendar.requestCalendarPermissionsAsync();
//   let reminderStatus: "undetermined" | "denied" | "granted" = "granted";

//   if (Platform.OS === "ios") {
//     const res = await Calendar.requestRemindersPermissionsAsync();
//     reminderStatus = res.status;
//   }

//   return calendarStatus === "granted" && reminderStatus === "granted";
// }

// /**
//  * Get or create a writable calendar.
//  * Falls back to default system calendar if custom creation is not allowed.
//  */
// export async function getOrCreateCalendar() {
//   try {
//     const calendars = await Calendar.getCalendarsAsync(
//       Calendar.EntityTypes.EVENT
//     );

//     // See if we already have a custom calendar
//     let myCalendar = calendars.find((cal) => cal.title === "My App Events");
//     if (myCalendar) return myCalendar;

//     // Try to create a custom calendar
//     try {
//       const defaultSource =
//         Platform.OS === "ios"
//           ? (await Calendar.getDefaultCalendarAsync()).source
//           : {
//               isLocalAccount: true,
//               name: "Expo Calendar",
//               type: "local" as const, // 👈 required
//             };

//       const newCalendarId = await Calendar.createCalendarAsync({
//         title: "My App Events",
//         color: "blue",
//         entityType: Calendar.EntityTypes.EVENT,
//         source: defaultSource,
//         name: "My Internal Calendar",
//         ownerAccount: "personal",
//         accessLevel: Calendar.CalendarAccessLevel.OWNER,
//       });

//       return { id: newCalendarId };
//     } catch (createErr) {
//       // console.warn(
//       //   "Could not create custom calendar, using default:",
//       //   createErr
//       // );
//       const defaultCalendar = await Calendar.getDefaultCalendarAsync();
//       return defaultCalendar;
//       // return null
//     }

//     // Fallback → use default calendar
//   } catch (err) {
//     console.error("Calendar access failed:", err);
//     return null;
//   }
// }

// /**
//  * Helpers for mapping Supabase appointments to device calendar events
//  */
// export async function loadMappings(): Promise<Record<string, string>> {
//   const stored = await AsyncStorage.getItem(MAPPING_KEY);
//   return stored ? JSON.parse(stored) : {};
// }

// export async function saveMappings(mappings: Record<string, string>) {
//   await AsyncStorage.setItem(MAPPING_KEY, JSON.stringify(mappings));
// }

// export async function addEventToCalendar(appointment: any) {
//   console.log(appointment, "appointments");
//   const hasPermission = await requestPermissions();
//   if (!hasPermission) {
//     console.warn("Calendar permission not granted");
//     return;
//   }

//   const calendar = await getOrCreateCalendar();
//   if (!calendar || !calendar.id) {
//     console.warn("❌ No calendar found or created");
//     return;
//   }

//   let mappings = await loadMappings();

//   if (mappings[appointment.id]) {
//     // Already exists
//     return;
//   }

//   const startDate = new Date(appointment?.time);
//   const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hr

//   const eventId = await Calendar.createEventAsync(calendar.id, {
//     title: appointment.title,
//     startDate,
//     endDate,
//     notes: appointment.description,
//     alarms: [{ relativeOffset: -10 }], // 10 mins before
//   });

//   mappings[appointment.id] = eventId;
//   await saveMappings(mappings);
// }

// export async function updateEventInCalendar(appointment: any) {
//   const hasPermission = await requestPermissions();
//   if (!hasPermission) return;

//   const mappings = await loadMappings();
//   const eventId = mappings[appointment.id];
//   if (!eventId) return addEventToCalendar(appointment);

//   const startDate = new Date(appointment.time);
//   const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

//   await Calendar.updateEventAsync(eventId, {
//     title: appointment.title,
//     startDate,
//     endDate,
//     notes: appointment.description,
//   });
// }

// export async function deleteEventFromCalendar(appointmentId: string) {
//   const hasPermission = await requestPermissions();
//   if (!hasPermission) return;

//   let mappings = await loadMappings();
//   const eventId = mappings[appointmentId];
//   if (eventId) {
//     try {
//       await Calendar.deleteEventAsync(eventId);
//     } catch (err) {
//       console.log("Event already deleted or missing", err);
//     }
//     delete mappings[appointmentId];
//     await saveMappings(mappings);
//   }
// }

// export async function syncAppointments(events: any) {
//   for (let appt of events) {
//     await addEventToCalendar(appt);
//   }
// }
