// import React from "react";
// import { SvgUri } from "react-native-svg";

// interface VerifiedBadgeProps {
//   isSubscribed?: boolean;
//   plan?: 'gold' | 'blue';
//   therapist?: boolean;
// }

// const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
//   isSubscribed = false,
//   therapist = false,
//   plan = 'blue',
// }) => {
//   if (!isSubscribed && !therapist) return null;

//   const badgeUrl =
//     plan === 'gold'
//       ? 'https://api.iconify.design/mdi/check-decagram.svg?color=%23d4af37'
//       : 'https://api.iconify.design/mdi/check-decagram.svg?color=%2300acee';

//   return (
//     <SvgUri
//       uri={badgeUrl}
//       width={18}
//       height={18}
//     />
//   );
// };

// export default VerifiedBadge;
