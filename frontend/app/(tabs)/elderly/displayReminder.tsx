// // import React, { useEffect, useState, useCallback } from 'react';
// // import { 
// //   View, 
// //   Text, 
// //   FlatList, 
// //   StyleSheet, 
// //   TouchableOpacity, 
// //   Alert,
// //   RefreshControl,
// //   ActivityIndicator,
// //   SafeAreaView
// // } from 'react-native';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import * as Notifications from 'expo-notifications';

// // // Configure notification behavior
// // Notifications.setNotificationHandler({
// //   handleNotification: async () => ({
// //     shouldShowAlert: true,
// //     shouldPlaySound: true,
// //     shouldSetBadge: false,
// //   }),
// // });

// // interface Reminder {
// //   _id: string;
// //   title: string;
// //   description: string;
// //   reminderType: string;
// //   scheduledDateTime: string;
// //   isRecurring: boolean;
// //   recurrencePattern?: {
// //     type: string;
// //     interval: number;
// //     daysOfWeek?: number[];
// //     endDate: string;
// //   };
// //   alarmSettings: {
// //     soundType: string;
// //     volume: number;
// //     vibrate: boolean;
// //     snoozeEnabled: boolean;
// //     snoozeDuration: number;
// //   };
// //   priority: string;
// //   requiresConfirmation: boolean;
// //   isActive: boolean;
// // }

// // export default function ReminderListScreen() {
// //   const [reminders, setReminders] = useState<Reminder[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);

// //   const fetchReminders = useCallback(async () => {
// //     try {
// //       const token = await AsyncStorage.getItem('accessToken');
// //       const userId = await AsyncStorage.getItem('userId');
      
// //       if (!token || !userId) {
// //         Alert.alert('Authentication Error', 'Please login again');
// //         return;
// //       }

// //       const response = await fetch(`https://elderlybackend.onrender.com/api/reminders`, {
// //         method: 'GET',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }

// //       const data = await response.json();
// //       setReminders(data.reminders || []);
// //     } catch (error: any) {
// //       console.error('Error fetching reminders:', error);
// //       Alert.alert('Error', 'Failed to fetch reminders');
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchReminders();
// //     // Request notification permissions
// //     requestNotificationPermissions();
// //   }, [fetchReminders]);

// //   const requestNotificationPermissions = async () => {
// //     const { status } = await Notifications.requestPermissionsAsync();
// //     if (status !== 'granted') {
// //       Alert.alert('Permission Required', 'Please enable notifications to receive reminders');
// //     }
// //   };

// //   const onRefresh = useCallback(() => {
// //     setRefreshing(true);
// //     fetchReminders();
// //   }, [fetchReminders]);

// //   const scheduleNotification = async (reminder: Reminder) => {
// //     try {
// //       const triggerDate = new Date(reminder.scheduledDateTime);
      
// //       if (triggerDate <= new Date()) {
// //         Alert.alert('Invalid Date', 'Cannot schedule notification for past date');
// //         return;
// //       }

// //       const notificationId = await Notifications.scheduleNotificationAsync({
// //         content: {
// //           title: `📋 ${reminder.title}`,
// //           body: reminder.description || `${reminder.reminderType} reminder`,
// //           data: { 
// //             reminderId: reminder._id,
// //             requiresConfirmation: reminder.requiresConfirmation
// //           },
// //           sound: reminder.alarmSettings.soundType === 'loud' ? 'default' : 'defaultCritical',
// //         },
// //         trigger: triggerDate,
// //       });

// //       Alert.alert('Success', `Notification scheduled for ${triggerDate.toLocaleString()}`);
// //       console.log('Scheduled notification:', notificationId);
// //     } catch (error) {
// //       console.error('Error scheduling notification:', error);
// //       Alert.alert('Error', 'Failed to schedule notification');
// //     }
// //   };

// //   const deleteReminder = async (reminderId: string) => {
// //     Alert.alert(
// //       'Delete Reminder',
// //       'Are you sure you want to delete this reminder?',
// //       [
// //         { text: 'Cancel', style: 'cancel' },
// //         {
// //           text: 'Delete',
// //           style: 'destructive',
// //           onPress: async () => {
// //             try {
// //               const token = await AsyncStorage.getItem('accessToken');
// //               const response = await fetch(`https://elderlybackend.onrender.com/api/reminders/${reminderId}`, {
// //                 method: 'DELETE',
// //                 headers: {
// //                   'Authorization': `Bearer ${token}`,
// //                   'Content-Type': 'application/json'
// //                 }
// //               });

// //               if (response.ok) {
// //                 setReminders(prev => prev.filter(r => r._id !== reminderId));
// //                 Alert.alert('Success', 'Reminder deleted successfully');
// //               } else {
// //                 throw new Error('Failed to delete reminder');
// //               }
// //             } catch (error) {
// //               Alert.alert('Error', 'Failed to delete reminder');
// //             }
// //           }
// //         }
// //       ]
// //     );
// //   };

// //   const getPriorityColor = (priority: string) => {
// //     switch (priority) {
// //       case 'high': return '#e74c3c';
// //       case 'medium': return '#f39c12';
// //       case 'low': return '#27ae60';
// //       default: return '#95a5a6';
// //     }
// //   };

// //   const getTypeIcon = (type: string) => {
// //     switch (type) {
// //       case 'medication': return '💊';
// //       case 'appointment': return '🏥';
// //       case 'activity': return '🎯';
// //       case 'exercise': return '🏃‍♂️';
// //       case 'meal': return '🍽️';
// //       default: return '📋';
// //     }
// //   };

// //   const renderReminder = ({ item }: { item: Reminder }) => (
// //     <View style={styles.reminderCard}>
// //       <View style={styles.reminderHeader}>
// //         <View style={styles.reminderTitleRow}>
// //           <Text style={styles.typeIcon}>{getTypeIcon(item.reminderType)}</Text>
// //           <Text style={styles.reminderTitle}>{item.title}</Text>
// //           <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
// //             <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
// //           </View>
// //         </View>
// //       </View>
      
// //       {item.description && (
// //         <Text style={styles.reminderDescription}>{item.description}</Text>
// //       )}
      
// //       <View style={styles.reminderDetails}>
// //         <Text style={styles.detailText}>
// //           📅 {new Date(item.scheduledDateTime).toLocaleDateString()}
// //         </Text>
// //         <Text style={styles.detailText}>
// //           ⏰ {new Date(item.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
// //         </Text>
// //         {item.isRecurring && (
// //           <Text style={styles.detailText}>
// //             🔄 {item.recurrencePattern?.type} (every {item.recurrencePattern?.interval})
// //           </Text>
// //         )}
// //       </View>

// //       <View style={styles.alarmInfo}>
// //         <Text style={styles.alarmText}>
// //           🔊 {item.alarmSettings.soundType} • Volume {item.alarmSettings.volume}/10
// //         </Text>
// //         {item.alarmSettings.vibrate && <Text style={styles.alarmText}>📳 Vibrate</Text>}
// //         {item.alarmSettings.snoozeEnabled && (
// //           <Text style={styles.alarmText}>💤 Snooze {item.alarmSettings.snoozeDuration}min</Text>
// //         )}
// //       </View>

