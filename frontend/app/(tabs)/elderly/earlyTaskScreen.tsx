

// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Modal,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';

// const ElderlyTaskCard = ({ task, onPress }) => {
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending':
//         return '#ff9800';
//       case 'in_progress':
//         return '#2196f3';
//       case 'completed':
//         return '#4caf50';
//       case 'cancelled':
//         return '#f44336';
//       default:
//         return '#666';
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'urgent':
//         return '#f44336';
//       case 'high':
//         return '#ff9800';
//       case 'medium':
//         return '#2196f3';
//       case 'low':
//         return '#4caf50';
//       default:
//         return '#666';
//     }
//   };

//   return (
//     <TouchableOpacity style={styles.elderlyCard} onPress={() => onPress(task)}>
//       <View style={styles.cardHeader}>
//         <Text style={styles.elderlyTitle}>{task.title}</Text>
//         <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
//           <Text style={styles.priorityText}>{task.priority?.toUpperCase()}</Text>
//         </View>
//       </View>

//       <Text style={styles.elderlyDescription}>{task.description}</Text>

//       <View style={styles.taskStatusRow}>
//         <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
//           <Text style={styles.statusText}>{task.status?.replace('_', ' ').toUpperCase()}</Text>
//         </View>
//         {task.assignedToName && (
//           <Text style={styles.assignedInfo}>{task.assignedToName} is helping</Text>
//         )}
//       </View>

//       <View style={styles.elderlyFooter}>
//         <Text style={styles.groupName}>{task.groupName}</Text>
//         <Text style={styles.elderlyTimestamp}>
//           {new Date(task.createdAt).toLocaleDateString()}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// };

// const ElderlyTaskDetailModal = ({ task, visible, onClose, groupMembers }) => {
//   if (!task) return null;

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="pageSheet"
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalContainer}>
//         <View style={styles.elderlyModalHeader}>
//           <Text style={styles.elderlyModalTitle}>Your Request Details</Text>
//           <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//             <Text style={styles.closeButtonText}>✕</Text>
//           </TouchableOpacity>
//         </View>

//         <ScrollView style={styles.modalContent}>
//           <View style={styles.elderlyDetailSection}>
//             <Text style={styles.elderlyDetailLabel}>What you asked for:</Text>
//             <Text style={styles.elderlyDetailValue}>{task.title}</Text>
//           </View>

//           <View style={styles.elderlyDetailSection}>
//             <Text style={styles.elderlyDetailLabel}>Details:</Text>
//             <Text style={styles.elderlyDetailValue}>{task.description}</Text>
//           </View>

//           <View style={styles.elderlyDetailSection}>
//             <Text style={styles.elderlyDetailLabel}>Status:</Text>
//             <Text
//               style={[
//                 styles.elderlyDetailValue,
//                 {
//                   color:
//                     task.status === 'completed'
//                       ? '#4caf50'
//                       : task.status === 'in_progress'
//                       ? '#2196f3'
//                       : '#ff9800',
//                   fontWeight: 'bold'
//                 }
//               ]}
//             >
//               {task.status === 'pending'
//                 ? 'Waiting for family help'
//                 : task.status === 'in_progress'
//                 ? 'Someone is helping you'
//                 : task.status === 'completed'
//                 ? 'All done!'
//                 : task.status}
//             </Text>
//           </View>

//           {task.assignedToName && (
//             <View style={styles.elderlyDetailSection}>
//               <Text style={styles.elderlyDetailLabel}>Who is helping:</Text>
//               <Text style={styles.elderlyDetailValue}>{task.assignedToName}</Text>
//             </View>
//           )}

//           <View style={styles.elderlyDetailSection}>
//             <Text style={styles.elderlyDetailLabel}>Your Family Group:</Text>
//             <Text style={styles.elderlyDetailValue}>{task.groupName}</Text>
//           </View>

