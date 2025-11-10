// import React from 'react';
// import {
//   Dimensions,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import Toast from 'react-native-toast-message';

// const { width } = Dimensions.get('window');

// // Beautiful custom toast configurations
// const toastConfig = {
//   // Success toast with glassmorphism effect
//   success: (props: { text1?: string, text2?: string }) => (
//     <View style={[styles.toastContainer, styles.successContainer]}>
//       <View style={styles.iconContainer}>
//         <View style={[styles.iconCircle, styles.successIcon]}>
//           <Text style={styles.iconText}>✓</Text>
//         </View>
//       </View>
//       <View style={styles.textContainer}>
//         <Text style={styles.title} numberOfLines={1}>
//           {props.text1}
//         </Text>
//         {props.text2 && (
//           <Text style={styles.subtitle} numberOfLines={2}>
//             {props.text2}
//           </Text>
//         )}
//       </View>
//       <TouchableOpacity onPress={() => Toast.hide()} style={styles.closeButton}>
//         <Text style={styles.closeText}>✕</Text>
//       </TouchableOpacity>
//     </View>
//   ),

//   // Error toast with vibrant styling
//   error: (props: { text1?: string, text2?: string }) => (
//     <View style={[styles.toastContainer, styles.errorContainer]}>
//       <View style={styles.iconContainer}>
//         <View style={[styles.iconCircle, styles.errorIcon]}>
//           <Text style={styles.iconText}>✕</Text>
//         </View>
//       </View>
//       <View style={styles.textContainer}>
//         <Text style={styles.title} numberOfLines={1}>
//           {props.text1}
//         </Text>
//         {props.text2 && (
//           <Text style={styles.subtitle} numberOfLines={2}>
//             {props.text2}
//           </Text>
//         )}
//       </View>
//       <TouchableOpacity onPress={() => Toast.hide()} style={styles.closeButton}>
//         <Text style={styles.closeText}>✕</Text>
//       </TouchableOpacity>
//     </View>
//   ),

//   // Warning toast with amber gradient
//   warning: (props: { text1?: string, text2?: string }) => (
//     <View style={[styles.toastContainer, styles.warningContainer]}>
//       <View style={styles.iconContainer}>
//         <View style={[styles.iconCircle, styles.warningIcon]}>
//           <Text style={styles.iconText}>⚠</Text>
//         </View>
//       </View>
//       <View style={styles.textContainer}>
//         <Text style={styles.title} numberOfLines={1}>
//           {props.text1}
//         </Text>
//         {props.text2 && (
//           <Text style={styles.subtitle} numberOfLines={2}>
//             {props.text2}
//           </Text>
//         )}
//       </View>
//       <TouchableOpacity onPress={() => Toast.hide()} style={styles.closeButton}>
//         <Text style={styles.closeText}>✕</Text>
//       </TouchableOpacity>
//     </View>
//   ),

//   // Info toast with modern blue design
//   info: (props: { text1?: string, text2?: string }) => (
//     <View style={[styles.toastContainer, styles.infoContainer]}>
//       <View style={styles.iconContainer}>
//         {/* <View style={[styles.iconCircle, styles.infoIcon]}> */}
//         <Text style={styles.iconText}>ℹ</Text>
//         {/* </View> */}
//       </View>
//       <View style={styles.textContainer}>
//         <Text style={styles.title} numberOfLines={1}>
//           {props.text1}
//         </Text>
//         {props.text2 && (
//           <Text style={styles.subtitle} numberOfLines={2}>
//             {props.text2}
//           </Text>
//         )}
//       </View>
//       <TouchableOpacity onPress={() => Toast.hide()} style={styles.closeButton}>
//         <Text style={styles.closeText}>✕</Text>
//       </TouchableOpacity>
//     </View>
//   ),

//   // Custom notification style (for special messages)
//   notification: (props: { text1?: string, text2?: string }) => (
//     <View style={[styles.toastContainer, styles.notificationContainer]}>
//       <View style={styles.notificationContent}>
//         <View style={styles.notificationHeader}>
//           <Text style={styles.notificationTitle} numberOfLines={1}>
//             {props.text1}
//           </Text>
//           <TouchableOpacity onPress={() => Toast.hide()}>
//             <Text style={styles.notificationClose}>✕</Text>
//           </TouchableOpacity>
//         </View>
//         {props.text2 && (
//           <Text style={styles.notificationSubtitle} numberOfLines={3}>
//             {props.text2}
//           </Text>
//         )}
//         <View style={styles.notificationFooter}>
//           <View style={styles.notificationDot} />
//           <Text style={styles.notificationTime}>Just now</Text>
//         </View>
//       </View>
//     </View>
//   ),

