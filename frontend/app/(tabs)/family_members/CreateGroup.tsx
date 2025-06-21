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
  View,
  KeyboardAvoidingView,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Interfaces
interface Message {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  createdAt: string;
  messageType: 'text' | 'image' | 'file';
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
}

interface GroupInfo {
  _id: string;
  name: string;
  description?: string;
  groupType: string;
  members: Array<{
    _id: string;
    name: string;
    role: string;
    profilePicture?: string;
  }>;
  createdAt: string;
  settings: {
    allowMemberInvite: boolean;
    requireApproval: boolean;
    maxMembers: number;
  };
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  groupType: string;
  members?: Array<{
    _id: string;
    name: string;
    role: string;
  }>;
  createdAt: string;
}

interface GroupMessageProps {
  groupId?: string;
}

export default function GroupMessageScreen({ groupId: propGroupId }: GroupMessageProps) {
  console.log('🚀 GroupMessageScreen initialized with propGroupId:', propGroupId);
  
  // Group management states
  const [storedGroupId, setStoredGroupId] = useState<string | null>(null);
  const [actualGroupId, setActualGroupId] = useState<string | null>(null);
  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  
  // Create group form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupType, setNewGroupType] = useState('family');
  const [creatingGroup, setCreatingGroup] = useState(false);
  
  // Join group states
  const [groupCode, setGroupCode] = useState('');
  const [joiningGroup, setJoiningGroup] = useState(false);

  // Chat states
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  
  // Animation states
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);

  // Initialize animations
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

  // Get group ID and initialize
  useEffect(() => {
    console.log('🔄 useEffect triggered - getting groupId from AsyncStorage');
    
    const getGroupIdFromStorage = async () => {
      try {
        console.log('📱 Attempting to get groupId from AsyncStorage...');
        const storedId = await AsyncStorage.getItem('groupId');
        const userId = await AsyncStorage.getItem('userId');
        
        console.log('📱 Retrieved groupId from AsyncStorage:', storedId);
        console.log('📱 Retrieved userId from AsyncStorage:', userId);
        
        if (userId) {
          setCurrentUserId(userId);
        }
        
        // Use prop groupId if available, otherwise use stored groupId
        const finalGroupId = propGroupId || storedId;
        console.log('🎯 Final groupId to use:', finalGroupId);
        
        if (finalGroupId) {
          setStoredGroupId(storedId);
          setActualGroupId(finalGroupId);
          setShowGroupOptions(false);
          console.log('✅ GroupId set successfully:', finalGroupId);
        } else {
          console.log('⚠️ No groupId found - showing group options');
          setShowGroupOptions(true);
          // Load available groups for joining
          await loadAvailableGroups();
        }
      } catch (error) {
        console.error('💥 Error getting groupId from AsyncStorage:', error);
        setShowGroupOptions(true);
      }
    };

    getGroupIdFromStorage();
  }, [propGroupId]);

  // Load group info and messages when groupId is available
  useEffect(() => {
    if (actualGroupId) {
      console.log('🔄 Loading group info and messages for groupId:', actualGroupId);
      loadGroupInfo();
      loadMessages();
    }
  }, [actualGroupId]);

  // Load available groups for joining
  const loadAvailableGroups = async () => {
    console.log('📋 Loading available groups...');
    setLoadingGroups(true);
    
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ No access token found');
        return;
      }

      const response = await fetch(
        'https://elderlybackend.onrender.com/api/group/available',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableGroups(data.data?.groups || []);
        console.log('✅ Available groups loaded:', data.data?.groups?.length || 0);
      } else {
        console.error('❌ Failed to load available groups');
      }
    } catch (error) {
      console.error('💥 Error loading available groups:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Create new group
  const createGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setCreatingGroup(true);
    console.log('🆕 Creating new group:', newGroupName);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const payload = {
        name: newGroupName.trim(),
        description: newGroupDescription.trim(),
        groupType: newGroupType,
        settings: {
          allowMemberInvite: true,
          requireApproval: false,
          maxMembers: 50
        }
      };

      console.log('📤 Create group payload:', payload);

      const response = await fetch(
        'https://elderlybackend.onrender.com/api/group/create',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      console.log('📥 Create group response:', data);

      if (response.ok && data.success) {
        const newGroup = data.data.group;
        console.log('✅ Group created successfully:', newGroup._id);

        // Store the new group ID
        await AsyncStorage.setItem('groupId', newGroup._id);
        setActualGroupId(newGroup._id);
        setShowGroupOptions(false);
        setShowCreateGroup(false);
        
        // Reset form
        setNewGroupName('');
        setNewGroupDescription('');
        setNewGroupType('family');

        Alert.alert('Success', `Group "${newGroup.name}" created successfully!`);
      } else {
        throw new Error(data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('💥 Error creating group:', error);
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  // Join existing group
  const joinGroup = async (groupId: string) => {
    setJoiningGroup(true);
    console.log('🤝 Joining group:', groupId);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        `https://elderlybackend.onrender.com/api/group/${groupId}/join`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      console.log('📥 Join group response:', data);

      if (response.ok && data.success) {
        console.log('✅ Successfully joined group');

        // Store the group ID
        await AsyncStorage.setItem('groupId', groupId);
        setActualGroupId(groupId);
        setShowGroupOptions(false);
        setShowJoinGroup(false);

        Alert.alert('Success', 'Successfully joined the group!');
      } else {
        throw new Error(data.message || 'Failed to join group');
      }
    } catch (error) {
      console.error('💥 Error joining group:', error);
      Alert.alert('Error', error.message || 'Failed to join group');
    } finally {
      setJoiningGroup(false);
    }
  };

  // Join group by code
  const joinGroupByCode = async () => {
    if (!groupCode.trim()) {
      Alert.alert('Error', 'Please enter a group code');
      return;
    }

    setJoiningGroup(true);
    console.log('🔑 Joining group by code:', groupCode);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        'https://elderlybackend.onrender.com/api/group/join-by-code',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code: groupCode.trim() })
        }
      );

      const data = await response.json();
      console.log('📥 Join by code response:', data);

      if (response.ok && data.success) {
        const group = data.data.group;
        console.log('✅ Successfully joined group by code');

        // Store the group ID
        await AsyncStorage.setItem('groupId', group._id);
        setActualGroupId(group._id);
        setShowGroupOptions(false);
        setShowJoinGroup(false);
        setGroupCode('');

        Alert.alert('Success', `Successfully joined "${group.name}"!`);
      } else {
        throw new Error(data.message || 'Invalid group code');
      }
    } catch (error) {
      console.error('💥 Error joining group by code:', error);
      Alert.alert('Error', error.message || 'Invalid group code');
    } finally {
      setJoiningGroup(false);
    }
  };

  // Load group information
  const loadGroupInfo = async () => {
    if (!actualGroupId) return;

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ No access token found');
        return;
      }

      console.log('📋 Loading group info for groupId:', actualGroupId);

      const response = await fetch(
        `https://elderlybackend.onrender.com/api/group/${actualGroupId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.group) {
          setGroupInfo(data.data.group);
          console.log('✅ Group info loaded:', data.data.group.name);
        }
      } else {
        console.error('❌ Failed to load group info');
      }
    } catch (error) {
      console.error('💥 Error loading group info:', error);
    }
  };

  // Load messages
  const loadMessages = async () => {
    if (!actualGroupId) return;

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('❌ No access token found');
        return;
      }

      console.log('💬 Loading messages for groupId:', actualGroupId);

      const response = await fetch(
        `https://elderlybackend.onrender.com/api/group/${actualGroupId}/messages`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.messages) {
          setMessages(data.data.messages.reverse()); // Reverse to show newest at bottom
          console.log('✅ Messages loaded:', data.data.messages.length);
          
          // Scroll to bottom after loading messages
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } else {
        console.error('❌ Failed to load messages');
      }
    } catch (error) {
      console.error('💥 Error loading messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !actualGroupId || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('📤 Sending message:', messageText);

      const response = await fetch(
        `https://elderlybackend.onrender.com/api/group/${actualGroupId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: messageText,
            messageType: 'text'
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.message) {
          setMessages(prev => [...prev, data.data.message]);
          console.log('✅ Message sent successfully');
          
          // Scroll to bottom after sending message
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('💥 Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      // Restore message if sending failed
      setNewMessage(messageText);
    } finally {
      setSendingMessage(false);
    }
  };

  // Refresh messages
  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  // Render message item
  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId._id === currentUserId;
    
    return (
      <Animated.View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
          { opacity: fadeAnim }
        ]}
      >
        {!isOwnMessage && (
          <View style={styles.senderInfo}>
            <View style={styles.avatarContainer}>
              {item.senderId.profilePicture ? (
                <Image source={{ uri: item.senderId.profilePicture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.senderId.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.senderName}>{item.senderId.name}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  // Render group options screen
  const renderGroupOptionsScreen = () => {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        <Animated.View style={[styles.groupOptionsContainer, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.groupOptionsHeader}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.logoContainer}
            >
              <Text style={styles.logoEmoji}>👥</Text>
            </LinearGradient>
            <Text style={styles.groupOptionsTitle}>Welcome to Group Chat</Text>
            <Text style={styles.groupOptionsSubtitle}>
              Connect with your family and caregivers in a secure group environment
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setShowCreateGroup(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.optionIcon}
              >
                <MaterialIcons name="add" size={24} color="white" />
              </LinearGradient>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Create New Group</Text>
                <Text style={styles.optionDescription}>
                  Start a new group for your family or care team
                </Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setShowJoinGroup(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.optionIcon}
              >
                <MaterialIcons name="group-add" size={24} color="white" />
              </LinearGradient>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Join Existing Group</Text>
                <Text style={styles.optionDescription}>
                  Join a group using an invitation code or from available groups
                </Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Available Groups Preview */}
          {availableGroups.length > 0 && (
            <View style={styles.availableGroupsPreview}>
              <MaterialIcons name="groups" size={24} color="#10b981" />
              <Text style={styles.previewTitle}>Available Groups</Text>
              <Text style={styles.previewSubtitle}>
                {availableGroups.length} group{availableGroups.length !== 1 ? 's' : ''} available to join
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Create Group Modal */}
        {renderCreateGroupModal()}

        {/* Join Group Modal */}
        {renderJoinGroupModal()}
      </SafeAreaView>
    );
  };

  // Render create group modal
  const renderCreateGroupModal = () => {
    return (
      <Modal
        visible={showCreateGroup}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateGroup(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Group</Text>
            <TouchableOpacity 
              onPress={() => setShowCreateGroup(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              {/* Group Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Group Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter group name (e.g., Smith Family)"
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                  maxLength={50}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {/* Group Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe your group's purpose..."
                  value={newGroupDescription}
                  onChangeText={setNewGroupDescription}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              {/* Group Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Group Type</Text>
                <View style={styles.radioGroup}>
                  {[
                    { value: 'family', label: 'Family Group', icon: 'family-restroom' },
                    { value: 'care', label: 'Care Team', icon: 'local-hospital' },
                    { value: 'community', label: 'Community', icon: 'location-city' }
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.radioOption,
                        newGroupType === type.value && styles.radioOptionSelected
                      ]}
                      onPress={() => setNewGroupType(type.value)}
                    >
                      <MaterialIcons 
                        name={type.icon} 
                        size={20} 
                        color={newGroupType === type.value ? '#667eea' : '#94a3b8'} 
                      />
                      <Text style={[
                        styles.radioLabel,
                        newGroupType === type.value && styles.radioLabelSelected
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Create Button */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!newGroupName.trim() || creatingGroup) && styles.primaryButtonDisabled
                ]}
                onPress={createGroup}
                disabled={!newGroupName.trim() || creatingGroup}
              >
                <LinearGradient
                  colors={(!newGroupName.trim() || creatingGroup) ? ['#94a3b8', '#64748b'] : ['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                >
                  {creatingGroup ? (
                    <View style={styles.buttonLoading}>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={styles.primaryButtonText}>Creating...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <MaterialIcons name="add" size={20} color="white" />
                      <Text style={styles.primaryButtonText}>Create Group</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // Render join group modal
  const renderJoinGroupModal = () => {
    return (
      <Modal
        visible={showJoinGroup}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJoinGroup(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join Group</Text>
            <TouchableOpacity 
              onPress={() => setShowJoinGroup(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Join by Code */}
            <View style={styles.joinSection}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="vpn-key" size={24} color="#667eea" />
                <Text style={styles.sectionTitle}>Join by Invitation Code</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Enter the group code shared by a group member
              </Text>
              
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter group code"
                  value={groupCode}
                  onChangeText={setGroupCode}
                  autoCapitalize="characters"
                  maxLength={10}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!groupCode.trim() || joiningGroup) && styles.primaryButtonDisabled
                ]}
                onPress={joinGroupByCode}
                disabled={!groupCode.trim() || joiningGroup}
              >
                <LinearGradient
                  colors={(!groupCode.trim() || joiningGroup) ? ['#94a3b8', '#64748b'] : ['#10b981', '#059669']}
                  style={styles.buttonGradient}
                >
                  {joiningGroup ? (
                    <View style={styles.buttonLoading}>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={styles.primaryButtonText}>Joining...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <MaterialIcons name="login" size={20} color="white" />
                      <Text style={styles.primaryButtonText}>Join by Code</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Available Groups */}
            {availableGroups.length > 0 && (
              <View style={styles.joinSection}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="groups" size={24} color="#10b981" />
                  <Text style={styles.sectionTitle}>Available Groups</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Groups you can join directly
                </Text>

                {loadingGroups ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>Loading groups...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={availableGroups}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.groupCard}
                        onPress={() => joinGroup(item._id)}
                        disabled={joiningGroup}
                        activeOpacity={0.8}
                      >
                        <View style={styles.groupCardHeader}>
                          <Text style={styles.groupCardName}>{item.name}</Text>
                          <View style={[styles.groupCardBadge, { backgroundColor: getGroupTypeColor(item.groupType) }]}>
                            <Text style={styles.groupCardBadgeText}>{item.groupType}</Text>
                          </View>
                        </View>
                        <Text style={styles.groupCardDescription} numberOfLines={2}>
                          {item.description || 'No description available'}
                        </Text>
                        <View style={styles.groupCardFooter}>
                          <Text style={styles.groupCardMembers}>
                            <MaterialIcons name="people" size={14} color="#94a3b8" />
                            {' '}{item.members?.length || 0} members
                          </Text>
                          <MaterialIcons name="arrow-forward-ios" size={14} color="#667eea" />
                        </View>
                      </TouchableOpacity>
                    )}
                    scrollEnabled={false}
                  />
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // Render group details modal
  const renderGroupDetailsModal = () => {
    if (!groupInfo) return null;

    return (
      <Modal
        visible={showGroupDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGroupDetails(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Group Details</Text>
            <TouchableOpacity 
              onPress={() => setShowGroupDetails(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.groupDetailsContainer}>
              {/* Group Info */}
              <View style={styles.groupInfoSection}>
                <Text style={styles.groupName}>{groupInfo.name}</Text>
                {groupInfo.description && (
                  <Text style={styles.groupDescription}>{groupInfo.description}</Text>
                )}
                <View style={styles.groupMetadata}>
                  <View style={styles.metadataItem}>
                    <MaterialIcons name="category" size={16} color="#667eea" />
                    <Text style={styles.metadataText}>{groupInfo.groupType}</Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <MaterialIcons name="people" size={16} color="#10b981" />
                    <Text style={styles.metadataText}>{groupInfo.members.length} members</Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <MaterialIcons name="event" size={16} color="#f59e0b" />
                    <Text style={styles.metadataText}>
                      Created {new Date(groupInfo.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Members List */}
              <View style={styles.membersSection}>
                <Text style={styles.sectionTitle}>Members</Text>
                <FlatList
                  data={groupInfo.members}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <View style={styles.memberItem}>
                      <View style={styles.memberAvatar}>
                        {item.profilePicture ? (
                          <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                              {item.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{item.name}</Text>
                        <Text style={styles.memberRole}>{item.role}</Text>
                      </View>
                    </View>
                  )}
                  scrollEnabled={false}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // Helper function to get group type color
  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'family': return '#667eea';
      case 'care': return '#10b981';
      case 'community': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  console.log('🖼️ Main render - showGroupOptions:', showGroupOptions, 'actualGroupId:', actualGroupId);

  // Show group options when no group ID
  if (showGroupOptions) {
    console.log('🎯 Showing group options screen');
    return renderGroupOptionsScreen();
  }

  // Show loading while waiting for groupId
  if (!actualGroupId) {
    console.log('⏳ Showing loading screen - waiting for groupId');
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingContent}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Connecting to your group...</Text>
        </LinearGradient>
      </View>
    );
  }

  // Main chat interface
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => setShowGroupDetails(true)}
            style={styles.headerInfo}
          >
            <Text style={styles.headerTitle}>
              {groupInfo?.name || 'Group Chat'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {groupInfo?.members.length || 0} members
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowGroupDetails(true)}
          >
            <MaterialIcons name="info" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages List */}
      <Animated.View style={[styles.messagesContainer, { opacity: fadeAnim }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          />
        )}
      </Animated.View>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Animated.View 
          style={[
            styles.inputContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              ref={textInputRef}
              style={styles.messageInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
              placeholderTextColor="#94a3b8"
              editable={!sendingMessage}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || sendingMessage) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || sendingMessage}
            >
              <LinearGradient
                colors={(!newMessage.trim() || sendingMessage) ? ['#94a3b8', '#64748b'] : ['#667eea', '#764ba2']}
                style={styles.sendButtonGradient}
              >
                {sendingMessage ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialIcons name="send" size={20} color="white" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Group Details Modal */}
      {renderGroupDetailsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages Styles
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageContainer: {
    marginBottom: 16,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  senderName: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ownMessageBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#94a3b8',
  },

  // Input Styles
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Group Options Screen
  groupOptionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
  },
  groupOptionsHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoEmoji: {
    fontSize: 36,
  },
  groupOptionsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  groupOptionsSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  // Options Container
  optionsContainer: {
    paddingVertical: 20,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },

  // Available Groups Preview
  availableGroupsPreview: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4,
    marginTop: 8,
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 40,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Form Styles
  formContainer: {
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  // Radio Group
  radioGroup: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  radioOptionSelected: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  radioLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    marginLeft: 12,
  },
  radioLabelSelected: {
    color: '#667eea',
    fontWeight: '600',
  },

  // Buttons
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Join Group Styles
  joinSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },

  // Group Cards
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  groupCardBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  groupCardBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  groupCardDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  groupCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupCardMembers: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },

  // Group Details
  groupDetailsContainer: {
    paddingBottom: 40,
  },
  groupInfoSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 16,
  },
  groupMetadata: {
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    fontWeight: '500',
  },

  // Members Section
  membersSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  memberAvatar: {
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'capitalize',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
});
