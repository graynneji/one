import { AVATAR_COLORS } from "@/constants/Avatar";
const messageSound = require("@/assets/sounds/740421__anthonyrox__message-notification-2.wav");

// 1. Configure notifications handler

export const isToday = (timestamp: string) => {
  if (!timestamp) return false;
  const today = new Date();
  const messageDate = new Date(timestamp);
  return (
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear()
  );
};

// export const formatTime = (timestamp: string) => {
//   if (!timestamp) return "";
//   const date = new Date(timestamp);
//   return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// };

export const formatTime = (
  date: string | Date,
  use24hr: boolean = false
): string => {
  const d = typeof date === "string" ? new Date(date) : date;

  return use24hr
    ? d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
};

export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, options);
};

export const formatDateTime = (
  date: string | Date,
  use24hr: boolean = false
): string => {
  return `${formatDate(date)} ${formatTime(date, use24hr)}`;
};

export const timeAgo = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  if (diffMins < 2880) return "yesterday";
  return formatDate(d);
};

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong";
}

// export const formatThreadTime = (timestamp: string): string => {
//   const now = new Date();
//   const postTime = new Date(timestamp);
//   const diffInHours = Math.floor(
//     (now.getTime() - postTime.getTime()) / (1000 * 60 * 60)
//   );

//   if (diffInHours < 1) return "Just now";
//   if (diffInHours < 24) return `${diffInHours}h ago`;

//   const diffInDays = Math.floor(diffInHours / 24);
//   if (diffInDays < 7) return `${diffInDays}d ago`;

//   const diffInWeeks = Math.floor(diffInDays / 7);
//   return `${diffInWeeks}w ago`;
// };

export const formatThreadTime = (timestamp: string): string => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInMs = now.getTime() - postTime.getTime();

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30); // Approximation
  const diffInYears = Math.floor(diffInDays / 365); // Approximation

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  return `${diffInYears}y ago`;
};

export function capitalizeFirstLetter(str: string | undefined): string {
  if (!str) return ""; // handle null, undefined, or empty string

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "0";

  const abs = Math.abs(num);

  if (abs < 1000) {
    return String(num); // e.g. 532
  } else if (abs < 1_000_000) {
    return (num / 1_000).toFixed(abs >= 10_000 ? 0 : 1) + "K"; // up to 999K
  } else if (abs < 1_000_000_000) {
    return (num / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1) + "M"; // up to 999M
  } else if (abs < 1_000_000_000_000) {
    return (num / 1_000_000_000).toFixed(abs >= 10_000_000_000 ? 0 : 1) + "B"; // up to 999B
  } else {
    return (
      (num / 1_000_000_000_000).toFixed(abs >= 10_000_000_000_000 ? 0 : 1) + "T"
    ); // Trillions
  }
}

export const getRandomAvatarColor = (): string => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};
