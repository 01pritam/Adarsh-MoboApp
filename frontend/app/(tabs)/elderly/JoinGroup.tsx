import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import socketService from '../../../utils/socketService.js';

const { width, height } = Dimensions.get('window');

// Interfaces remain the same...
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
  // Get safe area insets for proper spacing
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 80;
  const INPUT_CONTAINER_HEIGHT = 70;

  // Performance optimization refs
  const componentId = useRef(`CHAT_${Math.random().toString(36).substr(2, 9)}`);
  const initializationStarted = useRef(false);
  const socketInitialized = useRef(false);
  const currentUserSet = useRef(false);

  // ✅ CORRECTED: Core state with proper groupId logic
  const [actualGroupId, setActualGroupId] = useState<string | null>(null);
  const [storedGroupId, setStoredGroupId] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasValidGroup, setHasValidGroup] = useState(false);

  // ✅ NEW: Create/Join Group States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createGroupName, setCreateGroupName] = useState('');
  const [createGroupDescription, setCreateGroupDescription] = useState('');
  const [createGroupType, setCreateGroupType] = useState('family');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [joiningGroup, setJoiningGroup] = useState(false);

  // Message state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Performance flags
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingGroupInfo, setIsLoadingGroupInfo] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // UI State
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);

  // Reaction state
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<string | null>(null);
  const [showQuickReactions, setShowQuickReactions] = useState<string | null>(null);

  // WebSocket state
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set<string>());
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastLoadTime = useRef(0);

  // Color palette for member avatars
  const memberColors = [
    '#FF8C00', '#C15C2D', '#009951', '#FF5100',
    '#FFA500', '#32CD32', '#FF6347', '#20B2AA',
  ];

  // Extended emoji reactions
  const reactions = [
    '👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥',
    '💯', '🎉', '😍', '🤔', '👎', '😴', '🤯', '🙄',
  ];

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  // ✅ CORRECTED: Utility function to check if groupId is valid
  const isValidGroupId = useCallback((id: string | null): boolean => {
    if (!id) return false;
    if (id === '') return false;
    if (id === 'null') return false;
    if (id === 'undefined') return false;
    return id.trim().length > 0;
  }, []);

  // ✅ CORRECTED: Initialize groupId with proper null checking
  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;

    const initializeGroupId = async () => {
      try {
        console.log('🔍 Initializing groupId...');
        
        // Get stored groupId from AsyncStorage
        const storedId = await AsyncStorage.getItem('groupId');
        console.log('📦 Stored groupId from AsyncStorage:', storedId);
        
        // Use propGroupId if provided, otherwise use stored
        const finalGroupId = propGroupId || storedId;
        console.log('🎯 Final groupId determined:', finalGroupId);
        
        setStoredGroupId(storedId);
        
        // ✅ CORRECTED: Proper validation using the utility function
        if (isValidGroupId(finalGroupId)) {
          console.log('✅ Valid groupId found, setting actualGroupId');
          setActualGroupId(finalGroupId);
          setHasValidGroup(true);
        } else {
          console.log('❌ No valid groupId found');
          setActualGroupId(null);
          setHasValidGroup(false);
        }
      } catch (error) {
        console.error(`💥 [${componentId.current}] Error getting groupId:`, error);
        setActualGroupId(null);
        setHasValidGroup(false);
      }
    };

    initializeGroupId();
  }, [propGroupId, isValidGroupId]);

  // ✅ CORRECTED: Initialize current user
  useEffect(() => {
    if (currentUserSet.current) return;

    const initializeUser = async () => {
      try {
        console.log('👤 Initializing current user...');
        
        const [userId, userName, userEmail] = await Promise.all([
          AsyncStorage.getItem('userId'),
          AsyncStorage.getItem('userName'),
          AsyncStorage.getItem('userEmail'),
        ]);

        console.log('👤 User data retrieved:', { userId, userName, userEmail });

        if (userId && isValidGroupId(userId)) {
          const userData = { _id: userId, name: userName, email: userEmail };
          setCurrentUser(userData);
          currentUserSet.current = true;
          console.log('✅ Current user set successfully');
        } else {
          console.log('❌ No valid user ID found');
        }
      } catch (error) {
        console.error(`💥 [${componentId.current}] Error setting current user:`, error);
      }
    };

    initializeUser();
  }, [isValidGroupId]);

  // ✅ CORRECTED: Initialize WebSocket only when we have a valid group
  useEffect(() => {
    if (!hasValidGroup || socketInitialized.current) return;

    const initializeSocket = async () => {
      try {
        console.log('🔌 Initializing WebSocket connection...');
        socketInitialized.current = true;
        setConnectionStatus('Connecting...');
        await socketService.connect();
        setIsConnected(true);
        setConnectionStatus('Connected');
        console.log('✅ WebSocket connected successfully');
      } catch (error) {
        console.error(`❌ [${componentId.current}] WebSocket connection failed:`, error);
        setIsConnected(false);
        setConnectionStatus('Using REST API');
      }
    };

    initializeSocket();
  }, [hasValidGroup]);

  // ✅ CORRECTED: Load data only when we have valid group and user
  useEffect(() => {
    if (!actualGroupId || !currentUser || !hasValidGroup || isInitializing) return;

    const initializeData = async () => {
      console.log('📊 Initializing chat data...');
      setIsInitializing(true);
      try {
        await Promise.all([loadGroupInfo(), loadMessages()]);
        console.log('✅ Chat data initialized successfully');
      } catch (error) {
        console.error(`💥 [${componentId.current}] Data initialization error:`, error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeData();
  }, [actualGroupId, currentUser, hasValidGroup]);

  // Auth headers
  const getAuthHeaders = useCallback(async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) throw new Error('No auth token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  // ✅ CORRECTED: Create Group Function
  const createGroup = async () => {
    if (!createGroupName.trim()) {
      Alert.alert('Validation Error', 'Group name is required');
      return;
    }

    setCreatingGroup(true);
    try {
      console.log('🏗️ Creating new group...');
      
      const headers = await getAuthHeaders();
      const payload = {
        name: createGroupName.trim(),
        description: createGroupDescription.trim(),
        groupType: createGroupType
      };

      const response = await fetch('https://elderlybackend.onrender.com/api/group', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);

      console.log('✅ Group created successfully:', data.group);
      
      // Save groupId and update state
      if (data.group && data.group._id) {
        await AsyncStorage.setItem('groupId', data.group._id);
        setStoredGroupId(data.group._id);
        setActualGroupId(data.group._id);
        setHasValidGroup(true);
      }
      
      setShowCreateModal(false);
      setCreateGroupName('');
      setCreateGroupDescription('');
      setCreateGroupType('family');
      
      Alert.alert('Success', `Group "${createGroupName}" created successfully!`);

    } catch (error: any) {
      console.error('💥 Create group error:', error);
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  // ✅ CORRECTED: Join Group Function
  const joinGroup = async () => {
    if (!joinGroupId.trim()) {
      Alert.alert('Validation Error', 'Group ID is required');
      return;
    }

    setJoiningGroup(true);
    try {
      console.log('🔗 Joining group with ID:', joinGroupId.trim());
      
      const headers = await getAuthHeaders();

      const response = await fetch('https://elderlybackend.onrender.com/api/group/join', {
        method: 'POST',
        headers,
        body: JSON.stringify({ groupId: joinGroupId.trim() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);

      console.log('✅ Successfully joined group');
      
      // Save groupId and update state
      await AsyncStorage.setItem('groupId', joinGroupId.trim());
      setStoredGroupId(joinGroupId.trim());
      setActualGroupId(joinGroupId.trim());
      setHasValidGroup(true);
      
      setShowJoinModal(false);
      setJoinGroupId('');
      
      Alert.alert('Success', 'Successfully joined the group!');

    } catch (error: any) {
      console.error('💥 Join group error:', error);
      Alert.alert('Error', error.message || 'Failed to join group');
    } finally {
      setJoiningGroup(false);
    }
  };

  // Load group info
  const loadGroupInfo = useCallback(async () => {
    if (!actualGroupId || !currentUser || isLoadingGroupInfo) return;

    setIsLoadingGroupInfo(true);
    try {
      console.log('📋 Loading group info for:', actualGroupId);
      
      const headers = await getAuthHeaders();
      const response = await fetch(
        `https://elderlybackend.onrender.com/api/group/info/${actualGroupId}`,
        { headers }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const group = data.group || data;
      setGroupInfo(group);
      setGroupMembers(group.members);

      const currentUserMember = group.members.find(
        (member: GroupMember) => member.userId._id === currentUser._id
      );
      if (currentUserMember) {
        setCurrentUserRole(currentUserMember.role);
      } else {
        setCurrentUserRole('member');
      }
      
      console.log('✅ Group info loaded successfully');
    } catch (error) {
      console.error(`💥 [${componentId.current}] Error loading group info:`, error);
    } finally {
      setIsLoadingGroupInfo(false);
    }
  }, [actualGroupId, currentUser, isLoadingGroupInfo, getAuthHeaders]);

  // Load messages
  const loadMessages = useCallback(
    async (page = 1, append = false) => {
      if (!actualGroupId || isLoadingMessages) return;

      const now = Date.now();
      if (now - lastLoadTime.current < 1000) return;
      lastLoadTime.current = now;

      setIsLoadingMessages(true);
      if (!append) setLoading(true);

      try {
        console.log('💬 Loading messages for page:', page);
        
        const headers = await getAuthHeaders();
        const response = await fetch(
          `https://elderlybackend.onrender.com/api/groupmsg/${actualGroupId}/messages?page=${page}&limit=50`,
          { headers }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        const messagesData = data.data?.messages || data.messages || [];
        const paginationData = data.data?.pagination || {};

        const sortedMessages = messagesData.sort(
          (a: Message, b: Message) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        if (append) {
          setMessages((prev) => [...sortedMessages, ...prev]);
        } else {
          setMessages(sortedMessages);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }

        setCurrentPage(paginationData.currentPage || page);
        setHasMoreMessages(paginationData.hasNext || false);
        
        console.log('✅ Messages loaded successfully');
      } catch (error) {
        console.error(`💥 [${componentId.current}] Error loading messages:`, error);
      } finally {
        setIsLoadingMessages(false);
        setLoading(false);
        setRefreshing(false);
      }
    },
    [actualGroupId, isLoadingMessages, getAuthHeaders]
  );

  // Send message
  const sendMessage = useCallback(async () => {
    if (!actualGroupId || !newMessage.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    const messageText = newMessage.trim();
    setNewMessage('');
    setReplyingTo(null);

    try {
      console.log('📤 Sending message...');
      
      if (isConnected) {
        socketService.sendMessage(
          actualGroupId,
          {
            text: messageText,
            type: 'text',
          },
          replyingTo?._id
        );
        socketService.stopTyping(actualGroupId);
      } else {
        const headers = await getAuthHeaders();
        const payload = {
          content: { text: messageText, type: 'text' },
          replyTo: replyingTo?._id,
        };

        const response = await fetch(
          `https://elderlybackend.onrender.com/api/groupmsg/${actualGroupId}/messages`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const sentMessage = data.data?.message || data.message;
          setMessages((prev) => [...prev, sentMessage]);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
      
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error(`💥 [${componentId.current}] Error sending message:`, error);
      Alert.alert('Error', 'Failed to send message');
      setNewMessage(messageText);
    } finally {
      setIsSendingMessage(false);
    }
  }, [actualGroupId, newMessage, replyingTo, isConnected, isSendingMessage, getAuthHeaders]);

  // ✅ NEW: Render Create/Join Buttons when no valid group
  const renderNoGroupState = () => (
    <View style={styles.noGroupContainer}>
      <View style={styles.noGroupContent}>
        <MaterialIcons name="groups" size={80} color="#16a34a" />
        <Text style={styles.noGroupTitle}>Welcome to Group Chat</Text>
        <Text style={styles.noGroupSubtitle}>
          Create a new group or join an existing one to start chatting with your family and caregivers
        </Text>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.createButton]}
            onPress={() => setShowCreateModal(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
            <Text style={styles.actionButtonText}>Create Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={() => setShowJoinModal(true)}
          >
            <MaterialIcons name="group-add" size={24} color="white" />
            <Text style={styles.actionButtonText}>Join Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ✅ NEW: Create Group Modal
  const renderCreateGroupModal = () => (
    <Modal
      visible={showCreateModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.createGroupModal}>
          <Text style={styles.createGroupTitle}>Create New Group</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Group Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter group name"
              value={createGroupName}
              onChangeText={setCreateGroupName}
              maxLength={100}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              placeholder="Enter group description (optional)"
              value={createGroupDescription}
              onChangeText={setCreateGroupDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Group Type</Text>
            <View style={styles.groupTypeContainer}>
              {['family', 'medical', 'social'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.groupTypeOption,
                    createGroupType === type && styles.groupTypeOptionSelected
                  ]}
                  onPress={() => setCreateGroupType(type)}
                >
                  <Text style={[
                    styles.groupTypeText,
                    createGroupType === type && styles.groupTypeTextSelected
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              style={[styles.modalActionButton, styles.cancelButton]}
              disabled={creatingGroup}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={createGroup}
              style={[styles.modalActionButton, styles.createGroupButton]}
              disabled={creatingGroup || !createGroupName.trim()}
            >
              {creatingGroup ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Create Group</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ✅ NEW: Join Group Modal
  const renderJoinGroupModal = () => (
    <Modal
      visible={showJoinModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowJoinModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.joinGroupModal}>
          <Text style={styles.joinGroupTitle}>Join Existing Group</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Group ID *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter group ID to join"
              value={joinGroupId}
              onChangeText={setJoinGroupId}
              autoCapitalize="none"
            />
            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={16} color="#16a34a" />
              <Text style={styles.infoText}>
                Ask your family member or group admin for the Group ID to join their group.
              </Text>
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={() => setShowJoinModal(false)}
              style={[styles.modalActionButton, styles.cancelButton]}
              disabled={joiningGroup}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={joinGroup}
              style={[styles.modalActionButton, styles.joinGroupButton]}
              disabled={joiningGroup || !joinGroupId.trim()}
            >
              {joiningGroup ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.joinButtonText}>Join Group</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ✅ CORRECTED: Main render logic with proper groupId checking
  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  // ✅ CORRECTED: Show Create/Join buttons if no valid group
  if (!hasValidGroup || !actualGroupId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        {renderNoGroupState()}
        {renderCreateGroupModal()}
        {renderJoinGroupModal()}
      </SafeAreaView>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  // ✅ CORRECTED: Show full chat interface when we have a valid group
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setShowGroupDetails(true)}
          style={styles.headerLeft}
        >
          <Text style={styles.headerTitle}>
            {groupInfo?.name || 'Group Chat'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {groupMembers.length} members
          </Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowMembersList(true)}
            style={styles.headerButton}
          >
            <MaterialIcons name="people" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages Container */}
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.messageItem}>
              <Text style={styles.messageSender}>{item.sender.name}</Text>
              <Text style={styles.messageText}>{item.content.text}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          style={styles.messagesList}
        />
      </View>

      {/* Input Container */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#6c757d"
              multiline
              style={styles.messageInput}
            />
          </View>

          <TouchableOpacity
            onPress={sendMessage}
            disabled={isSendingMessage || !newMessage.trim()}
            style={[
              styles.sendButton,
              newMessage.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {renderCreateGroupModal()}
      {renderJoinGroupModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '600',
  },

  // No Group State Styles
  noGroupContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noGroupContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  noGroupTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 20,
  },
  noGroupSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  actionButtonsContainer: {
    width: '100%',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  createButton: {
    backgroundColor: '#16a34a',
  },
  joinButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  createGroupModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  joinGroupModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  createGroupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  joinGroupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#16a34a',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  groupTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  groupTypeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  groupTypeOptionSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  groupTypeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  groupTypeTextSelected: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalActionButton: {
    flex: 0.48,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  createGroupButton: {
    backgroundColor: '#16a34a',
  },
  joinGroupButton: {
    backgroundColor: '#3b82f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Header styles
  header: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 40,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages styles
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageItem: {
    backgroundColor: 'white',
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 20,
  },

  // Input styles
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e9ecef',
    justifyContent: 'center',
  },
  messageInput: {
    fontSize: 16,
    lineHeight: 22,
    color: '#212529',
    textAlignVertical: 'center',
    paddingVertical: 0,
  },
  sendButton: {
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonActive: {
    backgroundColor: '#16a34a',
  },
  sendButtonInactive: {
    backgroundColor: '#d1d5db',
  },
});