//   // Minimalist toast
//   minimal: (props: { text1?: string, text2?: string }) => (
//     <View style={styles.minimalContainer}>
//       <Text style={styles.minimalText}>
//         {props.text1}
//       </Text>
//     </View>
//   ),
// };

// // Example usage component
// const ToastScreen = () => {
//   const showSuccessToast = () => {
//     Toast.show({
//       type: 'success',
//       text1: 'Success!',
//       text2: 'Your action was completed successfully 👋',
//       visibilityTime: 500,
//       autoHide: true,
//       topOffset: 60,
//     });
//   };

//   const showErrorToast = () => {
//     Toast.show({
//       type: 'error',
//       text1: 'Error Occurred',
//       text2: 'Something went wrong. Please try again.',
//       visibilityTime: 4000,
//       autoHide: true,
//       topOffset: 60,
//     });
//   };

//   const showWarningToast = () => {
//     Toast.show({
//       type: 'warning',
//       text1: 'Warning!',
//       text2: 'Please check your internet connection.',
//       visibilityTime: 4000,
//       autoHide: true,
//       topOffset: 60,
//     });
//   };

//   const showInfoToast = () => {
//     Toast.show({
//       type: 'info',
//       text1: 'New Update Available',
//       text2: 'Version 2.1.0 is ready to download.',
//       visibilityTime: 5000,
//       autoHide: false,
//       topOffset: 60,
//     });
//   };

//   const showNotificationToast = () => {
//     Toast.show({
//       type: 'notification',
//       text1: 'New Message',
//       text2: 'You have received a new message from John Doe about the project update.',
//       visibilityTime: 6000,
//       autoHide: true,
//       topOffset: 60,
//     });
//   };

//   const showMinimalToast = () => {
//     Toast.show({
//       type: 'minimal',
//       text1: 'Saved to drafts',
//       visibilityTime: 2000,
//       autoHide: true,
//       position: 'bottom',
//       bottomOffset: 100,
//     });
//   };

//   return (
//     <View style={styles.exampleContainer}>
//       <Text style={styles.screenTitle}>Beautiful Toast Messages</Text>

//       <TouchableOpacity style={[styles.button, styles.successButton]} onPress={showSuccessToast}>
//         <Text style={styles.buttonText}>🎉 Success Toast</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={showErrorToast}>
//         <Text style={styles.buttonText}>❌ Error Toast</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={showWarningToast}>
//         <Text style={styles.buttonText}>⚠️ Warning Toast</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={showInfoToast}>
//         <Text style={styles.buttonText}>ℹ️ Info Toast</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={[styles.button, styles.notificationButton]} onPress={showNotificationToast}>
//         <Text style={styles.buttonText}>🔔 Notification Style</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={[styles.button, styles.minimalButton]} onPress={showMinimalToast}>
//         <Text style={styles.buttonText}>✨ Minimal Toast</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // Toast Container Styles
//   toastContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     marginHorizontal: 20,
//     borderRadius: 16,
//     backgroundColor: 'white',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     elevation: 8,
//     borderLeftWidth: 5,
//   },

//   // Type-specific containers
//   successContainer: {
//     borderLeftColor: '#10B981',
//     backgroundColor: '#F0FDF4',
//   },
//   errorContainer: {
//     borderLeftColor: '#EF4444',
//     backgroundColor: '#FEF2F2',
//   },
//   warningContainer: {
//     borderLeftColor: '#F59E0B',
//     backgroundColor: '#FFFBEB',
//   },
//   infoContainer: {
//     borderLeftColor: '#3B82F6',
//     backgroundColor: '#EFF6FF',
//   },

//   // Icon styles
//   iconContainer: {
//     marginRight: 12,
//     marginTop: 2,
//   },
//   iconCircle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   successIcon: {
//     backgroundColor: '#10B981',
//   },
//   errorIcon: {
//     backgroundColor: '#EF4444',
//   },
//   warningIcon: {
//     backgroundColor: '#F59E0B',
//   },
//   infoIcon: {
//     backgroundColor: '#3B82F6',
//   },
//   iconText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },

//   // Text styles
//   textContainer: {
//     flex: 1,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 2,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     lineHeight: 20,
//   },

//   // Close button
//   closeButton: {
//     padding: 4,
//     marginLeft: 8,
//   },
//   closeText: {
//     color: '#9CA3AF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },

