import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 3 } },
});

// import { QueryCache, QueryClient } from "@tanstack/react-query";
// import { Alert } from "react-native";

// export const queryClient = new QueryClient({
//   queryCache: new QueryCache({
//     onError: (error, query) => {
//       Alert.alert("Error", (error as Error).message || "Something went wrong", [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Retry",
//           onPress: () => {
//             query.fetch();
//           },
//         },
//       ]);
//     },
//   }),
//   defaultOptions: {
//     queries: {
//       retry: 0,
//       refetchOnWindowFocus: false,
//     },
//   },
// });