//           {groupMembers && groupMembers.length > 0 && (
//             <View style={styles.elderlyDetailSection}>
//               <Text style={styles.elderlyDetailLabel}>Family Members who can help:</Text>
//               {groupMembers.map((member, index) => (
//                 <View key={index} style={styles.memberCard}>
//                   <Text style={styles.memberName}>{member.name}</Text>
//                   <Text style={styles.memberRole}>({member.role})</Text>
//                 </View>
//               ))}
//             </View>
//           )}

//           <View style={styles.elderlyDetailSection}>
//             <Text style={styles.elderlyDetailLabel}>When you asked:</Text>
//             <Text style={styles.elderlyDetailValue}>
//               {new Date(task.createdAt).toLocaleDateString()} at{' '}
//               {new Date(task.createdAt).toLocaleTimeString()}
//             </Text>
//           </View>

//           {task.completedAt && (
//             <View style={styles.elderlyDetailSection}>
//               <Text style={styles.elderlyDetailLabel}>Completed on:</Text>
//               <Text style={styles.elderlyDetailValue}>
//                 {new Date(task.completedAt).toLocaleDateString()} at{' '}
//                 {new Date(task.completedAt).toLocaleTimeString()}
//               </Text>
//             </View>
//           )}
//         </ScrollView>
//       </View>
//     </Modal>
//   );
// };

// const ElderlyTaskScreen = () => {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedTask, setSelectedTask] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [groupMembers, setGroupMembers] = useState([]);

//   const API_BASE_URL = 'https://elderlybackend.onrender.com/api';
  
//   // 🔒 Hardcoded token for development
//   const HARDCODED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODRmYjRkMjVmMGQ4YTVjZGY2MWY3ODEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiZWxkZXJseSIsImlhdCI6MTc1MDA1NDE3MiwiZXhwIjoxNzUwNjU4OTcyfQ.rSGMq29DsrX_wYFi44CiDFrdqzg_UBAt-4m8H0Wb3sw';
//   const HARDCODED_USER_ID = '684fb4d25f0d8a5cdf61f781';

//   const getToken = async () => {
//     try {
//       console.log('🔑 Getting token...');
//       console.log('🔑 Token length:', HARDCODED_TOKEN.length);
//       console.log('🔑 Token starts with:', HARDCODED_TOKEN.substring(0, 20) + '...');
//       return HARDCODED_TOKEN;
//     } catch (error) {
//       console.error('❌ Error getting token:', error);
//       return null;
//     }
//   };

// const fetchTasks = async () => {
//   setLoading(true);
//   try {
//     const token = await getToken();
//     if (!token) {
//       Alert.alert('Error', 'Please login first');
//       return;
//     }

//     // ✅ FIXED: Removed the extra /api and used correct endpoint
//     const response = await fetch(
//       `${API_BASE_URL}/task`, // Changed from /api/task to /task
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     console.log('Response status:', response.status);

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.log('Error response:', errorText);
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const json = await response.json();
//     console.log('Success response:', json);

//     if (json.success) {
//       const mappedTasks = json.data.tasks.map((task) => ({
//         id: task._id,
//         title: task.title,
//         description: task.description,
//         status: task.status,
//         priority: task.priority,
//         taskType: task.taskType,
//         groupName: task.groupId?.name || 'Unknown Group',
//         groupId: task.groupId?._id,
//         assignedToName: task.assignedTo?.name || null,
//         assignedToId: task.assignedTo?._id || null,
//         createdByName: task.userId?.name || 'Unknown',
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//         completedAt: task.completedAt
//       }));
//       setTasks(mappedTasks);
//     } else {
//       Alert.alert('Error', json.message || 'Failed to load your requests');
//     }
//   } catch (error) {
//     console.error('Fetch tasks error:', error);
//     Alert.alert('Error', 'Failed to fetch your requests');
//   } finally {
//     setLoading(false);
//     setRefreshing(false);
//   }
// };


//   const fetchGroupMembers = async (groupId) => {
//     console.log('👥 === FETCHING GROUP MEMBERS ===');
//     console.log('👥 Group ID:', groupId);
    
//     try {
//       const token = await getToken();
//       const url = `${API_BASE_URL}/groups/${groupId}/members`;
//       console.log('👥 Request URL:', url);
      
