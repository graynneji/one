// import { Ionicons } from '@expo/vector-icons';
// import React from 'react';
// import {
//     StyleSheet,
//     Text,
//     View,
// } from 'react-native';

// interface StatItem {
//     icon: keyof typeof Ionicons.glyphMap;
//     label: string;
//     value: string;
//     color: string;
//     isOnline?: boolean;
// }

// interface CommunityStatsProps {
//     count: number;
// }

// const CommunityStats: React.FC<CommunityStatsProps> = ({ count }) => {
//     const stats: StatItem[] = [
//         {
//             icon: 'people',
//             label: 'Active Members',
//             value: '12,547',
//             color: '#3b82f6',
//         },
//         {
//             icon: 'chatbubbles',
//             label: 'Total Posts',
//             value: count?.toString() || '0',
//             color: '#10b981',
//         },
//         {
//             icon: 'radio-button-on',
//             label: 'Online Now',
//             value: '1,234',
//             color: '#059669',
//             isOnline: true,
//         },
//     ];

//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Community Stats</Text>
//             <View style={styles.statsGrid}>
//                 {stats.map((stat, index) => (
//                     <View key={index} style={styles.statCard}>
//                         <View style={styles.statHeader}>
//                             <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
//                                 <Ionicons name={stat.icon} size={20} color="white" />
//                             </View>
//                             <Text style={styles.statValue}>
//                                 {stat.value}
//                             </Text>
//                         </View>
//                         <Text style={[
//                             styles.statLabel,
//                             stat.isOnline && styles.statLabelOnline
//                         ]}>
//                             {stat.label}
//                         </Text>
//                         {stat.isOnline && (
//                             <View style={styles.onlineIndicator}>
//                                 <View style={styles.onlineDot} />
//                                 <Text style={styles.onlineText}>Active now</Text>
//                             </View>
//                         )}
//                     </View>
//                 ))}
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         backgroundColor: 'white',
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 16,
//         elevation: 1,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//     },
//     title: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#111827',
//         marginBottom: 12,
//     },
//     statsGrid: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },
//     statCard: {
//         flex: 1,
//         alignItems: 'center',
//         paddingHorizontal: 8,
//     },
//     statHeader: {
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     iconContainer: {
//         width: 32,
//         height: 32,
//         borderRadius: 16,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 6,
//     },
//     statValue: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#111827',
//     },
//     statLabel: {
//         fontSize: 12,
//         color: '#6b7280',
//         textAlign: 'center',
//         lineHeight: 16,
//     },
//     statLabelOnline: {
//         color: '#059669',
//         fontWeight: '500',
//     },
//     onlineIndicator: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 4,
//     },
//     onlineDot: {
//         width: 6,
//         height: 6,
//         borderRadius: 3,
//         backgroundColor: '#059669',
//         marginRight: 4,
//     },
//     onlineText: {
//         fontSize: 10,
//         color: '#059669',
//         fontWeight: '500',
//     },
// });

// export default CommunityStats;