// //       <View style={styles.actionButtons}>
// //         <TouchableOpacity 
// //           style={styles.scheduleButton} 
// //           onPress={() => scheduleNotification(item)}
// //         >
// //           <Text style={styles.buttonText}>📲 Schedule</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity 
// //           style={styles.deleteButton} 
// //           onPress={() => deleteReminder(item._id)}
// //         >
// //           <Text style={styles.buttonText}>🗑️ Delete</Text>
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );

// //   const renderEmptyComponent = () => (
// //     <View style={styles.emptyContainer}>
// //       <Text style={styles.emptyText}>📋 No reminders yet</Text>
// //       <Text style={styles.emptySubtext}>
// //         Create your first reminder to get started!
// //       </Text>
// //     </View>
// //   );

// //   if (loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#3498db" />
// //         <Text style={styles.loadingText}>Loading reminders...</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <View style={styles.header}>
// //         <Text style={styles.headerTitle}>My Reminders</Text>
// //         <Text style={styles.headerSubtitle}>{reminders.length} active reminders</Text>
// //       </View>
      
// //       <FlatList
// //         data={reminders}
// //         keyExtractor={item => item._id}
// //         renderItem={renderReminder}
// //         contentContainerStyle={styles.listContainer}
// //         refreshControl={
// //           <RefreshControl 
// //             refreshing={refreshing} 
// //             onRefresh={onRefresh}
// //             colors={['#3498db']}
// //             tintColor="#3498db"
// //           />
// //         }
// //         ListEmptyComponent={renderEmptyComponent}
// //         showsVerticalScrollIndicator={false}
// //       />
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f8f9fa'
// //   },
// //   header: {
// //     backgroundColor: '#3498db',
// //     padding: 20,
// //     paddingTop: 15,
// //     borderBottomLeftRadius: 20,
// //     borderBottomRightRadius: 20
// //   },
// //   headerTitle: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     color: 'white',
// //     textAlign: 'center'
// //   },
// //   headerSubtitle: {
// //     fontSize: 16,
// //     color: 'rgba(255,255,255,0.9)',
// //     textAlign: 'center',
// //     marginTop: 5
// //   },
// //   listContainer: {
// //     padding: 15,
// //     paddingBottom: 30
// //   },
// //   reminderCard: {
// //     backgroundColor: 'white',
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 15,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#3498db'
// //   },
// //   reminderHeader: {
// //     marginBottom: 10
// //   },
// //   reminderTitleRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between'
// //   },
// //   typeIcon: {
// //     fontSize: 20,
// //     marginRight: 8
// //   },
// //   reminderTitle: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#2c3e50',
// //     flex: 1
// //   },
// //   priorityBadge: {
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     borderRadius: 10,
// //     marginLeft: 8
// //   },
// //   priorityText: {
// //     color: 'white',
// //     fontSize: 10,
// //     fontWeight: 'bold'
// //   },
// //   reminderDescription: {
// //     fontSize: 14,
// //     color: '#7f8c8d',
// //     marginBottom: 12,
// //     lineHeight: 20
// //   },
// //   reminderDetails: {
// //     marginBottom: 10
// //   },
// //   detailText: {
// //     fontSize: 14,
// //     color: '#34495e',
// //     marginBottom: 4
// //   },
// //   alarmInfo: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     marginBottom: 15
// //   },
// //   alarmText: {
// //     fontSize: 12,
// //     color: '#95a5a6',
// //     marginRight: 15,
// //     marginBottom: 2
// //   },
// //   actionButtons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between'
// //   },
// //   scheduleButton: {
// //     backgroundColor: '#27ae60',
// //     paddingHorizontal: 16,
// //     paddingVertical: 8,
// //     borderRadius: 20,
// //     flex: 0.45
// //   },
// //   deleteButton: {
// //     backgroundColor: '#e74c3c',
// //     paddingHorizontal: 16,
// //     paddingVertical: 8,
// //     borderRadius: 20,
// //     flex: 0.45
// //   },
// //   buttonText: {
// //     color: 'white',
// //     fontSize: 14,
// //     fontWeight: '600',
// //     textAlign: 'center'
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#f8f9fa'
// //   },
// //   loadingText: {
// //     marginTop: 10,
// //     fontSize: 16,
// //     color: '#7f8c8d'
// //   },
// //   emptyContainer: {
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     paddingTop: 100
// //   },
// //   emptyText: {
// //     fontSize: 22,
// //     color: '#7f8c8d',
// //     marginBottom: 10
// //   },
// //   emptySubtext: {
// //     fontSize: 16,
// //     color: '#95a5a6',
// //     textAlign: 'center'
// //   }
// // });












// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Notifications from 'expo-notifications';
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   RefreshControl,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';

// // Configure notification behavior
// Notifications.setNotificationHandler({
//   handleNotification: async () => {
//     console.log('🔔 Notification handler called');
//     return {
//       shouldShowAlert: true,
//       shouldPlaySound: true,
//       shouldSetBadge: false,
//     };
//   },
// });

// interface Reminder {
//   id: string; // Changed from _id to id based on API response
//   title: string;
//   description: string;
//   reminderType: string;
//   scheduledDateTime: string;
//   nextTrigger: string;
//   isRecurring: boolean;
//   recurrencePattern?: {
//     type: string;
//     interval: number;
//     daysOfWeek?: number[];
//     endDate: string;
//   };
//   alarmSettings: {
//     soundType: string;
//     volume: number;
//     vibrate: boolean;
//     snoozeEnabled: boolean;
//     snoozeDuration: number;
//   };
//   priority: string;
//   requiresConfirmation: boolean;
//   status: string;
//   elderlyUser: {
//     id: string;
//     name: string;
//   };
//   createdBy: {
//     id: string;
//     name: string;
//   };
//   group: {
//     id: string;
//     name: string;
//   };
//   createdAt: string;
// }

// export default function ReminderListScreen() {
//   const [reminders, setReminders] = useState<Reminder[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Network connectivity check
//   const checkNetworkConnectivity = async () => {
//     console.log('🌐 Checking network connectivity...');
//     try {
//       const response = await fetch('https://www.google.com', { 
//         method: 'HEAD',
//         // @ts-ignore - timeout is supported in React Native
//         timeout: 5000 
//       });
//       console.log('✅ Network connectivity confirmed');
//       return true;
//     } catch (error) {
//       console.log('❌ Network connectivity failed:', error);
//       return false;
//     }
//   };

//   // AsyncStorage debugging
//   const debugAsyncStorage = async () => {
//     console.log('💾 Debugging AsyncStorage contents...');
//     try {
//       const keys = await AsyncStorage.getAllKeys();
//       console.log('🔑 All AsyncStorage keys:', keys);
      
//       const values = await AsyncStorage.multiGet(keys);
//       console.log('📦 AsyncStorage contents:');
//       values.forEach(([key, value]) => {
//         if (key.includes('Token')) {
//           console.log(`  ${key}: ${value ? '***exists***' : 'null'}`);
//         } else {
//           console.log(`  ${key}: ${value}`);
//         }
//       });
//     } catch (error) {
//       console.log('💥 Error debugging AsyncStorage:', error);
//     }
//   };