//       const response = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('👥 Response status:', response.status);
//       const responseText = await response.text();
//       console.log('👥 Response body:', responseText);

//       const json = JSON.parse(responseText);
      
//       if (json.success) {
//         console.log('👥 Group members fetched successfully');
//         const members = json.data.group.members.map((member) => ({
//           name: member.userId.name,
//           role: member.role
//         }));
//         console.log('👥 Mapped members:', members);
//         setGroupMembers(members);
//       } else {
//         console.log('👥 Failed to fetch group members:', json.message);
//       }
//     } catch (error) {
//       console.error('❌ Error fetching group members:', error);
//     }
//   };

//   const handleTaskPress = async (task) => {
//     console.log('📱 Task pressed:', task.title);
//     setSelectedTask(task);
//     if (task.groupId) {
//       await fetchGroupMembers(task.groupId);
//     }
//     setModalVisible(true);
//   };

//   const onRefresh = () => {
//     console.log('🔄 Refreshing tasks...');
//     setRefreshing(true);
//     fetchTasks();
//   };

//   useEffect(() => {
//     console.log('🎯 Component mounted, fetching initial tasks...');
//     fetchTasks();
//   }, []);

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text style={styles.elderlyLoadingText}>Loading your requests...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.elderlyHeader}>
//         <Text style={styles.elderlyHeaderTitle}>Your Requests</Text>
//         <Text style={styles.elderlyTaskCount}>{tasks.length} requests</Text>
//       </View>

//       <FlatList
//         data={tasks}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => <ElderlyTaskCard task={item} onPress={handleTaskPress} />}
//         contentContainerStyle={styles.listContainer}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         ListEmptyComponent={() => (
//           <View style={styles.elderlyEmptyContainer}>
//             <Text style={styles.elderlyEmptyText}>No requests yet</Text>
//             <Text style={styles.elderlyEmptySubtext}>
//               Your family will see any help requests you make
//             </Text>
//           </View>
//         )}
//       />

//       <ElderlyTaskDetailModal
//         task={selectedTask}
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         groupMembers={groupMembers}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa'
//   },
//   elderlyHeader: {
//     backgroundColor: '#4caf50',
//     padding: 25,
//     paddingTop: 60,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20
//   },
//   elderlyHeaderTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: 'white',
//     textAlign: 'center'
//   },
//   elderlyTaskCount: {
//     fontSize: 18,
//     color: 'white',
//     textAlign: 'center',
//     marginTop: 5,
//     opacity: 0.9
//   },
//   listContainer: {
//     padding: 20,
//     paddingBottom: 30
//   },
//   elderlyCard: {
//     backgroundColor: 'white',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 3 },
//     elevation: 5,
//     borderLeftWidth: 4,
//     borderLeftColor: '#4caf50'
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 10
//   },
//   elderlyTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     flex: 1,
//     marginRight: 10
//   },
//   priorityBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 15,
//     minWidth: 70
//   },
//   priorityText: {
//     color: 'white',
//     fontSize: 11,
//     fontWeight: 'bold',
//     textAlign: 'center'
//   },
//   elderlyDescription: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 15,
//     lineHeight: 24
//   },
//   taskStatusRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 15
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 10
//   },
//   statusText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold'
//   },
//   assignedInfo: {
//     fontSize: 14,
//     color: '#4caf50',
//     fontWeight: 'bold',
//     flex: 1,
//     textAlign: 'right'
//   },
//   elderlyFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
//   groupName: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500'
//   },
//   elderlyTimestamp: {
//     fontSize: 12,
//     color: '#999'
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa'
//   },
//   elderlyLoadingText: {
//     marginTop: 15,
//     fontSize: 18,
//     color: '#666'
//   },
//   elderlyEmptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 100
//   },
//   elderlyEmptyText: {
//     fontSize: 22,
//     color: '#666',
//     marginBottom: 10,
//     textAlign: 'center'
//   },
//   elderlyEmptySubtext: {
//     fontSize: 16,
//     color: '#999',
//     textAlign: 'center',
//     paddingHorizontal: 40
//   },
//   // Modal styles
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'white'
//   },
//   elderlyModalHeader: {
//     backgroundColor: '#4caf50',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 25,
//     paddingTop: 60
//   },
//   elderlyModalTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: 'white'
//   },
//   closeButton: {
//     width: 35,
//     height: 35,
//     borderRadius: 17,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   closeButtonText: {
//     fontSize: 18,
//     color: 'white',
//     fontWeight: 'bold'
//   },
//   modalContent: {
//     flex: 1,
//     padding: 25
//   },
//   elderlyDetailSection: {
//     marginBottom: 25
//   },
//   elderlyDetailLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#4caf50',
//     marginBottom: 8
//   },
//   elderlyDetailValue: {
//     fontSize: 18,
//     color: '#333',
//     lineHeight: 26
//   },
//   memberCard: {
//     backgroundColor: '#f0f8f0',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 8,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
//   memberName: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '500'
//   },
//   memberRole: {
//     fontSize: 14,
//     color: '#666',
//     textTransform: 'capitalize'
//   }
// });

