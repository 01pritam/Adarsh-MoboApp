// import React, { useEffect, useState } from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   ActivityIndicator,
//   FlatList
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function CreateGroupScreen() {
//   // Create Group State
//   const [groupName, setGroupName] = useState('');
//   const [groupDescription, setGroupDescription] = useState('');
//   const [groupType, setGroupType] = useState('family');
//   // Join Group State
//   const [joinGroupId, setJoinGroupId] = useState('');
//   // UI State
//   const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
//   const [loading, setLoading] = useState(false);

//   // Existing group state
//   const [storedGroupId, setStoredGroupId] = useState<string | null>(null);
//   const [group, setGroup] = useState<any>(null);

//   // On mount, check for groupId in AsyncStorage
//   useEffect(() => {
//     AsyncStorage.getItem('groupId')
//       .then(id => {
//         setStoredGroupId(id);
//         if (id) fetchGroupInfo(id);
//       })
//       .catch(e => console.error('AsyncStorage error:', e));
//   }, []);

//   // Fetch group info if groupId exists
//   const fetchGroupInfo = async (id: string) => {
//   setLoading(true);
//   try {
//     const token = await AsyncStorage.getItem('accessToken');
//     const res = await fetch(
//       `https://elderlybackend.onrender.com/api/group/info/${id}`,
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     const data = await res.json();

//     // ✅ Structured Logging
//     console.log('--- Group Info Fetched ---');
//     console.log('Success:', data.success);
//     console.log('Message:', data.message);

//     if (!res.ok) throw new Error(data.message);

//     const group = data.group;
//     console.log('Group ID:', group._id);
//     console.log('Group Name:', group.name);
//     console.log('Description:', group.description);
//     console.log('Group Type:', group.groupType);
//     console.log('Is Active:', group.isActive);
//     console.log('Created At:', group.createdAt);
//     console.log('Updated At:', group.updatedAt);

//     console.log('\nSettings:');
//     console.log('  Allow Member Invite:', group.settings.allowMemberInvite);
//     console.log('  Require Approval:', group.settings.requireApproval);
//     console.log('  Max Members:', group.settings.maxMembers);

//     console.log('\nCreated By:');
//     console.log('  ID:', group.createdBy._id);
//     console.log('  Name:', group.createdBy.name);
//     console.log('  Email:', group.createdBy.email);

//     console.log('\nMembers:');
//     group.members.forEach((member: any, index: number) => {
//       console.log(`  #${index + 1}`);
//       console.log('    User ID:', member.userId._id);
//       console.log('    Name:', member.userId.name);
//       console.log('    Email:', member.userId.email);
//       console.log('    Role:', member.role);
//       console.log('    Added By:', member.addedBy);
//       console.log('    Added At:', member.addedAt);
//       console.log('    Entry ID:', member._id);
//     });
//     const elderlyMembers = group.members.filter(
//   (member: any) => member.role === 'elderly'
// );

// if (elderlyMembers.length > 0) {
//   await AsyncStorage.setItem('elderlyMembers', JSON.stringify(elderlyMembers));
//   console.log('Elderly members stored in AsyncStorage.');
// } else {
//   console.log('No elderly members found.');
// }
//     // Set group state
//     setGroup(group);
//   } catch (err: any) {
//     Alert.alert('Error', err.message || 'Failed to fetch group info');
//   } finally {
//     setLoading(false);
//   }
// };

//   // Create Group
//   const createGroup = async () => {
//     if (!groupName.trim()) {
//       Alert.alert('Validation Error', 'Group name is required');
//       return;
//     }
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('accessToken');
//       if (!token) {
//         Alert.alert('Authentication Error', 'Please login again');
//         return;
//       }
//       const payload = {
//         name: groupName.trim(),
//         description: groupDescription.trim(),
//         groupType: groupType
//       };
//       const response = await fetch('https://elderlybackend.onrender.com/api/group', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(payload)
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
//       Alert.alert('Success', `Group "${groupName}" created successfully!`);
//       // Save groupId and fetch group info
//       if (data.group && data.group._id) {
//         await AsyncStorage.setItem('groupId', data.group._id);
//         setStoredGroupId(data.group._id);
//         fetchGroupInfo(data.group._id);
//       }
//       setGroupName('');
//       setGroupDescription('');
//       setGroupType('family');
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to create group');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Join Group
//   const joinGroup = async () => {
//     if (!joinGroupId.trim()) {
//       Alert.alert('Validation Error', 'Group ID is required');
//       return;
//     }
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('accessToken');
//       if (!token) {
//         Alert.alert('Authentication Error', 'Please login again');
//         return;
//       }
//       const response = await fetch('https://elderlybackend.onrender.com/api/group/join', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ groupId: joinGroupId.trim() })
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
//       Alert.alert('Success', 'Successfully joined the group!');
//       await AsyncStorage.setItem('groupId', joinGroupId.trim());
//       setStoredGroupId(joinGroupId.trim());
//       fetchGroupInfo(joinGroupId.trim());
//       setJoinGroupId('');
//     } catch (error: any) {
//       Alert.alert('Error', error.message || 'Failed to join group');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Render member item
//   const renderMember = ({ item }: { item: any }) => (
//     <View style={styles.memberCard}>
//       <View>
//         <Text style={styles.memberName}>{item.userId.name}</Text>
//         <Text style={styles.memberRole}>{item.role}</Text>
//       </View>
//       <Text style={styles.memberEmail}>{item.userId.email}</Text>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007AFF" />
//       </View>
//     );
//   }

//   // If group exists, show group info and members
//   if (group) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Text style={styles.groupTitle}>{group.name}</Text>
//         <Text style={styles.groupDesc}>{group.description}</Text>
//         <View style={styles.settingsBox}>
//           <Text style={styles.settingsTitle}>Group Settings:</Text>
//           <Text>Allow Member Invite: {group.settings?.allowMemberInvite ? 'Yes' : 'No'}</Text>
//           <Text>Require Approval: {group.settings?.requireApproval ? 'Yes' : 'No'}</Text>
//           <Text>Max Members: {group.settings?.maxMembers ?? 'N/A'}</Text>
//         </View>
//         <Text style={styles.section}>Members ({group.members.length})</Text>
//         <FlatList
//           data={group.members}
//           keyExtractor={item => item._id}
//           renderItem={renderMember}
//         />
//       </SafeAreaView>
//     );
//   }

//   // Otherwise, show create/join UI
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <Text style={styles.header}>Group Management</Text>
//         {/* Tab Switcher */}
//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'create' && styles.activeTab]}
//             onPress={() => setActiveTab('create')}
//           >
//             <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
//               Create Group
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.tab, activeTab === 'join' && styles.activeTab]}
//             onPress={() => setActiveTab('join')}
//           >
//             <Text style={[styles.tabText, activeTab === 'join' && styles.activeTabText]}>
//               Join Group
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Create Group Form */}
//         {activeTab === 'create' && (
//           <View style={styles.formContainer}>
//             <Text style={styles.sectionTitle}>Create New Group</Text>
//             <Text style={styles.label}>Group Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter group name"
//               value={groupName}
//               onChangeText={setGroupName}
//               maxLength={100}
//             />
//             <Text style={styles.label}>Description</Text>
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               placeholder="Enter group description (optional)"
//               value={groupDescription}
//               onChangeText={setGroupDescription}
//               multiline
//               numberOfLines={3}
//               maxLength={500}
//             />
//             <Text style={styles.label}>Group Type</Text>
//             <View style={styles.typeContainer}>
//               {['family', 'medical', 'social'].map(type => (
//                 <TouchableOpacity
//                   key={type}
//                   style={[styles.typeChip, groupType === type && styles.selectedChip]}
//                   onPress={() => setGroupType(type)}
//                 >
//                   <Text style={[styles.chipText, groupType === type && styles.selectedChipText]}>
//                     {type.charAt(0).toUpperCase() + type.slice(1)}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//             <TouchableOpacity
//               style={[styles.button, styles.createButton]}
//               onPress={createGroup}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color="white" />
//               ) : (
//                 <Text style={styles.buttonText}>Create Group</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Join Group Form */}
//         {activeTab === 'join' && (
//           <View style={styles.formContainer}>
//             <Text style={styles.sectionTitle}>Join Existing Group</Text>
//             <Text style={styles.label}>Group ID *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter group ID to join"
//               value={joinGroupId}
//               onChangeText={setJoinGroupId}
//               autoCapitalize="none"
//             />
//             <View style={styles.infoBox}>
//               <Text style={styles.infoText}>
//                 💡 Ask your family member or group admin for the Group ID to join their group.
//               </Text>
//             </View>
//             <TouchableOpacity
//               style={[styles.button, styles.joinButton]}
//               onPress={joinGroup}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator color="white" />
//               ) : (
//                 <Text style={styles.buttonText}>Join Group</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f8f9fa' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#2c3e50' },
//   tabContainer: { flexDirection: 'row', margin: 20, backgroundColor: '#ecf0f1', borderRadius: 25, padding: 4 },
//   tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 20 },
//   activeTab: { backgroundColor: '#3498db' },
//   tabText: { fontSize: 16, fontWeight: '600', color: '#7f8c8d' },
//   activeTabText: { color: 'white' },
//   formContainer: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20, textAlign: 'center' },
//   label: { fontSize: 16, fontWeight: '600', color: '#34495e', marginBottom: 8, marginTop: 10 },
//   input: { borderWidth: 1, borderColor: '#bdc3c7', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#fafafa' },
//   textArea: { height: 80, textAlignVertical: 'top' },
//   typeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, marginBottom: 10 },
//   typeChip: { backgroundColor: '#ecf0f1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#bdc3c7' },
//   selectedChip: { backgroundColor: '#3498db', borderColor: '#2980b9' },
//   chipText: { color: '#2c3e50', fontWeight: '500' },
//   selectedChipText: { color: 'white', fontWeight: 'bold' },
//   button: { paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
//   createButton: { backgroundColor: '#27ae60' },
//   joinButton: { backgroundColor: '#3498db' },
//   buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
//   infoBox: { backgroundColor: '#e8f5e8', padding: 15, borderRadius: 10, marginTop: 10, borderLeftWidth: 4, borderLeftColor: '#27ae60' },
//   infoText: { color: '#2c3e50', fontSize: 14, lineHeight: 20 },
//   groupTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
//   groupDesc: { fontSize: 14, color: '#6C6C70', textAlign: 'center', marginBottom: 12 },
//   settingsBox: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, elevation: 1 },
//   settingsTitle: { fontWeight: 'bold', marginBottom: 4 },
//   section: { fontSize: 18, fontWeight: '600', marginVertical: 12 },
//   memberCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'white', marginBottom: 8, borderRadius: 8, elevation: 2 },
//   memberName: { fontSize: 16 },
//   memberRole: { fontSize: 14, color: '#666' },
//   memberEmail: { fontSize: 12, color: '#888' }
// });