//   // Error categorization
//   const categorizeError = (error: any) => {
//     console.log('🔍 Categorizing error:', error.message);
    
//     if (error.message.includes('fetch') || error.message.includes('Network')) {
//       console.log('🌐 Network-related error detected');
//       return 'NETWORK_ERROR';
//     } else if (error.message.includes('401')) {
//       console.log('🔐 Authentication error detected');
//       return 'AUTH_ERROR';
//     } else if (error.message.includes('JSON')) {
//       console.log('📄 JSON parsing error detected');
//       return 'PARSE_ERROR';
//     } else if (error.message.includes('timeout')) {
//       console.log('⏰ Timeout error detected');
//       return 'TIMEOUT_ERROR';
//     } else {
//       console.log('❓ Unknown error type');
//       return 'UNKNOWN_ERROR';
//     }
//   };

//   // Memory usage monitoring
//   const logMemoryUsage = () => {
//     if (__DEV__) {
//       console.log('🧠 Memory usage check');
//       console.log('📊 Reminders in state:', reminders.length);
//       console.log('💾 Component re-renders tracked');
//     }
//   };

//   useEffect(() => {
//     logMemoryUsage();
//   }, [reminders]);

//   const fetchReminders = useCallback(async () => {
//     const startTime = Date.now();
//     console.log('🚀 Starting fetchReminders at:', new Date().toISOString());
    
//     try {
//       // Check network connectivity first
//       const isConnected = await checkNetworkConnectivity();
//       if (!isConnected) {
//         throw new Error('Network connectivity issue detected');
//       }

//       // Debug AsyncStorage
//       await debugAsyncStorage();

//       console.log('🔑 Getting authentication tokens...');
//       const token = await AsyncStorage.getItem('accessToken');
//       const userId = await AsyncStorage.getItem('userId');
      
//       console.log('👤 User ID:', userId);
//       console.log('🔐 Token exists:', !!token);
//       console.log('🔐 Token length:', token?.length || 0);
//       console.log('🔐 Token first 20 chars:', token?.substring(0, 20) || 'N/A');
      
//       if (!token || !userId) {
//         console.log('❌ Authentication failed - missing credentials');
//         Alert.alert('Authentication Error', 'Please login again');
//         return;
//       }

//       const apiUrl = `https://elderlybackend.onrender.com/api/reminders`;
//       console.log('🌐 Making API request to:', apiUrl);
//       console.log('📤 Request headers:', {
//         'Authorization': `Bearer ${token.substring(0, 20)}...`,
//         'Content-Type': 'application/json'
//       });

//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const responseTime = Date.now() - startTime;
//       console.log('⏱️ API response time:', responseTime, 'ms');

//       console.log('📡 Response received');
//       console.log('📊 Response status:', response.status);
//       console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
//       console.log('✅ Response ok:', response.ok);

//       if (!response.ok) {
//         console.log('❌ Response not ok, status:', response.status);
        
//         // Try to get error details
//         const errorText = await response.text();
//         console.log('📄 Error response text:', errorText);
        
//         let errorMessage = `HTTP error! status: ${response.status}`;
//         try {
//           const errorData = JSON.parse(errorText);
//           console.log('🔍 Parsed error data:', errorData);
//           errorMessage = errorData.message || errorMessage;
//         } catch (parseError) {
//           console.log('⚠️ Could not parse error response as JSON');
//         }
        
//         throw new Error(errorMessage);
//       }

//       const responseText = await response.text();
//       console.log('📄 Raw response text:', responseText);
//       console.log('📏 Response text length:', responseText.length);

//       let data;
//       try {
//         data = JSON.parse(responseText);
//         console.log('✅ Response JSON parsed successfully');
//         console.log('📦 Response data structure:', Object.keys(data));
//       } catch (parseError) {
//         console.log('❌ Failed to parse response as JSON:', parseError);
//         throw new Error('Invalid response format from server');
//       }

//       console.log('🔍 Checking data structure...');
//       console.log('📊 Data keys:', Object.keys(data));
//       console.log('📋 Success field:', data.success);
//       console.log('📦 Data field exists:', !!data.data);
      
//       // FIXED: Check for data.data.reminders instead of data.reminders
//       console.log('📋 Reminders array exists:', !!data.data?.reminders);
//       console.log('📋 Reminders array type:', Array.isArray(data.data?.reminders));
//       console.log('📊 Reminders count:', data.data?.reminders?.length || 0);
//       console.log('📊 API count field:', data.data?.count || 0);

//       if (data.success && data.data && data.data.reminders && Array.isArray(data.data.reminders)) {
//         console.log('✅ Valid reminders array received');
//         console.log('📋 First reminder sample:', data.data.reminders[0] ? {
//           id: data.data.reminders[0].id,
//           title: data.data.reminders[0].title,
//           type: data.data.reminders[0].reminderType,
//           scheduledDateTime: data.data.reminders[0].scheduledDateTime
//         } : 'No reminders');
        
//         setReminders(data.data.reminders);
//       } else {
//         console.log('⚠️ Invalid or missing reminders array');
//         console.log('🔍 Full response structure:', JSON.stringify(data, null, 2));
//         setReminders([]);
//       }

//     } catch (error: any) {
//       const errorTime = Date.now() - startTime;
//       console.log('💥 Error occurred after:', errorTime, 'ms');
//       console.log('💥 Error in fetchReminders:', error);
//       console.log('📝 Error message:', error.message);
//       console.log('🔍 Error stack:', error.stack);
      
//       const errorType = categorizeError(error);
//       console.log('🏷️ Error type:', errorType);
      
//       let userMessage = 'Failed to fetch reminders';
//       switch (errorType) {
//         case 'NETWORK_ERROR':
//           userMessage = 'Network error. Please check your connection.';
//           break;
//         case 'AUTH_ERROR':
//           userMessage = 'Authentication failed. Please login again.';
//           break;
//         case 'TIMEOUT_ERROR':
//           userMessage = 'Request timed out. Please try again.';
//           break;
//         case 'PARSE_ERROR':
//           userMessage = 'Server response format error. Please try again.';
//           break;
//         default:
//           userMessage = 'Server error. Please try again later.';
//       }
      
//       Alert.alert('Error', `${userMessage}\n\nTechnical details: ${error.message}`);
//     } finally {
//       console.log('🏁 fetchReminders finished');
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     console.log('🎬 Component mounted, starting initialization...');
//     fetchReminders();
//     requestNotificationPermissions();
//   }, [fetchReminders]);

//   const requestNotificationPermissions = async () => {
//     console.log('🔔 Requesting notification permissions...');
    
//     try {
//       const { status } = await Notifications.requestPermissionsAsync();
//       console.log('📱 Notification permission status:', status);
      