//   // Notification style
//   notificationContainer: {
//     backgroundColor: '#1F2937',
//     borderLeftColor: '#6366F1',
//     marginHorizontal: 16,
//     borderRadius: 12,
//   },
//   notificationContent: {
//     flex: 1,
//   },
//   notificationHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   notificationTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: 'white',
//     flex: 1,
//   },
//   notificationClose: {
//     color: '#9CA3AF',
//     fontSize: 16,
//     marginLeft: 8,
//   },
//   notificationSubtitle: {
//     fontSize: 14,
//     color: '#D1D5DB',
//     lineHeight: 20,
//     marginBottom: 8,
//   },
//   notificationFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   notificationDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#10B981',
//     marginRight: 6,
//   },
//   notificationTime: {
//     fontSize: 12,
//     color: '#9CA3AF',
//   },

//   // Minimal style
//   minimalContainer: {
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//     marginHorizontal: 60,
//     alignItems: 'center',
//   },
//   minimalText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '500',
//   },

//   // Example screen styles
//   exampleContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F8FAFC',
//     padding: 20,
//   },
//   screenTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     marginBottom: 40,
//     textAlign: 'center',
//   },
//   button: {
//     paddingVertical: 14,
//     paddingHorizontal: 28,
//     borderRadius: 12,
//     marginVertical: 6,
//     minWidth: width * 0.7,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   successButton: {
//     backgroundColor: '#10B981',
//   },
//   errorButton: {
//     backgroundColor: '#EF4444',
//   },
//   warningButton: {
//     backgroundColor: '#F59E0B',
//   },
//   infoButton: {
//     backgroundColor: '#3B82F6',
//   },
//   notificationButton: {
//     backgroundColor: '#6366F1',
//   },
//   minimalButton: {
//     backgroundColor: '#374151',
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default ToastScreen;
// export { toastConfig };

import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

// Beautiful custom toast configurations
const toastConfig = {
  // Success toast with glassmorphism effect
  success: (props: any) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => Toast.hide()}
      style={[styles.toastContainer, styles.successContainer]}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, styles.successIcon]}>
          <Text style={styles.iconText}>✓</Text>
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {props.text2}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={() => Toast.hide()} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ),

  // Error toast with vibrant styling
  error: (props: any) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => Toast.hide()}
      style={[styles.toastContainer, styles.errorContainer]}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, styles.errorIcon]}>
          <Text style={styles.iconText}>✕</Text>
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {props.text2}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={() => Toast.hide()} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ),

  // Warning toast with amber gradient
  warning: (props: any) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => Toast.hide()}
      style={[styles.toastContainer, styles.warningContainer]}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, styles.warningIcon]}>
          <Text style={styles.iconText}>⚠</Text>
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {props.text2}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={() => Toast.hide()} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ),

  // Info toast with modern blue design
  info: (props: any) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => Toast.hide()}
      style={[styles.toastContainer, styles.infoContainer]}
    >
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, styles.infoIcon]}>
          <Text style={styles.iconText}>ℹ</Text>
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {props.text2}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={() => Toast.hide()} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ),

  // Custom notification style (for special messages)
  notification: (props: any) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => Toast.hide()}
      style={[styles.toastContainer, styles.notificationContainer]}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {props.text1}
          </Text>
          <TouchableOpacity onPress={() => Toast.hide()}>
            <Text style={styles.notificationClose}>✕</Text>
          </TouchableOpacity>
        </View>
        {props.text2 && (
          <Text style={styles.notificationSubtitle} numberOfLines={3}>
            {props.text2}
          </Text>
        )}
        <View style={styles.notificationFooter}>
          <View style={styles.notificationDot} />
          <Text style={styles.notificationTime}>Just now</Text>
        </View>
      </View>
    </TouchableOpacity>
  ),

  // Minimalist toast
  minimal: (props: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => Toast.hide()}
      style={styles.minimalContainer}
    >
      <Text style={styles.minimalText}>
        {props.text1}
      </Text>
    </TouchableOpacity>
  ),
};

const styles = StyleSheet.create({
  // Toast Container Styles
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 5,
  },

  // Type-specific containers
  successContainer: {
    borderLeftColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  errorContainer: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  warningContainer: {
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  infoContainer: {
    borderLeftColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },

  // Icon styles
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    backgroundColor: '#10B981',
  },
  errorIcon: {
    backgroundColor: '#EF4444',
  },
  warningIcon: {
    backgroundColor: '#F59E0B',
  },
  infoIcon: {
    backgroundColor: '#3B82F6',
  },
  iconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Text styles
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Close button
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Notification style
  notificationContainer: {
    backgroundColor: '#1F2937',
    borderLeftColor: '#6366F1',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  notificationClose: {
    color: '#9CA3AF',
    fontSize: 16,
    marginLeft: 8,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Minimal style
  minimalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 60,
    alignItems: 'center',
  },
  minimalText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export { toastConfig };