import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface GroupMember {
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  role: 'admin' | 'member' | 'elderly' | 'family_member' | 'caregiver';
  addedBy: string;
  addedAt: string;
  _id: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  members: GroupMember[];
  groupType: string;
  isActive: boolean;
  settings: {
    allowMemberInvite: boolean;
    requireApproval: boolean;
    maxMembers: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  groupId: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  content: {
    text: string;
    type: 'text' | 'image' | 'file' | 'audio' | 'video';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  };
  replyTo?: {
    _id: string;
    content: { text: string };
    sender: string;
  };
  reactions: {
    userId: string;
    emoji: string;
    createdAt: string;
  }[];
  readBy: {
    userId: string;
    readAt: string;
  }[];
  mentions: string[];
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GroupMessageProps {
  groupId?: string;
}

export default function GroupMessageScreen({ groupId: propGroupId }: GroupMessageProps) {
  console.log('🚀 GroupMessageScreen initialized with propGroupId:', propGroupId);
  
  // ✅ FIXED: Add state for stored group ID
  const [storedGroupId, setStoredGroupId] = useState<string | null>(null);
  const [actualGroupId, setActualGroupId] = useState<string | null>(null);
  
  // Group State
  const [groupInfo, setGroupInfo] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  
  // Message State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  // UI State
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥'];

  // ✅ FIXED: First useEffect to get groupId from AsyncStorage
  useEffect(() => {
    console.log('🔄 useEffect triggered - getting groupId from AsyncStorage');
    
    const getGroupIdFromStorage = async () => {
      try {
        console.log('📱 Attempting to get groupId from AsyncStorage...');
        const storedId = await AsyncStorage.getItem('groupId');
        console.log('📱 Retrieved groupId from AsyncStorage:', storedId);
        
        // Use prop groupId if available, otherwise use stored groupId
        const finalGroupId = propGroupId || storedId;
        console.log('🎯 Final groupId to use:', finalGroupId);
        
        if (finalGroupId) {
          setStoredGroupId(storedId);
          setActualGroupId(finalGroupId);
          console.log('✅ GroupId set successfully:', finalGroupId);
        } else {
          console.error('❌ No groupId found in props or AsyncStorage');
          Alert.alert('Error', 'No group ID found. Please select a group first.');
        }
      } catch (error) {
        console.error('💥 Error getting groupId from AsyncStorage:', error);
        Alert.alert('Error', 'Failed to retrieve group information');
      }
    };

    getGroupIdFromStorage();
  }, [propGroupId]);

  // ✅ FIXED: Second useEffect to initialize component when groupId is available
  useEffect(() => {
    console.log('🔄 useEffect triggered for component initialization - actualGroupId:', actualGroupId);
    
    if (actualGroupId) {
      console.log('🎯 GroupId available, initializing component...');
      initializeComponent();
    } else {
      console.log('⏳ Waiting for groupId to be available...');
    }
  }, [actualGroupId]);

  // Animation effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const initializeComponent = async () => {
    console.log('🔧 Starting component initialization with groupId:', actualGroupId);
    try {
      console.log('📱 Getting user data from AsyncStorage...');
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      
      console.log('👤 User data retrieved:', {
        userId: userId ? userId.substring(0, 8) + '...' : 'null',
        userName,
        userEmail
      });
      
      if (!userId) {
        console.error('❌ No userId found in AsyncStorage');
        Alert.alert('Error', 'User not authenticated. Please login again.');
        return;
      }
      
      const userData = {
        _id: userId,
        name: userName,
        email: userEmail
      };
      
      setCurrentUser(userData);
      console.log('✅ Current user set:', userData);
      
      console.log('📋 Loading group info...');
      await loadGroupInfo();
      
      console.log('💬 Loading messages...');
      await loadMessages();
      
      console.log('📊 Getting unread count...');
      await getUnreadCount();
      
      console.log('🎉 Component initialization completed successfully');
    } catch (error) {
      console.error('💥 Error during component initialization:', error);
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      Alert.alert('Initialization Error', 'Failed to initialize the chat. Please try again.');
    }
  };

  // ✅ FIXED: Load group information using actualGroupId
  const loadGroupInfo = async () => {
    console.log('📋 Starting loadGroupInfo with groupId:', actualGroupId);
    
    if (!actualGroupId) {
      console.error('❌ No groupId available for loadGroupInfo');
      Alert.alert('Error', 'Group ID not available');
      return;
    }
    
    try {
      console.log('🔑 Getting access token...');
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        console.error('❌ No access token found');
        throw new Error('Authentication token not found');
      }
      
      console.log('🔑 Token retrieved:', token.substring(0, 20) + '...');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('🔍 Loading group info for ID:', actualGroupId);
      console.log('🌐 Making request to:', `https://elderlybackend.onrender.com/api/group/info/${actualGroupId}`);
      console.log('📤 Request headers:', headers);

      const response = await fetch(
        `https://elderlybackend.onrender.com/api/group/info/${actualGroupId}`,
        { headers }
      );

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      console.log('📥 Response headers:', JSON.stringify([...response.headers.entries()]));

      const data = await response.json();
      console.log('📥 Response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error('❌ API request failed:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || `HTTP ${response.status}: Failed to load group info`);
      }

      // Handle backend response structure
      const group = data.group || data; // Try both possible structures
      console.log('📋 Group data extracted:', {
        id: group._id,
        name: group.name,
        membersCount: group.members?.length || 0,
        createdBy: group.createdBy?.name || 'Unknown'
      });

      if (!group._id) {
        console.error('❌ Invalid group data structure:', group);
        throw new Error('Invalid group data received from server');
      }

      console.log('📋 Group info loaded successfully:', group.name);
      console.log('👥 Total members:', group.members.length);

      setGroupInfo(group);
      setGroupMembers(group.members);

      // Find current user's role in the group
      console.log('🔍 Finding current user role...');
      console.log('🔍 Current user ID:', currentUser?._id);
      console.log('🔍 Group members:', group.members.map((m: GroupMember) => ({
        id: m.userId._id,
        name: m.userId.name,
        role: m.role
      })));

      const currentUserMember = group.members.find(
        (member: GroupMember) => {
          console.log('🔍 Comparing:', member.userId._id, '===', currentUser?._id);
          return member.userId._id === currentUser?._id;
        }
      );

      if (currentUserMember) {
        setCurrentUserRole(currentUserMember.role);
        console.log('🎭 Current user role found:', currentUserMember.role);
      } else {
        console.warn('⚠️ Current user not found in group members');
        console.log('⚠️ Available member IDs:', group.members.map((m: GroupMember) => m.userId._id));
        console.log('⚠️ Looking for user ID:', currentUser?._id);
      }

      // Store group data in AsyncStorage
      console.log('💾 Storing group data in AsyncStorage...');
      await AsyncStorage.multiSet([
        ['groupInfo', JSON.stringify(group)],
        ['groupMembers', JSON.stringify(group.members)],
        ['userRole', currentUserMember?.role || '']
      ]);

      console.log('✅ Group info stored in AsyncStorage successfully');

    } catch (error: any) {
      console.error('💥 Error in loadGroupInfo:', error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      
      if (error.message.includes('Network')) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        Alert.alert('Authentication Error', 'Please login again.');
      } else {
        Alert.alert('Error', error.message || 'Failed to load group information');
      }
    }
  };

  // Get auth headers
  const getAuthHeaders = async () => {
    console.log('🔑 Getting auth headers...');
    const token = await AsyncStorage.getItem('accessToken');
    
    if (!token) {
      console.error('❌ No token available for auth headers');
      throw new Error('Authentication token not found');
    }
    
    console.log('🔑 Auth headers prepared with token:', token.substring(0, 20) + '...');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // ✅ FIXED: Load messages using actualGroupId
  const loadMessages = async (page = 1, append = false) => {
    console.log(`💬 Starting loadMessages - page: ${page}, append: ${append}, groupId: ${actualGroupId}`);
    
    if (!actualGroupId) {
      console.error('❌ No groupId available for loadMessages');
      return;
    }
    
    try {
      if (!append) {
        console.log('🔄 Setting loading state to true');
        setLoading(true);
      }
      
      console.log('🔑 Getting auth headers for messages...');
      const headers = await getAuthHeaders();
      
      const url = `https://elderlybackend.onrender.com/api/groupmsg/${actualGroupId}/messages?page=${page}&limit=50`;
      console.log('🌐 Making messages request to:', url);
      console.log('📤 Request headers:', headers);
      
      const response = await fetch(url, { headers });
      
      console.log('📥 Messages response status:', response.status);
      console.log('📥 Messages response ok:', response.ok);
      
      const data = await response.json();
      console.log('📥 Messages response data structure:', {
        success: data.success,
        dataExists: !!data.data,
        messagesCount: data.data?.messages?.length || 0,
        paginationExists: !!data.data?.pagination
      });
      
      if (!response.ok) {
        console.error('❌ Messages API request failed:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || `HTTP ${response.status}: Failed to load messages`);
      }
      
      const messagesData = data.data?.messages || data.messages || [];
      const paginationData = data.data?.pagination || {};
      
      console.log('📨 Messages loaded:', messagesData.length);
      console.log('📊 Pagination data:', paginationData);
      
      if (append) {
        console.log('➕ Appending messages to existing list');
        setMessages(prev => {
          console.log('📝 Previous messages count:', prev.length);
          console.log('📝 New messages count:', messagesData.length);
          const combined = [...prev, ...messagesData];
          console.log('📝 Combined messages count:', combined.length);
          return combined;
        });
      } else {
        console.log('🔄 Replacing messages list');
        setMessages(messagesData);
      }
      
      setCurrentPage(paginationData.currentPage || page);
      setTotalPages(paginationData.totalPages || 1);
      setHasMoreMessages(paginationData.hasNext || false);
      
      console.log('📊 Pagination state updated:', {
        currentPage: paginationData.currentPage || page,
        totalPages: paginationData.totalPages || 1,
        hasMore: paginationData.hasNext || false
      });
      
    } catch (error: any) {
      console.error('💥 Error in loadMessages:', error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      
      if (error.message.includes('Network')) {
        Alert.alert('Network Error', 'Failed to load messages. Please check your connection.');
      } else {
        Alert.alert('Error', error.message || 'Failed to load messages');
      }
    } finally {
      console.log('🏁 loadMessages finally block - setting loading states to false');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ FIXED: Send message using actualGroupId
  const sendMessage = async () => {
    console.log('📤 Starting sendMessage with groupId:', actualGroupId);
    console.log('📝 Message content:', newMessage.trim());
    console.log('↩️ Replying to:', replyingTo?._id || 'none');
    
    if (!actualGroupId) {
      console.error('❌ No groupId available for sendMessage');
      Alert.alert('Error', 'Group ID not available');
      return;
    }
    
    if (!newMessage.trim() && !replyingTo) {
      console.log('⚠️ No message content to send');
      return;
    }
    
    try {
      console.log('🔑 Getting auth headers for send message...');
      const headers = await getAuthHeaders();
      
      const payload: any = {
        content: {
          text: newMessage.trim(),
          type: 'text'
        }
      };
      
      if (replyingTo) {
        payload.replyTo = replyingTo._id;
        console.log('↩️ Adding reply reference:', replyingTo._id);
      }
      
      console.log('📤 Send message payload:', JSON.stringify(payload, null, 2));
      
      const url = `https://elderlybackend.onrender.com/api/groupmsg/${actualGroupId}/messages`;
      console.log('🌐 Sending message to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Send message response status:', response.status);
      console.log('📥 Send message response ok:', response.ok);
      
      const data = await response.json();
      console.log('📥 Send message response data:', JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        console.error('❌ Send message API request failed:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || `HTTP ${response.status}: Failed to send message`);
      }
      
      console.log('✅ Message sent successfully');
      
      const sentMessage = data.data?.message || data.message;
      console.log('📨 Sent message data:', {
        id: sentMessage._id,
        text: sentMessage.content.text,
        sender: sentMessage.sender.name
      });
      
      // Add message to top of list
      setMessages(prev => {
        console.log('📝 Adding message to list - previous count:', prev.length);
        const updated = [sentMessage, ...prev];
        console.log('📝 Updated messages count:', updated.length);
        return updated;
      });
      
      setNewMessage('');
      setReplyingTo(null);
      console.log('🧹 Cleared input and reply state');
      
      // Scroll to bottom
      setTimeout(() => {
        console.log('📜 Scrolling to top of messages');
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
      
    } catch (error: any) {
      console.error('💥 Error in sendMessage:', error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      
      if (error.message.includes('Network')) {
        Alert.alert('Network Error', 'Failed to send message. Please check your connection.');
      } else {
        Alert.alert('Error', error.message || 'Failed to send message');
      }
    }
  };

  // Edit message - FIXED API endpoint
  const editMessage = async (messageId: string, newText: string) => {
    console.log('✏️ Starting editMessage...');
    console.log('📝 Message ID:', messageId);
    console.log('📝 New text:', newText);
    
    try {
      const headers = await getAuthHeaders();
      
      const payload = {
        content: { text: newText }
      };
      
      console.log('📤 Edit message payload:', JSON.stringify(payload, null, 2));
      
      const url = `https://elderlybackend.onrender.com/api/groupmsg/messages/${messageId}`;
      console.log('🌐 Editing message at:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Edit message response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Edit message response data:', JSON.stringify(data, null, 2));
      
      if (!response.ok) {
        console.error('❌ Edit message API request failed:', {
          status: response.status,
          data
        });
        throw new Error(data.message || 'Failed to edit message');
      }
      
      console.log('✅ Message edited successfully');
      
      // Update message in list
      const updatedMessage = data.data?.message || data.message;
      setMessages(prev => {
        const updated = prev.map(msg => 
          msg._id === messageId ? { ...msg, ...updatedMessage } : msg
        );
        console.log('📝 Updated message in list');
        return updated;
      });
      
      setEditingMessage(null);
      console.log('🧹 Cleared editing state');
      
    } catch (error: any) {
      console.error('💥 Error in editMessage:', error);
      Alert.alert('Error', error.message || 'Failed to edit message');
    }
  };

  // Delete message - FIXED API endpoint
  const deleteMessage = async (messageId: string) => {
    console.log('🗑️ Starting deleteMessage for ID:', messageId);
    
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('❌ Delete cancelled by user')
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('🗑️ User confirmed delete');
            try {
              const headers = await getAuthHeaders();
              
              const url = `https://elderlybackend.onrender.com/api/groupmsg/messages/${messageId}`;
              console.log('🌐 Deleting message at:', url);
              
              const response = await fetch(url, { 
                method: 'DELETE', 
                headers 
              });
              
              console.log('📥 Delete message response status:', response.status);
              
              if (response.ok) {
                console.log('✅ Message deleted successfully');
                setMessages(prev => {
                  const filtered = prev.filter(msg => msg._id !== messageId);
                  console.log('📝 Removed message from list - remaining:', filtered.length);
                  return filtered;
                });
              } else {
                const data = await response.json();
                console.error('❌ Delete message failed:', data);
                throw new Error(data.message || 'Failed to delete message');
              }
            } catch (error: any) {
              console.error('💥 Error in deleteMessage:', error);
              Alert.alert('Error', 'Failed to delete message');
            }
          }
        }
      ]
    );
  };

  // Add reaction - FIXED API endpoint
  const addReaction = async (messageId: string, emoji: string) => {
    console.log('😀 Starting addReaction...');
    console.log('📝 Message ID:', messageId);
    console.log('😀 Emoji:', emoji);
    
    try {
      const headers = await getAuthHeaders();
      
      const payload = { emoji };
      console.log('📤 Add reaction payload:', JSON.stringify(payload));
      
      const url = `https://elderlybackend.onrender.com/api/groupmsg/messages/${messageId}/reactions`;
      console.log('🌐 Adding reaction at:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Add reaction response status:', response.status);
      
      if (response.ok) {
        console.log('✅ Reaction added successfully');
        console.log('🔄 Reloading messages to get updated reactions');
        await loadMessages(1);
      } else {
        const data = await response.json();
        console.error('❌ Add reaction failed:', data);
        throw new Error(data.message || 'Failed to add reaction');
      }
      
      setShowReactionPicker(null);
      console.log('🧹 Cleared reaction picker');
      
    } catch (error: any) {
      console.error('💥 Error in addReaction:', error);
      Alert.alert('Error', 'Failed to add reaction');
    }
  };

  // ✅ FIXED: Mark messages as read using actualGroupId
  const markAsRead = async (messageId?: string) => {
    console.log('👁️ Starting markAsRead with groupId:', actualGroupId);
    console.log('📝 Message ID:', messageId || 'all messages');
    
    if (!actualGroupId) {
      console.error('❌ No groupId available for markAsRead');
      return;
    }
    
    try {
      const headers = await getAuthHeaders();
      const url = messageId 
        ? `https://elderlybackend.onrender.com/api/groupmsg/messages/${messageId}/read`
        : `https://elderlybackend.onrender.com/api/groupmsg/${actualGroupId}/messages/read-all`;
      
      console.log('🌐 Marking as read at:', url);
      
      const response = await fetch(url, { method: 'POST', headers });
      
      console.log('📥 Mark as read response status:', response.status);
      
      if (response.ok) {
        console.log('✅ Messages marked as read successfully');
        if (!messageId) {
          setUnreadCount(0);
          console.log('📊 Reset unread count to 0');
        }
      } else {
        const data = await response.json();
        console.error('❌ Mark as read failed:', data);
      }
      
    } catch (error: any) {
      console.error('💥 Error in markAsRead:', error);
    }
  };

  // ✅ FIXED: Get unread count using actualGroupId
  const getUnreadCount = async () => {
    console.log('📊 Starting getUnreadCount with groupId:', actualGroupId);
    
    if (!actualGroupId) {
      console.error('❌ No groupId available for getUnreadCount');
      return;
    }
    
    try {
      const headers = await getAuthHeaders();
      
      const url = `https://elderlybackend.onrender.com/api/groupmsg/${actualGroupId}/messages/unread-count`;
      console.log('🌐 Getting unread count from:', url);
      
      const response = await fetch(url, { headers });
      
      console.log('📥 Unread count response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Unread count response data:', JSON.stringify(data, null, 2));
      
      if (response.ok) {
        const count = data.data?.unreadCount || data.unreadCount || 0;
        console.log('📊 Unread count retrieved:', count);
        setUnreadCount(count);
      } else {
        console.error('❌ Get unread count failed:', data);
      }
    } catch (error: any) {
      console.error('💥 Error in getUnreadCount:', error);
    }
  };

  // Load more messages
  const loadMoreMessages = () => {
    console.log('📜 loadMoreMessages called');
    console.log('📊 hasMoreMessages:', hasMoreMessages);
    console.log('📊 loading:', loading);
    console.log('📊 currentPage:', currentPage);
    
    if (hasMoreMessages && !loading) {
      console.log('📜 Loading more messages - page:', currentPage + 1);
      loadMessages(currentPage + 1, true);
    } else {
      console.log('📜 Not loading more messages - conditions not met');
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    console.log('🕐 Formatting time for:', dateString);
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      const diffInDays = diffInHours / 24;
      
      let formatted;
      if (diffInHours < 1) {
        formatted = 'now';
      } else if (diffInHours < 24) {
        formatted = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInDays < 7) {
        formatted = date.toLocaleDateString([], { weekday: 'short' });
      } else {
        formatted = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
      
      console.log('🕐 Formatted time:', formatted);
      return formatted;
    } catch (error) {
      console.error('💥 Error formatting time:', error);
      return 'Invalid date';
    }
  };

  // Get member color by role - supports all backend roles
  const getMemberRoleColor = (role: string) => {
    console.log('🎨 Getting color for role:', role);
    const colors = {
      'admin': '#FF6B6B',
      'elderly': '#4ECDC4',
      'family_member': '#45B7D1',
      'caregiver': '#96CEB4',
      'member': '#FFEAA7'
    };
    const color = colors[role as keyof typeof colors] || '#DDA0DD';
    console.log('🎨 Role color:', color);
    return color;
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    console.log('📛 Getting display name for role:', role);
    const displayNames = {
      'family_member': 'Family',
      'caregiver': 'Caregiver',
      'elderly': 'Elderly',
      'admin': 'Admin',
      'member': 'Member'
    };
    const displayName = displayNames[role as keyof typeof displayNames] || role;
    console.log('📛 Role display name:', displayName);
    return displayName;
  };

  // Get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Render user avatar
  const renderAvatar = (user: any, size: number = 40) => {
    if (user.profilePicture) {
      return (
        <Image 
          source={{ uri: user.profilePicture }} 
          style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        />
      );
    }
    
    return (
      <View style={[styles.avatarPlaceholder, { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        backgroundColor: getMemberRoleColor(currentUserRole)
      }]}>
        <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
          {getUserInitials(user.name || 'U')}
        </Text>
      </View>
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  };

  // Render group details modal
  const renderGroupDetailsModal = () => {
    console.log('🖼️ Rendering group details modal');
    return (
      <Modal
        visible={showGroupDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          console.log('🚪 Closing group details modal');
          setShowGroupDetails(false);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Group Details</Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('❌ Group details modal close button pressed');
                setShowGroupDetails(false);
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {groupInfo ? (
              <>
                {/* Group Header */}
                <View style={styles.groupHeaderCard}>
                  <View style={styles.groupIconContainer}>
                    <Text style={styles.groupIcon}>👥</Text>
                  </View>
                  <Text style={styles.groupName}>{groupInfo.name}</Text>
                  <Text style={styles.groupDescription}>{groupInfo.description}</Text>
                  <View style={styles.groupStats}>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{groupMembers.length}</Text>
                      <Text style={styles.statLabel}>Members</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{messages.length}</Text>
                      <Text style={styles.statLabel}>Messages</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>
                        {Math.ceil((Date.now() - new Date(groupInfo.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                      </Text>
                      <Text style={styles.statLabel}>Days</Text>
                    </View>
                  </View>
                </View>

                {/* Group Info */}
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Information</Text>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Type</Text>
                    <Text style={styles.infoValue}>{groupInfo.groupType}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Created</Text>
                    <Text style={styles.infoValue}>
                      {new Date(groupInfo.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Created By</Text>
                    <Text style={styles.infoValue}>{groupInfo.createdBy.name}</Text>
                  </View>
                </View>

                {/* Settings */}
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Settings</Text>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Max Members</Text>
                    <Text style={styles.settingValue}>{groupInfo.settings.maxMembers}</Text>
                  </View>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Member Invites</Text>
                    <View style={[styles.toggleIndicator, groupInfo.settings.allowMemberInvite && styles.toggleActive]}>
                      <Text style={[styles.toggleText, groupInfo.settings.allowMemberInvite && styles.toggleTextActive]}>
                        {groupInfo.settings.allowMemberInvite ? 'Enabled' : 'Disabled'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Approval Required</Text>
                    <View style={[styles.toggleIndicator, groupInfo.settings.requireApproval && styles.toggleActive]}>
                      <Text style={[styles.toggleText, groupInfo.settings.requireApproval && styles.toggleTextActive]}>
                        {groupInfo.settings.requireApproval ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Role Distribution */}
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Role Distribution</Text>
                  <View style={styles.roleGrid}>
                    {['admin', 'elderly', 'family_member', 'caregiver', 'member'].map(role => {
                      const count = groupMembers.filter(m => m.role === role).length;
                      if (count === 0) return null;
                      
                      return (
                        <View key={role} style={styles.roleCard}>
                          <View style={[styles.roleIndicator, { backgroundColor: getMemberRoleColor(role) }]} />
                          <Text style={styles.roleCount}>{count}</Text>
                          <Text style={styles.roleLabel}>{getRoleDisplayName(role)}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.center}>
                <Text style={styles.emptyText}>No group information available</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // Render members list modal
  const renderMembersListModal = () => {
    console.log('👥 Rendering members list modal');
    return (
      <Modal
        visible={showMembersList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          console.log('🚪 Closing members list modal');
          setShowMembersList(false);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Members ({groupMembers.length})</Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('❌ Members list modal close button pressed');
                setShowMembersList(false);
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={groupMembers}
            keyExtractor={(item) => {
              console.log('🔑 Member key:', item._id);
              return item._id;
            }}
            renderItem={({ item }) => {
              console.log('👤 Rendering member:', item.userId.name, 'Role:', item.role);
              return (
                <View style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    {renderAvatar(item.userId, 50)}
                    <View style={[styles.onlineIndicator, { backgroundColor: '#4CAF50' }]} />
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberHeader}>
                      <Text style={styles.memberName}>{item.userId.name}</Text>
                      <View style={[styles.roleBadge, { backgroundColor: getMemberRoleColor(item.role) }]}>
                        <Text style={styles.roleText}>{getRoleDisplayName(item.role)}</Text>
                      </View>
                    </View>
                    <Text style={styles.memberEmail}>{item.userId.email}</Text>
                    <Text style={styles.memberDate}>
                      Joined {new Date(item.addedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
              );
            }}
            style={styles.membersList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.memberSeparator} />}
          />
        </SafeAreaView>
      </Modal>
    );
  };

  // Render message item
  const renderMessage = ({ item }: { item: Message }) => {
    console.log('💬 Rendering message:', {
      id: item._id,
      sender: item.sender.name,
      text: item.content.text.substring(0, 50) + '...',
      isOwn: item.sender._id === currentUser?._id
    });
    
    const isOwnMessage = item.sender._id === currentUser?._id;
    const hasReactions = item.reactions.length > 0;
    
    return (
      <Animated.View 
        style={[
          styles.messageContainer, 
          isOwnMessage && styles.ownMessageContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Reply indicator */}
        {item.replyTo && (
          <View style={styles.replyContainer}>
            <View style={styles.replyLine} />
            <Text style={styles.replyText}>
              Replying to: {item.replyTo.content.text}
            </Text>
          </View>
        )}
        
        {/* Message content */}
        <View style={styles.messageRow}>
          {/* Avatar for other messages */}
          {!isOwnMessage && (
            <View style={styles.messageAvatar}>
              {renderAvatar(item.sender, 32)}
            </View>
          )}
          
          {/* Message bubble */}
          <View style={[
            styles.messageBubble, 
            isOwnMessage ? styles.ownMessage : styles.otherMessage
          ]}>
            {/* Sender name for other messages */}
            {!isOwnMessage && (
              <Text style={styles.senderName}>{item.sender.name}</Text>
            )}
            
            {/* Message text */}
            <Text style={[
              styles.messageText, 
              isOwnMessage && styles.ownMessageText
            ]}>
              {item.content.text}
            </Text>
            
            {/* Message footer */}
            <View style={styles.messageFooter}>
              <Text style={[
                styles.timeText, 
                isOwnMessage && styles.ownTimeText
              ]}>
                {formatTime(item.createdAt)}
                {item.isEdited && ' • edited'}
              </Text>
              
              {/* Message status for own messages */}
              {isOwnMessage && (
                <View style={styles.messageStatus}>
                  <Text style={styles.statusIcon}>✓✓</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Avatar for own messages */}
          {isOwnMessage && (
            <View style={styles.messageAvatar}>
              {renderAvatar(item.sender, 32)}
            </View>
          )}
        </View>
        
        {/* Reactions */}
        {hasReactions && (
          <View style={[
            styles.reactionsContainer,
            isOwnMessage && styles.ownReactionsContainer
          ]}>
            {item.reactions.map((reaction, index) => {
              console.log('😀 Rendering reaction:', reaction.emoji);
              return (
                <View key={index} style={styles.reactionBubble}>
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                </View>
              );
            })}
          </View>
        )}
        
        {/* Action buttons */}
        <View style={[
          styles.messageActions,
          isOwnMessage && styles.ownMessageActions
        ]}>
          <TouchableOpacity
            onPress={() => {
              console.log('↩️ Reply button pressed for message:', item._id);
              setReplyingTo(item);
            }}
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>↩️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              console.log('😀 React button pressed for message:', item._id);
              setShowReactionPicker(item._id);
            }}
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>😊</Text>
          </TouchableOpacity>
          
          {isOwnMessage && (
            <>
              <TouchableOpacity
                onPress={() => {
                  console.log('✏️ Edit button pressed for message:', item._id);
                  setEditingMessage(item);
                }}
                style={styles.actionButton}
              >
                <Text style={styles.actionIcon}>✏️</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  console.log('🗑️ Delete button pressed for message:', item._id);
                  deleteMessage(item._id);
                }}
                style={styles.actionButton}
              >
                <Text style={styles.actionIcon}>🗑️</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    );
  };

  // Render input area
  const renderInputArea = () => {
    console.log('⌨️ Rendering input area');
    return (
      <View style={styles.inputContainer}>
        {/* Reply indicator */}
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <View style={styles.replyingToContent}>
              <Text style={styles.replyingToLabel}>Replying to {replyingTo.sender.name}</Text>
              <Text style={styles.replyingToText} numberOfLines={1}>
                {replyingTo.content.text}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                console.log('❌ Cancel reply pressed');
                setReplyingTo(null);
              }}
              style={styles.cancelReplyButton}
            >
              <Text style={styles.cancelReplyIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Input row */}
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={(text) => {
                console.log('⌨️ Message input changed:', text.length, 'characters');
                setNewMessage(text);
                // Simulate typing indicator
                if (text.length > 0) {
                  setIsTyping(true);
                  setTimeout(() => setIsTyping(false), 1000);
                }
              }}
              multiline
              maxLength={1000}
              textAlignVertical="center"
            />
            
            <TouchableOpacity style={styles.attachButton}>
              <Text style={styles.attachIcon}>📎</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={() => {
              console.log('📤 Send button pressed');
              sendMessage();
            }}
            style={[
              styles.sendButton, 
              newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendIcon}>
              {newMessage.trim() ? '🚀' : '💬'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render header
  const renderHeader = () => {
    console.log('📱 Rendering header');
    return (
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            console.log('📋 Group details button pressed');
            setShowGroupDetails(true);
          }}
          style={styles.headerLeft}
        >
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {groupInfo?.name || 'Group Chat'}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {groupMembers.length} members • {getRoleDisplayName(currentUserRole)}
            </Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            onPress={() => {
              console.log('👥 Members list button pressed');
              setShowMembersList(true);
            }}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonIcon}>👥</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              console.log('👁️ Mark all read button pressed');
              markAsRead();
            }}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonIcon}>✓</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  console.log('🖼️ Main render - loading state:', loading, 'messages count:', messages.length, 'actualGroupId:', actualGroupId);

  // ✅ FIXED: Show loading while waiting for groupId
  if (!actualGroupId) {
    console.log('⏳ Showing loading screen - waiting for groupId');
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Connecting to your group...</Text>
        </View>
      </View>
    );
  }

  if (loading && messages.length === 0) {
    console.log('⏳ Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </View>
    );
  }

  console.log('🖼️ Rendering main chat interface');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {renderHeader()}
      
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => {
            console.log('🔑 Message key:', item._id);
            return item._id;
          }}
          renderItem={renderMessage}
          inverted
          onEndReached={() => {
            console.log('📜 FlatList onEndReached triggered');
            loadMoreMessages();
          }}
          onEndReachedThreshold={0.1}
          refreshing={refreshing}
          onRefresh={() => {
            console.log('🔄 Pull to refresh triggered');
            setRefreshing(true);
            loadMessages();
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          ListFooterComponent={
            hasMoreMessages ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#667eea" />
              </View>
            ) : null
          }
        />
        
        {renderTypingIndicator()}
      </View>
      
      {renderInputArea()}
      
      {/* Group Details Modal */}
      {renderGroupDetailsModal()}
      
      {/* Members List Modal */}
      {renderMembersListModal()}
      
      {/* Reaction Picker Modal */}
      <Modal
        visible={!!showReactionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => {
          console.log('🚪 Closing reaction picker modal');
          setShowReactionPicker(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reactionPicker}>
            <Text style={styles.reactionPickerTitle}>Choose a reaction</Text>
            <View style={styles.reactionsGrid}>
              {reactions.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    console.log('😀 Reaction selected:', emoji, 'for message:', showReactionPicker);
                    showReactionPicker && addReaction(showReactionPicker, emoji);
                  }}
                  style={styles.reactionOption}
                >
                  <Text style={styles.reactionOptionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Edit Message Modal */}
      <Modal
        visible={!!editingMessage}
        transparent
        animationType="fade"
        onRequestClose={() => {
          console.log('🚪 Closing edit message modal');
          setEditingMessage(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.editModalTitle}>Edit Message</Text>
            <TextInput
              style={styles.editInput}
              value={editingMessage?.content.text || ''}
              onChangeText={(text) => {
                console.log('✏️ Edit input changed:', text.length, 'characters');
                setEditingMessage(prev => 
                  prev ? { ...prev, content: { ...prev.content, text } } : null
                );
              }}
              multiline
              autoFocus
              placeholder="Edit your message..."
              placeholderTextColor="#999"
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                onPress={() => {
                  console.log('❌ Edit cancelled');
                  setEditingMessage(null);
                }}
                style={[styles.editActionButton, styles.cancelEditButton]}
              >
                <Text style={styles.cancelEditText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  console.log('💾 Edit save pressed');
                  if (editingMessage) {
                    editMessage(editingMessage._id, editingMessage.content.text);
                  }
                }}
                style={[styles.editActionButton, styles.saveEditButton]}
              >
                <Text style={styles.saveEditText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a202c',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerButtonIcon: {
    fontSize: 18,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Messages container
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  // Typing indicator
  typingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
    typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94a3b8',
    marginHorizontal: 2,
  },
  typingDot1: {
    animationDelay: '0s',
  },
  typingDot2: {
    animationDelay: '0.2s',
  },
  typingDot3: {
    animationDelay: '0.4s',
  },
  
  // Message styles
  messageContainer: {
    marginVertical: 6,
    paddingHorizontal: 4,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  messageAvatar: {
    marginHorizontal: 8,
    marginBottom: 4,
  },
  avatar: {
    borderRadius: 16,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
  },
  
  // Message bubble
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ownMessage: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 8,
    marginLeft: 40,
  },
  otherMessage: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 8,
    marginRight: 40,
  },
  
  // Message content
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1e293b',
  },
  ownMessageText: {
    color: 'white',
  },
  
  // Message footer
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  ownTimeText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageStatus: {
    marginLeft: 8,
  },
  statusIcon: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Reply container
  replyContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  replyLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  replyText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  
  // Reactions
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginHorizontal: 4,
  },
  ownReactionsContainer: {
    justifyContent: 'flex-end',
  },
  reactionBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  
  // Message actions
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  ownMessageActions: {
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 16,
  },
  
  // Input area
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  
  // Reply indicator
  replyingToContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyingToContent: {
    flex: 1,
  },
  replyingToLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 2,
  },
  replyingToText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  cancelReplyButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  cancelReplyIcon: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  
  // Input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    maxHeight: 120,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#1e293b',
    paddingVertical: 8,
    maxHeight: 100,
  },
  attachButton: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  attachIcon: {
    fontSize: 20,
  },
  
  // Send button
  sendButton: {
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonActive: {
    backgroundColor: '#667eea',
  },
  sendButtonInactive: {
    backgroundColor: '#e2e8f0',
  },
  sendIcon: {
    fontSize: 24,
  },
  
  // Loading more
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a202c',
  },
  closeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  
  // Group details modal
  groupHeaderCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  groupIconContainer: {
    backgroundColor: '#667eea',
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupIcon: {
    fontSize: 36,
  },
  groupName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Info cards
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '600',
  },
  
  // Settings
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLabel: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '600',
  },
  toggleIndicator: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleActive: {
    backgroundColor: '#667eea',
  },
  toggleText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: 'white',
  },
  
  // Role grid
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  roleIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  roleCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Members list
  membersList: {
    flex: 1,
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  memberAvatar: {
    position: 'relative',
    marginRight: 16,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  memberInfo: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  memberEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  memberDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  memberSeparator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  
  // Reaction picker
  reactionPicker: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  reactionPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },
  reactionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reactionOption: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reactionOptionEmoji: {
    fontSize: 28,
  },
  
  // Edit modal
  editModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  editInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editActionButton: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flex: 0.45,
    alignItems: 'center',
  },
  cancelEditButton: {
    backgroundColor: '#f1f5f9',
  },
  saveEditButton: {
    backgroundColor: '#667eea',
  },
  cancelEditText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  saveEditText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // Empty state
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