//       if (status !== 'granted') {
//         console.log('❌ Notification permissions denied');
//         Alert.alert('Permission Required', 'Please enable notifications to receive reminders');
//       } else {
//         console.log('✅ Notification permissions granted');
//       }
//     } catch (error) {
//       console.log('💥 Error requesting notification permissions:', error);
//     }
//   };

//   const onRefresh = useCallback(() => {
//     console.log('🔄 Pull to refresh triggered');
//     setRefreshing(true);
//     fetchReminders();
//   }, [fetchReminders]);

//   const scheduleNotification = async (reminder: Reminder) => {
//     console.log('📲 Scheduling notification for reminder:', reminder.id);
//     console.log('📅 Scheduled date/time:', reminder.scheduledDateTime);
    
//     try {
//       const triggerDate = new Date(reminder.scheduledDateTime);
//       const now = new Date();
      
//       console.log('🕐 Current time:', now.toISOString());
//       console.log('⏰ Trigger time:', triggerDate.toISOString());
//       console.log('⏳ Time difference (ms):', triggerDate.getTime() - now.getTime());
//       console.log('⏳ Time difference (hours):', (triggerDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
//       if (triggerDate <= now) {
//         console.log('❌ Cannot schedule notification for past date');
//         Alert.alert('Invalid Date', 'Cannot schedule notification for past date');
//         return;
//       }

//       console.log('📋 Notification content:', {
//         title: `📋 ${reminder.title}`,
//         body: reminder.description || `${reminder.reminderType} reminder`,
//         data: { 
//           reminderId: reminder.id,
//           requiresConfirmation: reminder.requiresConfirmation
//         }
//       });

//       const notificationId = await Notifications.scheduleNotificationAsync({
//         content: {
//           title: `📋 ${reminder.title}`,
//           body: reminder.description || `${reminder.reminderType} reminder`,
//           data: { 
//             reminderId: reminder.id,
//             requiresConfirmation: reminder.requiresConfirmation
//           },
//           sound: reminder.alarmSettings.soundType === 'loud' ? 'default' : 'defaultCritical',
//         },
//         trigger: triggerDate,
//       });

//       console.log('✅ Notification scheduled successfully:', notificationId);
//       Alert.alert('Success', `Notification scheduled for ${triggerDate.toLocaleString()}`);
      
//     } catch (error) {
//       console.log('💥 Error scheduling notification:', error);
//       Alert.alert('Error', 'Failed to schedule notification');
//     }
//   };

//   const deleteReminder = async (reminderId: string) => {
//     console.log('🗑️ Delete reminder requested for ID:', reminderId);
    
//     Alert.alert(
//       'Delete Reminder',
//       'Are you sure you want to delete this reminder?',
//       [
//         { 
//           text: 'Cancel', 
//           style: 'cancel',
//           onPress: () => console.log('❌ Delete cancelled')
//         },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             console.log('🚀 Starting delete process...');
            
//             try {
//               const token = await AsyncStorage.getItem('accessToken');
//               console.log('🔑 Got token for delete request');
              
//               if (!token) {
//                 throw new Error('No authentication token found');
//               }

//               const deleteUrl = `https://elderlybackend.onrender.com/api/reminders/${reminderId}`;
//               console.log('🌐 DELETE request to:', deleteUrl);
              
//               const response = await fetch(deleteUrl, {
//                 method: 'DELETE',
//                 headers: {
//                   'Authorization': `Bearer ${token}`,
//                   'Content-Type': 'application/json'
//                 }
//               });

//               console.log('📡 Delete response status:', response.status);
//               console.log('✅ Delete response ok:', response.ok);

//               if (response.ok) {
//                 console.log('✅ Reminder deleted successfully');
//                 setReminders(prev => {
//                   const filtered = prev.filter(r => r.id !== reminderId);
//                   console.log('📊 Reminders count after delete:', filtered.length);
//                   return filtered;
//                 });
//                 Alert.alert('Success', 'Reminder deleted successfully');
//               } else {
//                 const errorText = await response.text();
//                 console.log('❌ Delete failed, response:', errorText);
//                 throw new Error('Failed to delete reminder');
//               }
//             } catch (error) {
//               console.log('💥 Error deleting reminder:', error);
//               Alert.alert('Error', 'Failed to delete reminder');
//             }
//           }
//         }
//       ]
//     );
//   };

//   const getPriorityColor = (priority: string) => {
//     const color = (() => {
//       switch (priority) {
//         case 'high': return '#e74c3c';
//         case 'medium': return '#f39c12';
//         case 'low': return '#27ae60';
//         default: return '#95a5a6';
//       }
//     })();
//     console.log(`🎨 Priority color for ${priority}:`, color);
//     return color;
//   };

//   const getTypeIcon = (type: string) => {
//     const icon = (() => {
//       switch (type) {
//         case 'medication': return '💊';
//         case 'appointment': return '🏥';
//         case 'activity': return '🎯';
//         case 'exercise': return '🏃‍♂️';
//         case 'meal': return '🍽️';
//         default: return '📋';
//       }
//     })();
//     console.log(`🎭 Type icon for ${type}:`, icon);
//     return icon;
//   };

//   const renderReminder = ({ item, index }: { item: Reminder; index: number }) => {
//     console.log(`🎨 Rendering reminder ${index + 1}:`, {
//       id: item.id,
//       title: item.title,
//       type: item.reminderType,
//       priority: item.priority
//     });

//     return (
//       <View style={styles.reminderCard}>
//         <View style={styles.reminderHeader}>
//           <View style={styles.reminderTitleRow}>
//             <Text style={styles.typeIcon}>{getTypeIcon(item.reminderType)}</Text>
//             <Text style={styles.reminderTitle}>{item.title}</Text>
//             <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
//               <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
//             </View>
//           </View>
//         </View>
        
//         {item.description && (
//           <Text style={styles.reminderDescription}>{item.description}</Text>
//         )}
        
//         <View style={styles.reminderDetails}>
//           <Text style={styles.detailText}>
//             📅 {new Date(item.scheduledDateTime).toLocaleDateString()}
//           </Text>
//           <Text style={styles.detailText}>
//             ⏰ {new Date(item.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//           </Text>
//           {item.isRecurring && (
//             <Text style={styles.detailText}>
//               🔄 {item.recurrencePattern?.type} (every {item.recurrencePattern?.interval})
//             </Text>
//           )}
//           <Text style={styles.detailText}>
//             👤 {item.elderlyUser.name}
//           </Text>
//           <Text style={styles.detailText}>
//             👥 {item.group.name}
//           </Text>
//         </View>

//         <View style={styles.alarmInfo}>
//           <Text style={styles.alarmText}>
//             🔊 {item.alarmSettings.soundType} • Volume {item.alarmSettings.volume}/10
//           </Text>
//           {item.alarmSettings.vibrate && <Text style={styles.alarmText}>📳 Vibrate</Text>}
//           {item.alarmSettings.snoozeEnabled && (
//             <Text style={styles.alarmText}>💤 Snooze {item.alarmSettings.snoozeDuration}min</Text>
//           )}
//         </View>