// export default ElderlyTaskScreen;









// ElderlyTaskScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  View,
  AppState,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '../../../utils/NotificationService';
import ElderlyTaskCard from './ElderlyTaskCard';
import ElderlyTaskDetailModal from './ElderlyTaskDetailModal';

const ElderlyTaskScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);

  const API_BASE_URL = 'https://elderlybackend.onrender.com/api';

  // Initialize notifications when component mounts
  useEffect(() => {
    initializeNotifications();
    fetchTasks();
    
    // Listen for notification responses
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Listen for app state changes
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      appStateSubscription?.remove();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      await NotificationService.requestPermissions();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const handleNotificationResponse = (response) => {
    const { taskId } = response.notification.request.content.data;
    if (taskId) {
      // Navigate to specific task or show task details
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
        setModalVisible(true);
      }
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      // Refresh tasks when app becomes active
      fetchTasks();
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const fetchTasks = async () => {
    setLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/task`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      if (json.success && json.data?.tasks) {
        const mappedTasks = json.data.tasks.map((task) => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          taskType: task.taskType,
          groupName: task.groupId?.name || 'Unknown Group',
          groupId: task.groupId?._id,
          assignedToName: task.assignedTo?.name || null,
          assignedToId: task.assignedTo?._id || null,
          createdByName: task.userId?.name || 'Unknown',
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          completedAt: task.completedAt,
          // Add alarm properties if they exist in storage
          alarmTime: task.alarmTime ? new Date(task.alarmTime) : undefined,
          notificationId: task.notificationId,
        }));

        setTasks(mappedTasks);
      } else {
        Alert.alert('Error', json.message || 'Failed to load your requests');
      }
    } catch (error) {
      console.error('Fetch tasks error:', error);
      Alert.alert('Error', 'Failed to fetch your requests. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTaskPress = async (task) => {
    setSelectedTask(task);
    if (task.groupId) {
      await fetchGroupMembers(task.groupId);
    }
    setModalVisible(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-yellow-50">
        <ActivityIndicator size="large" color="#4caf50" />
        <Text className="mt-4 text-lg text-gray-600">Loading your requests...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-yellow-50">
      <View className="bg-green-500 px-6 pt-16 pb-6 rounded-b-3xl">
        <Text className="text-3xl font-bold text-white text-center">
          Your Requests
        </Text>
        <Text className="text-lg text-white text-center mt-1 opacity-90">
          {tasks.length} requests
        </Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ElderlyTaskCard 
            task={item} 
            onPress={handleTaskPress}
            onTaskUpdate={handleTaskUpdate}
          />
        )}
        className="px-5 pt-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center pt-24">
            <Text className="text-2xl text-gray-600 mb-3">No requests yet</Text>
            <Text className="text-base text-gray-500 text-center px-10">
              Your family will see any help requests you make
            </Text>
          </View>
        )}
      />

      <ElderlyTaskDetailModal
        task={selectedTask}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        groupMembers={groupMembers}
      />
    </View>
  );
};

export default ElderlyTaskScreen;