//         <View style={styles.actionButtons}>
//           <TouchableOpacity 
//             style={styles.scheduleButton} 
//             onPress={() => {
//               console.log('📲 Schedule button pressed for:', item.id);
//               scheduleNotification(item);
//             }}
//           >
//             <Text style={styles.buttonText}>📲 Schedule</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.deleteButton} 
//             onPress={() => {
//               console.log('🗑️ Delete button pressed for:', item.id);
//               deleteReminder(item.id);
//             }}
//           >
//             <Text style={styles.buttonText}>🗑️ Delete</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const renderEmptyComponent = () => {
//     console.log('📋 Rendering empty component');
//     return (
//       <View style={styles.emptyContainer}>
//         <Text style={styles.emptyText}>📋 No reminders yet</Text>
//         <Text style={styles.emptySubtext}>
//           Create your first reminder to get started!
//         </Text>
//       </View>
//     );
//   };

//   if (loading) {
//     console.log('⏳ Showing loading state');
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3498db" />
//         <Text style={styles.loadingText}>Loading reminders...</Text>
//       </View>
//     );
//   }

//   console.log('🎨 Rendering main component with', reminders.length, 'reminders');

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>My Reminders</Text>
//         <Text style={styles.headerSubtitle}>{reminders.length} active reminders</Text>
//       </View>
      
//       <FlatList
//         data={reminders}
//         keyExtractor={(item, index) => {
//           console.log(`🔑 Key for item ${index}:`, item.id);
//           return item.id;
//         }}
//         renderItem={renderReminder}
//         contentContainerStyle={styles.listContainer}
//         refreshControl={
//           <RefreshControl 
//             refreshing={refreshing} 
//             onRefresh={onRefresh}
//             colors={['#3498db']}
//             tintColor="#3498db"
//           />
//         }
//         ListEmptyComponent={renderEmptyComponent}
//         showsVerticalScrollIndicator={false}
//         onEndReached={() => console.log('📜 Reached end of list')}
//         onEndReachedThreshold={0.1}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFDDD'
//   },
//   header: {
//     backgroundColor: '#3498db',
//     padding: 20,
//     paddingTop: 15,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white',
//     textAlign: 'center'
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.9)',
//     textAlign: 'center',
//     marginTop: 5
//   },
//   listContainer: {
//     padding: 15,
//     paddingBottom: 30
//   },
//   reminderCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     borderLeftWidth: 4,
//     borderLeftColor: '#3498db'
//   },
//   reminderHeader: {
//     marginBottom: 10
//   },
//   reminderTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between'
//   },
//   typeIcon: {
//     fontSize: 20,
//     marginRight: 8
//   },
//   reminderTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//     flex: 1
//   },
//   priorityBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 10,
//     marginLeft: 8
//   },
//   priorityText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold'
//   },
//   reminderDescription: {
//     fontSize: 14,
//     color: '#7f8c8d',
//     marginBottom: 12,
//     lineHeight: 20
//   },
//   reminderDetails: {
//     marginBottom: 10
//   },
//   detailText: {
//     fontSize: 14,
//     color: '#34495e',
//     marginBottom: 4
//   },
//   alarmInfo: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 15
//   },
//   alarmText: {
//     fontSize: 12,
//     color: '#95a5a6',
//     marginRight: 15,
//     marginBottom: 2
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between'
//   },
//   scheduleButton: {
//     backgroundColor: '#27ae60',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     flex: 0.45
//   },
//   deleteButton: {
//     backgroundColor: '#e74c3c',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     flex: 0.45
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     textAlign: 'center'
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa'
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#7f8c8d'
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingTop: 100
//   },
//   emptyText: {
//     fontSize: 22,
//     color: '#7f8c8d',
//     marginBottom: 10
//   },
//   emptySubtext: {
//     fontSize: 16,
//     color: '#95a5a6',
//     textAlign: 'center'
//   }
// });



// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Notifications from 'expo-notifications';
// // import { Audio } from 'expo-av';
// import * as Haptics from 'expo-haptics';
// import React, { useCallback, useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   RefreshControl,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Platform,
//   Vibration
// } from 'react-native';

// // Notification configuration
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// interface Reminder {
//   id: string;
//   title: string;
//   description: string;
//   reminderType: string;
//   scheduledDateTime: string;
//   nextTrigger: string;
//   isRecurring: boolean;
//   recurrencePattern?: {
//     type: string;
//     interval: number;
//     daysOfWeek?: number[];
//     endDate: string;
//   };
//   alarmSettings: {
//     soundType: string;
//     volume: number;
//     vibrate: boolean;
//     snoozeEnabled: boolean;
//     snoozeDuration: number;
//   };
//   priority: string;
//   requiresConfirmation: boolean;
//   status: string;
//   elderlyUser: {
//     id: string;
//     name: string;
//   };
//   createdBy: {
//     id: string;
//     name: string;
//   };
//   group: {
//     id: string;
//     name: string;
//   };
//   createdAt: string;
// }

// export default function ReminderListScreen() {
//   const [reminders, setReminders] = useState<Reminder[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [sound, setSound] = useState<Audio.Sound | null>(null);

//   // Cleanup sound on unmount
//   useEffect(() => {
//     return sound
//       ? () => {
//           sound.unloadAsync();
//         }
//       : undefined;
//   }, [sound]);

//   const fetchReminders = useCallback(async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('accessToken');
//       if (!token) {
//         Alert.alert('Authentication Error', 'Please login again');
//         setLoading(false);
//         setRefreshing(false);
//         return;
//       }
      
//       const res = await fetch(`https://elderlybackend.onrender.com/api/reminders`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       const text = await res.text();
//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch {
//         throw new Error('Invalid server response');
//       }
      
//       if (!res.ok || !data.success || !data.data || !Array.isArray(data.data.reminders)) {
//         setReminders([]);
//         throw new Error(data.message || 'Failed to fetch reminders');
//       }
      
//       setReminders(data.data.reminders);
//       console.log('📋 Reminders fetched:', data.data.reminders.length);
//     } catch (error: any) {
//       console.error('[Reminder Fetch]', error);
//       Alert.alert('Error', error.message || 'Failed to fetch reminders');
//       setReminders([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchReminders();
//     requestNotificationPermissions();
//     setupNotificationChannel();
//   }, [fetchReminders]);

//   // Set up notification channel for Android
//   const setupNotificationChannel = async () => {
//     if (Platform.OS === 'android') {
//       await Notifications.setNotificationChannelAsync('alarm-reminders', {
//         name: 'Alarm Reminders',
//         importance: Notifications.AndroidImportance.HIGH,
//         sound: 'alarm_sound',
//         vibrationPattern: [0, 500, 500, 500],
//         enableLights: true,
//         enableVibrate: true,
//       });
//     }
//   };

//   const requestNotificationPermissions = async () => {
//     try {
//       const { status } = await Notifications.requestPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission Required', 'Please enable notifications to receive reminders');
//       }
//     } catch (error) {
//       console.log('Notification permission error:', error);
//     }
//   };

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchReminders();
//   }, [fetchReminders]);

//   // Play alarm sound effect
//   const playAlarmSound = async (soundType: string) => {
//     try {
//       // Stop any currently playing sound
//       if (sound) {
//         await sound.stopAsync();
//         await sound.unloadAsync();
//       }
      
//       let soundFile;
//       if (soundType === 'loud') {
//         soundFile = require('../../../assets/loud_alarm.mp3');
//       } else {
//         soundFile = require('../../../assets/gentle_alarm.mp3');
//       }
      
//       const { sound: newSound } = await Audio.Sound.createAsync(
//         soundFile,
//         { shouldPlay: true, isLooping: true }
//       );
//       setSound(newSound);
//       console.log('🔊 Playing alarm sound');
//     } catch (error) {
//       console.error('Error playing alarm sound:', error);
//     }
//   };

//   const triggerVibration = () => {
//     if (Platform.OS === 'ios') {
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//     } else {
//       Vibration.vibrate([500, 500, 500]);
//     }
//   };

//   // Schedule notification with alarm
//   const scheduleNotification = async (reminder: Reminder) => {
//     try {
//       const triggerDate = new Date(reminder.scheduledDateTime);
//       if (triggerDate <= new Date()) {
//         Alert.alert('Invalid Date', 'Cannot schedule notification for a past date');
//         return;
//       }
      
//       // Test the alarm immediately
//       playAlarmSound(reminder.alarmSettings.soundType);
//       triggerVibration();
      
//       // Schedule notification for the future time
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title: `📋 ${reminder.title}`,
//           body: reminder.description || `${reminder.reminderType} reminder`,
//           data: { 
//             reminderId: reminder.id,
//             requiresConfirmation: reminder.requiresConfirmation
//           },
//           sound: 'alarm_sound',
//         },
//         trigger: triggerDate,
//         channelId: 'alarm-reminders',
//       });
      
//       Alert.alert(
//         'Alarm Scheduled', 
//         `You'll hear the alarm at ${triggerDate.toLocaleString()}\n\n` +
//         `Sound: ${reminder.alarmSettings.soundType}\n` +
//         `Volume: ${reminder.alarmSettings.volume}/10\n` +
//         `Vibration: ${reminder.alarmSettings.vibrate ? 'ON' : 'OFF'}`
//       );
//     } catch (error) {
//       console.error('Error scheduling notification:', error);
//       Alert.alert('Error', 'Failed to schedule notification');
//     }
//   };

//   const deleteReminder = async (reminderId: string) => {
//     Alert.alert(
//       'Delete Reminder',
//       'Are you sure you want to delete this reminder?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               const token = await AsyncStorage.getItem('accessToken');
//               if (!token) throw new Error('Not logged in');
//               const res = await fetch(`https://elderlybackend.onrender.com/api/reminders/${reminderId}`, {
//                 method: 'DELETE',
//                 headers: {
//                   'Authorization': `Bearer ${token}`,
//                   'Content-Type': 'application/json'
//                 }
//               });
//               if (res.ok) {
//                 setReminders(prev => prev.filter(r => r.id !== reminderId));
//                 Alert.alert('Success', 'Reminder deleted successfully');
//               } else {
//                 throw new Error('Failed to delete reminder');
//               }
//             } catch (error) {
//               Alert.alert('Error', 'Failed to delete reminder');
//             }
//           }
//         }
//       ]
//     );
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'high': return '#e74c3c';
//       case 'medium': return '#f39c12';
//       case 'low': return '#27ae60';
//       default: return '#95a5a6';
//     }
//   };

//   const getTypeIcon = (type: string) => {
//     switch (type) {
//       case 'medication': return '💊';
//       case 'appointment': return '🏥';
//       case 'activity': return '🎯';
//       case 'exercise': return '🏃‍♂️';
//       case 'meal': return '🍽️';
//       default: return '📋';
//     }
//   };

//   const renderReminder = ({ item }: { item: Reminder }) => (
//     <View style={styles.reminderCard}>
//       <View style={styles.reminderHeader}>
//         <View style={styles.reminderTitleRow}>
//           <Text style={styles.typeIcon}>{getTypeIcon(item.reminderType)}</Text>
//           <Text style={styles.reminderTitle}>{item.title}</Text>
//           <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
//             <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
//           </View>
//         </View>
//       </View>
//       {item.description ? (
//         <Text style={styles.reminderDescription}>{item.description}</Text>
//       ) : null}
//       <View style={styles.reminderDetails}>
//         <Text style={styles.detailText}>
//           📅 {new Date(item.scheduledDateTime).toLocaleDateString()}
//         </Text>
//         <Text style={styles.detailText}>
//           ⏰ {new Date(item.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//         </Text>
//         {item.isRecurring && (
//           <Text style={styles.detailText}>
//             🔄 {item.recurrencePattern?.type} (every {item.recurrencePattern?.interval})
//           </Text>
//         )}
//         <Text style={styles.detailText}>👤 {item.elderlyUser?.name}</Text>
//         <Text style={styles.detailText}>👥 {item.group?.name}</Text>
//       </View>
//       <View style={styles.alarmInfo}>
//         <Text style={styles.alarmText}>
//           🔊 {item.alarmSettings.soundType} • Volume {item.alarmSettings.volume}/10
//         </Text>
//         {item.alarmSettings.vibrate && <Text style={styles.alarmText}>📳 Vibrate</Text>}
//         {item.alarmSettings.snoozeEnabled && (
//           <Text style={styles.alarmText}>💤 Snooze {item.alarmSettings.snoozeDuration}min</Text>
//         )}
//       </View>
//       <View style={styles.actionButtons}>
//         <TouchableOpacity style={styles.scheduleButton} onPress={() => scheduleNotification(item)}>
//           <Text style={styles.buttonText}>🔊 Test & Schedule</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.deleteButton} onPress={() => deleteReminder(item.id)}>
//           <Text style={styles.buttonText}>🗑️ Delete</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3498db" />
//         <Text style={styles.loadingText}>Loading reminders...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>My Reminders</Text>
//         <Text style={styles.headerSubtitle}>{reminders.length} active reminders</Text>
//       </View>
//       <FlatList
//         data={reminders}
//         keyExtractor={item => item.id}
//         renderItem={renderReminder}
//         contentContainerStyle={styles.listContainer}
//         refreshControl={
//           <RefreshControl 
//             refreshing={refreshing} 
//             onRefresh={onRefresh}
//             colors={['#3498db']}
//             tintColor="#3498db"
//           />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>📋 No reminders yet</Text>
//             <Text style={styles.emptySubtext}>
//               Create your first reminder to get started!
//             </Text>
//           </View>
//         }
//         showsVerticalScrollIndicator={false}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f8f9fa' },
//   header: {
//     backgroundColor: '#3498db',
//     padding: 20,
//     paddingTop: 15,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white',
//     textAlign: 'center'
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: 'rgba(255,255,255,0.9)',
//     textAlign: 'center',
//     marginTop: 5
//   },
//   listContainer: {
//     padding: 15,
//     paddingBottom: 30
//   },
//   reminderCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     borderLeftWidth: 4,
//     borderLeftColor: '#3498db'
//   },
//   reminderHeader: {
//     marginBottom: 10
//   },
//   reminderTitleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between'
//   },
//   typeIcon: {
//     fontSize: 20,
//     marginRight: 8
//   },
//   reminderTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//     flex: 1
//   },
//   priorityBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 10,
//     marginLeft: 8
//   },
//   priorityText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold'
//   },
//   reminderDescription: {
//     fontSize: 14,
//     color: '#7f8c8d',
//     marginBottom: 12,
//     lineHeight: 20
//   },
//   reminderDetails: {
//     marginBottom: 10
//   },
//   detailText: {
//     fontSize: 14,
//     color: '#34495e',
//     marginBottom: 4
//   },
//   alarmInfo: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 15
//   },
//   alarmText: {
//     fontSize: 12,
//     color: '#95a5a6',
//     marginRight: 15,
//     marginBottom: 2
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between'
//   },
//   scheduleButton: {
//     backgroundColor: '#27ae60',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     flex: 0.45
//   },
//   deleteButton: {
//     backgroundColor: '#e74c3c',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     flex: 0.45
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//     textAlign: 'center'
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa'
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#7f8c8d'
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingTop: 100
//   },
//   emptyText: {
//     fontSize: 22,
//     color: '#7f8c8d',
//     marginBottom: 10
//   },
//   emptySubtext: {
//     fontSize: 16,
//     color: '#95a5a6',
//     textAlign: 'center'
//   }
// });



import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { scheduleAlarm, removeAlarm, stopAlarm } from "expo-alarm-module";
import ElderlyTaskScreen from "./earlyTaskScreen";

const { width } = Dimensions.get("window");

export default function ReminderListScreen() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [scheduledAlarms, setScheduledAlarms] = useState(new Set());

  // **Expo Alarm Module Functions**
  const scheduleReminderAlarm = async (reminder) => {
    try {
      const reminderDate = new Date(reminder.scheduledDateTime);
      const now = new Date();

      if (reminderDate <= now) {
        Alert.alert("Invalid Date", "Cannot schedule alarm for past date");
        return;
      }

      const alarmConfig = {
        uid: `alarm_${reminder.id}`,
        day: reminderDate,
        title: `${getTypeIcon(reminder.reminderType)} ${reminder.title}`,
        description: reminder.description || `${reminder.reminderType} reminder`,
        showDismiss: true,
        showSnooze: reminder.alarmSettings?.snoozeEnabled !== false,
        snoozeInterval: reminder.alarmSettings?.snoozeInterval || 10, // minutes
        repeating: reminder.isRecurring || false,
        active: true,
        vibrate: reminder.alarmSettings?.vibrate !== false,
        sound: reminder.alarmSettings?.soundType || 'default',
        priority: reminder.priority === 'high' ? 'max' : 'default',
      };

      await scheduleAlarm(alarmConfig);

      // Store alarm info locally
      const alarmInfo = {
        reminderId: reminder.id,
        alarmUid: alarmConfig.uid,
        scheduledTime: reminderDate.toISOString(),
        isRecurring: reminder.isRecurring,
        title: reminder.title,
        type: reminder.reminderType,
      };

      await AsyncStorage.setItem(`alarm_${reminder.id}`, JSON.stringify(alarmInfo));
      
      setScheduledAlarms(prev => new Set([...prev, reminder.id]));

      Alert.alert(
        "Alarm Set! ⏰",
        `Your ${reminder.reminderType} alarm "${reminder.title}" is scheduled for ${reminderDate.toLocaleString()}`
      );
    } catch (error) {
      console.error("Error scheduling alarm:", error);
      Alert.alert("Error", "Failed to schedule alarm. Please try again.");
    }
  };

  const removeReminderAlarm = async (reminderId) => {
    try {
      const alarmInfoString = await AsyncStorage.getItem(`alarm_${reminderId}`);
      if (alarmInfoString) {
        const alarmInfo = JSON.parse(alarmInfoString);
        
        // Remove the alarm using its UID
        await removeAlarm(alarmInfo.alarmUid);
        
        // Clean up local storage
        await AsyncStorage.removeItem(`alarm_${reminderId}`);
        
        setScheduledAlarms(prev => {
          const newSet = new Set(prev);
          newSet.delete(reminderId);
          return newSet;
        });

        Alert.alert("Success", "Alarm removed successfully");
      }
    } catch (error) {
      console.error("Error removing alarm:", error);
      Alert.alert("Error", "Failed to remove alarm");
    }
  };

  const stopCurrentAlarm = async () => {
    try {
      await stopAlarm();
      Alert.alert("Success", "Current alarm stopped");
    } catch (error) {
      console.error("Error stopping alarm:", error);
      Alert.alert("Error", "Failed to stop alarm");
    }
  };

  const snoozeAlarm = async (reminderId, snoozeMinutes = 10) => {
    try {
      // First stop current alarm
      await stopAlarm();
      
      // Get the reminder and reschedule it for snooze time
      const reminder = reminders.find(r => r.id === reminderId);
      if (reminder) {
        const snoozeTime = new Date(Date.now() + snoozeMinutes * 60 * 1000);
        const snoozeReminder = {
          ...reminder,
          scheduledDateTime: snoozeTime.toISOString(),
          title: `⏰ Snoozed: ${reminder.title}`,
        };
        
        await scheduleReminderAlarm(snoozeReminder);
      }
    } catch (error) {
      console.error("Error snoozing alarm:", error);
      Alert.alert("Error", "Failed to snooze alarm");
    }
  };

  const fetchReminders = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Authentication Error", "Please login again");
        return;
      }

      const response = await fetch(
        `https://elderlybackend.onrender.com/api/reminders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && data.data.reminders) {
        setReminders(data.data.reminders);
        
        // Check which alarms are already scheduled
        const scheduledSet = new Set();
        for (const reminder of data.data.reminders) {
          const alarmInfo = await AsyncStorage.getItem(`alarm_${reminder.id}`);
          if (alarmInfo) {
            scheduledSet.add(reminder.id);
          }
        }
        setScheduledAlarms(scheduledSet);
      } else {
        setReminders([]);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      Alert.alert("Error", "Failed to fetch reminders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const deleteReminder = async (reminderId) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder and its alarm?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("accessToken");
              if (!token) throw new Error("No authentication token found");

              // Remove the alarm first
              await removeReminderAlarm(reminderId);

              const response = await fetch(
                `https://elderlybackend.onrender.com/api/reminders/${reminderId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              if (response.ok) {
                setReminders((prev) => prev.filter((r) => r.id !== reminderId));
                Alert.alert("Success", "Reminder and alarm deleted successfully");
              } else {
                throw new Error("Failed to delete reminder");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete reminder");
            }
          },
        },
      ]
    );
  };

  const showAlarmOptions = (reminder) => {
    const isScheduled = scheduledAlarms.has(reminder.id);
    
    Alert.alert(
      `${getTypeIcon(reminder.reminderType)} ${reminder.title}`,
      "Choose an alarm action:",
      [
        { text: "Cancel", style: "cancel" },
        ...(!isScheduled ? [{
          text: "⏰ Schedule Alarm",
          onPress: () => scheduleReminderAlarm(reminder),
        }] : []),
        ...(isScheduled ? [{
          text: "❌ Remove Alarm",
          onPress: () => removeReminderAlarm(reminder.id),
          style: "destructive",
        }] : []),
        {
          text: "⏰ Snooze 10min",
          onPress: () => snoozeAlarm(reminder.id, 10),
        },
        {
          text: "🔇 Stop Current",
          onPress: stopCurrentAlarm,
        },
      ]
    );
  };

  useEffect(() => {
    if (!showTasks) {
      fetchReminders();
    }
  }, [showTasks, fetchReminders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReminders();
  }, [fetchReminders]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#FF5100";
      case "medium": return "#FF8C00";
      case "low": return "#009951";
      default: return "#C15C2D";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "medication": return "💊";
      case "appointment": return "🏥";
      case "activity": return "🎯";
      case "exercise": return "🏃‍♂️";
      case "meal": return "🍽️";
      default: return "📋";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const renderReminder = ({ item }) => {
    const isScheduled = scheduledAlarms.has(item.id);
    
    return (
      <View style={[styles.reminderCard, { borderLeftColor: getPriorityColor(item.priority) }]}>
        {/* Header */}
        <View style={styles.reminderHeader}>
          <View style={styles.typeIconContainer}>
            <Text style={styles.typeIcon}>{getTypeIcon(item.reminderType)}</Text>
          </View>
          <View style={styles.reminderTitleContainer}>
            <Text style={styles.reminderTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.reminderType}>{item.reminderType}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
          </View>
        </View>

        {/* Description */}
        {item.description && (
          <Text style={styles.reminderDescription} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        {/* Date and Time */}
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeItem}>
            <MaterialIcons name="calendar-today" size={20} color="#FF8C00" />
            <Text style={styles.dateTimeText}>{formatDate(item.scheduledDateTime)}</Text>
          </View>
          <View style={styles.dateTimeItem}>
            <MaterialIcons name="access-time" size={20} color="#FF8C00" />
            <Text style={styles.dateTimeText}>{formatTime(item.scheduledDateTime)}</Text>
          </View>
        </View>

        {/* Alarm Status */}
        {isScheduled && (
          <View style={styles.alarmStatusContainer}>
            <MaterialIcons name="alarm-on" size={20} color="#009951" />
            <Text style={styles.alarmStatusText}>Alarm Scheduled</Text>
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          {item.isRecurring && (
            <View style={styles.infoChip}>
              <MaterialIcons name="repeat" size={16} color="#009951" />
              <Text style={styles.infoChipText}>
                {item.recurrencePattern || 'Recurring'}
              </Text>
            </View>
          )}
          {item.alarmSettings?.vibrate && (
            <View style={styles.infoChip}>
              <MaterialIcons name="vibration" size={16} color="#C15C2D" />
              <Text style={styles.infoChipText}>Vibrate</Text>
            </View>
          )}
          {item.alarmSettings?.snoozeEnabled && (
            <View style={styles.infoChip}>
              <MaterialIcons name="snooze" size={16} color="#FF8C00" />
              <Text style={styles.infoChipText}>Snooze</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              isScheduled ? styles.removeButton : styles.scheduleButton
            ]}
            onPress={() => 
              isScheduled 
                ? removeReminderAlarm(item.id)
                : scheduleReminderAlarm(item)
            }
            activeOpacity={0.8}
          >
            <MaterialIcons 
              name={isScheduled ? "alarm-off" : "alarm"} 
              size={20} 
              color="#FFF3DD" 
            />
            <Text style={styles.actionButtonText}>
              {isScheduled ? "Remove" : "Set Alarm"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.optionsButton]}
            onPress={() => showAlarmOptions(item)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="more-horiz" size={20} color="#FFF3DD" />
            <Text style={styles.actionButtonText}>Options</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteReminder(item.id)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="delete-outline" size={20} color="#FFF3DD" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons name="alarm" size={80} color="#C15C2D" />
      </View>
      <Text style={styles.emptyTitle}>No Alarms Set</Text>
      <Text style={styles.emptySubtext}>
        Your reminder alarms will appear here once they are created by your family
        members or caregivers.
      </Text>
      <TouchableOpacity
        style={styles.stopAlarmButton}
        onPress={stopCurrentAlarm}
        activeOpacity={0.8}
      >
        <MaterialIcons name="alarm-off" size={24} color="#FFF3DD" />
        <Text style={styles.stopAlarmButtonText}>Stop Current Alarm</Text>
      </TouchableOpacity>
    </View>
  );

  // Main render
  if (showTasks) {
    return <ElderlyTaskScreen />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5100" />
        <Text style={styles.loadingText}>Loading your alarms...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Alarms ⏰</Text>
          <Text style={styles.headerSubtitle}>
            {reminders.length} {reminders.length === 1 ? "reminder" : "reminders"} • {scheduledAlarms.size} active alarms
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: '#FF5100' }]}
            onPress={stopCurrentAlarm}
          >
            <MaterialIcons name="alarm-off" size={24} color="#FFF3DD" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: '#009951' }]}
            onPress={() => setShowTasks(true)}
          >
            <MaterialIcons name="assignment" size={24} color="#FFF3DD" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reminders List */}
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={renderReminder}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF5100"]}
            tintColor="#FF5100"
          />
        }
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF3DD",
  },
  header: {
    backgroundColor: "#FF5100",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF3DD",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 243, 221, 0.9)",
    fontWeight: "500",
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  listContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  separator: {
    height: 16,
  },
  reminderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 140, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  typeIcon: {
    fontSize: 24,
  },
  reminderTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  reminderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3E3F5B",
    marginBottom: 4,
    lineHeight: 24,
  },
  reminderType: {
    fontSize: 14,
    color: "#8AB2A6",
    textTransform: "capitalize",
    fontWeight: "500",
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  priorityText: {
    color: "#FFF3DD",
    fontSize: 12,
    fontWeight: "bold",
  },
  reminderDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3930",
    lineHeight: 22,
    marginBottom: 16,
  },
  dateTimeContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  dateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
    backgroundColor: "rgba(255, 140, 0, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: "#FF8C00",
    fontWeight: "600",
    marginLeft: 8,
  },
  alarmStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 153, 81, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  alarmStatusText: {
    fontSize: 14,
    color: "#009951",
    fontWeight: "600",
    marginLeft: 8,
  },
  additionalInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 153, 81, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  infoChipText: {
    fontSize: 12,
    color: "#009951",
    fontWeight: "500",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    flex: 0.31,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scheduleButton: {
    backgroundColor: "#009951",
  },
  removeButton: {
    backgroundColor: "#FF5100",
  },
  optionsButton: {
    backgroundColor: "#FF8C00",
  },
  deleteButton: {
    backgroundColor: "#C15C2D",
  },
  actionButtonText: {
    color: "#FFF3DD",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF3DD",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#C15C2D",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(193, 92, 45, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF5100",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#C15C2D",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  stopAlarmButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF5100",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  stopAlarmButtonText: {
    color: "#FFF3DD",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});


