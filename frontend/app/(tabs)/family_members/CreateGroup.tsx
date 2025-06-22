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

// Interfaces
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
  // State Management
  const [storedGroupId, setStoredGroupId] = useState<string | null>(null);
  const [actualGroupId, setActualGroupId] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  // ✅ Create/Join Group States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createGroupName, setCreateGroupName] = useState('');
  const [createGroupDescription, setCreateGroupDescription] = useState('');
  const [createGroupType, setCreateGroupType] = useState('family');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [joiningGroup, setJoiningGroup] = useState(false);
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🔥'];

  // ✅ Initialize component (from paste-2.txt logic)
  useEffect(() => {
    getGroupIdFromStorage();
  }, [propGroupId]);

  useEffect(() => {
    if (actualGroupId) {
      initializeComponent();
    }
  }, [actualGroupId]);

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

  // ✅ Core Functions (from paste-2.txt)
  const getGroupIdFromStorage = async () => {
    try {
      const storedId = await AsyncStorage.getItem('groupId');
      const finalGroupId = propGroupId || storedId;
      
      setStoredGroupId(storedId);
      setActualGroupId(finalGroupId);
      console.log("Group Id ", finalGroupId);
      
      // Initialize current user data even if no group
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      
      if (userId) {
        const userData = {
          _id: userId,
          name: userName,
          email: userEmail
        };
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('AsyncStorage error:', error);
      Alert.alert('Error', 'Failed to retrieve group information');
    }
  };

  const initializeComponent = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      
      if (!userId) {
        Alert.alert('Error', 'User not authenticated. Please login again.');
        return;
      }
      
      const userData = {
        _id: userId,
        name: userName,
        email: userEmail
      };
      
      setCurrentUser(userData);
      await fetchGroupInfo(actualGroupId!);
      await loadMessages();
      await getUnreadCount();
    } catch (error) {
      Alert.alert('Initialization Error', 'Failed to initialize the chat. Please try again.');
    }
  };

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // ✅ Fetch group info (from paste-2.txt)
  const fetchGroupInfo = async (id: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(
        `https://elderlybackend.onrender.com/api/group/info/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setGroupInfo(data.group);
      setGroupMembers(data.group.members);

      // Find current user's role
      const currentUserMember = data.group.members.find(
        (member: GroupMember) => member.userId._id === currentUser?._id
      );

      if (currentUserMember) {
        setCurrentUserRole(currentUserMember.role);
      }

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch group info');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create Group Function (from paste-2.txt)
  const createGroup = async () => {
    if (!createGroupName.trim()) {
      Alert.alert('Validation Error', 'Group name is required');
      return;
    }

    setCreatingGroup(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Authentication Error', 'Please login again');
        return;
      }

      const payload = {
        name: createGroupName.trim(),
        description: createGroupDescription.trim(),
        groupType: createGroupType
      };

      const response = await fetch('https://elderlybackend.onrender.com/api/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);

      Alert.alert('Success', `Group "${createGroupName}" created successfully!`);
      
      // Save groupId and fetch group info
      if (data.group && data.group._id) {
        await AsyncStorage.setItem('groupId', data.group._id);
        setStoredGroupId(data.group._id);
        setActualGroupId(data.group._id);
        await fetchGroupInfo(data.group._id);
      }
      
      setShowCreateModal(false);
      setCreateGroupName('');
      setCreateGroupDescription('');
      setCreateGroupType('family');

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  // ✅ Join Group Function (from paste-2.txt)
  const joinGroup = async () => {
    if (!joinGroupId.trim()) {
      Alert.alert('Validation Error', 'Group ID is required');
      return;
    }

    setJoiningGroup(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('Authentication Error', 'Please login again');
        return;
      }

      const response = await fetch('https://elderlybackend.onrender.com/api/group/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ groupId: joinGroupId.trim() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);

      Alert.alert('Success', 'Successfully joined the group!');
      
      await AsyncStorage.setItem('groupId', joinGroupId.trim());
      setStoredGroupId(joinGroupId.trim());
      setActualGroupId(joinGroupId.trim());
      await fetchGroupInfo(joinGroupId.trim());
      
      setShowJoinModal(false);
      setJoinGroupId('');

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join group');
    } finally {
      setJoiningGroup(false);
    }
  };

  // ✅ Load Messages (from paste.txt)
  const loadMessages = async (page = 1, append = false) => {
    if (!actualGroupId) return;
    
    try {
      if (!append) setLoading(true);
      
      const headers = await getAuthHeaders();
      const url = `https://elderlybackend.onrender.com/api/groupmsg/${actualGroupId}/messages?page=${page}&limit=50`;
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to load messages`);
      }
      
      const messagesData = data.data?.messages || data.messages || [];
      const paginationData = data.data?.pagination || {};
      
      if (append) {
        setMessages(prev => [...prev, ...messagesData]);
      } else {
        setMessages(messagesData);
      }
      
      setCurrentPage(paginationData.currentPage || page);
      setTotalPages(paginationData.totalPages || 1);
      setHasMoreMessages(paginationData.hasNext || false);
      
    } catch (error: any) {
      if (error.message.includes('Network')) {
        Alert.alert('Network Error', 'Failed to load messages. Please check your connection.');
      } else {
        Alert.alert('Error', error.message || 'Failed to load messages');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Send Message (from paste.txt)
  const sendMessage = async () => {
    if (!actualGroupId || (!newMessage.trim() && !replyingTo)) return;
    
    try {
      const headers = await getAuthHeaders();
      const payload: any = {
        content: {
          text: newMessage.trim(),
          type: 'text'
        }
      };
      
      if (replyingTo) {
        payload.replyTo = replyingTo._id;
      }
      
      const url = `https://elderlybackend.onrender.com/api/groupmsg/${actualGroupId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: Failed to send message`);
      }
      
      const sentMessage = data.data?.message || data.message;
      setMessages(prev => [sentMessage, ...prev]);
      setNewMessage('');
      setReplyingTo(null);
      
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
      
    } catch (error: any) {
      if (error.message.includes('Network')) {
        Alert.alert('Network Error', 'Failed to send message. Please check your connection.');
      } else {
        Alert.alert('Error', error.message || 'Failed to send message');
      }
    }
  };

  // ✅ Other functions from paste.txt
  const editMessage = async (messageId: string, newText: string) => {
    try {
      const headers = await getAuthHeaders();
      const payload = { content: { text: newText } };
      const url = `https://elderlybackend.onrender.com/api/groupmsg/messages/${messageId}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to edit message');
      }
      
      const updatedMessage = data.data?.message || data.message;
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, ...updatedMessage } : msg
      ));
      setEditingMessage(null);
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to edit message');
    }
  };

  const deleteMessage = async (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const headers = await getAuthHeaders();
              const url = `https://elderlybackend.onrender.com/api/groupmsg/messages/${messageId}`;
              const response = await fetch(url, { method: 'DELETE', headers });
              
              if (response.ok) {
                setMessages(prev => prev.filter(msg => msg._id !== messageId));
              } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete message');
              }
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete message');
            }
          }
        }
      ]
    );
  };

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const headers = await getAuthHeaders();
      const payload = { emoji };
      const url = `https://elderlybackend.onrender.com/api/groupmsg/messages/${messageId}/reactions`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        await loadMessages(1);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add reaction');
      }
      
      setShowReactionPicker(null);
      
    } catch (error: any) {
      Alert.alert('Error', 'Failed to add reaction');
    }
  };

  const markAsRead = async (messageId?: string) => {
    if (!actualGroupId) return;
    
    try {
      const headers = await getAuthHeaders();
      const url = messageId 
        ? `https://elderlybackend.onrender.com/api/groupmsg/messages/${messageId}/read`
        : `https://elderlybackend.onrender.com/api/groupmsg/${actualGroupId}/messages/read-all`;
      
      const response = await fetch(url, { method: 'POST', headers });
      
      if (response.ok && !messageId) {
        setUnreadCount(0);
      }
    } catch (error: any) {
      // Silent fail for read status
    }
  };

  const getUnreadCount = async () => {
    if (!actualGroupId) return;
    
    try {
      const headers = await getAuthHeaders();
      const url = `https://elderlybackend.onrender.com/api/groupmsg/${actualGroupId}/messages/unread-count`;
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      if (response.ok) {
        const count = data.data?.unreadCount || data.unreadCount || 0;
        setUnreadCount(count);
      }
    } catch (error: any) {
      // Silent fail for unread count
    }
  };

  const loadMoreMessages = () => {
    if (hasMoreMessages && !loading) {
      loadMessages(currentPage + 1, true);
    }
  };

  // ✅ Utility Functions (from paste.txt)
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      const diffInDays = diffInHours / 24;
      
      if (diffInHours < 1) {
        return 'now';
      } else if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getMemberRoleColor = (role: string) => {
    const colors = {
      'admin': '#FF6B6B',
      'elderly': '#4ECDC4',
      'family_member': '#45B7D1',
      'caregiver': '#96CEB4',
      'member': '#FFEAA7'
    };
    return colors[role as keyof typeof colors] || '#DDA0DD';
  };

  const getRoleDisplayName = (role: string) => {
    const displayNames = {
      'family_member': 'Family',
      'caregiver': 'Caregiver',
      'elderly': 'Elderly',
      'admin': 'Admin',
      'member': 'Member'
    };
    return displayNames[role as keyof typeof displayNames] || role;
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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

  // ✅ Render member item (from paste-2.txt)
  const renderMember = ({ item }: { item: any }) => (
    <View style={styles.memberCard}>
      <View>
        <Text style={styles.memberName}>{item.userId.name}</Text>
        <Text style={styles.memberRole}>{item.role}</Text>
      </View>
      <Text style={styles.memberEmail}>{item.userId.email}</Text>
    </View>
  );

  // ✅ Render Components (from paste.txt UI)
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

  const renderMessage = ({ item }: { item: Message }) => {
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
            {item.reactions.map((reaction, index) => (
              <View key={index} style={styles.reactionBubble}>
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Action buttons */}
        <View style={[
          styles.messageActions,
          isOwnMessage && styles.ownMessageActions
        ]}>
          <TouchableOpacity
            onPress={() => setReplyingTo(item)}
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>↩️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setShowReactionPicker(item._id)}
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>😊</Text>
          </TouchableOpacity>
          
          {isOwnMessage && (
            <>
              <TouchableOpacity
                onPress={() => setEditingMessage(item)}
                style={styles.actionButton}
              >
                <Text style={styles.actionIcon}>✏️</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => deleteMessage(item._id)}
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

  const renderInputArea = () => (
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
            onPress={() => setReplyingTo(null)}
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
              setNewMessage(text);
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
          onPress={sendMessage}
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

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => setShowGroupDetails(true)}
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
          onPress={() => setShowMembersList(true)}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonIcon}>👥</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => markAsRead()}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonIcon}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ No Group State (from paste-2.txt)
  const renderNoGroupState = () => (
    <View style={styles.noGroupContainer}>
      <View style={styles.noGroupContent}>
        <Text style={styles.noGroupTitle}>Welcome to Group Chat</Text>
        <Text style={styles.noGroupSubtitle}>
          Create a new group or join an existing one to start chatting with your family and caregivers
        </Text>
        
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.createButton]}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.actionButtonIcon}>➕</Text>
            <Text style={styles.actionButtonText}>Create Group</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={() => setShowJoinModal(true)}
          >
            <Text style={styles.actionButtonIcon}>🔗</Text>
            <Text style={styles.actionButtonText}>Join Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ✅ Create Group Modal (from paste-2.txt)
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

  // ✅ Join Group Modal (from paste-2.txt)
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
              <Text style={styles.infoText}>
                💡 Ask your family member or group admin for the Group ID to join their group.
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

  // ✅ Main render logic (from paste-2.txt logic)
  if (loading && !groupInfo) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // ✅ Show group info if group exists (from paste-2.txt logic)
  if (groupInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {renderHeader()}
        
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            inverted
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.1}
            refreshing={refreshing}
            onRefresh={() => {
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
        
        {/* Reaction Picker Modal */}
        <Modal
          visible={!!showReactionPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowReactionPicker(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.reactionPicker}>
              <Text style={styles.reactionPickerTitle}>Choose a reaction</Text>
              <View style={styles.reactionsGrid}>
                {reactions.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
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
          onRequestClose={() => setEditingMessage(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.editModal}>
              <Text style={styles.editModalTitle}>Edit Message</Text>
              <TextInput
                style={styles.editInput}
                value={editingMessage?.content.text || ''}
                onChangeText={(text) => {
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
                  onPress={() => setEditingMessage(null)}
                  style={[styles.editActionButton, styles.cancelEditButton]}
                >
                  <Text style={styles.cancelEditText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
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

  // ✅ Show Create/Join buttons if no group ID (from paste-2.txt logic)
  if (!actualGroupId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        {renderNoGroupState()}
        {renderCreateGroupModal()}
        {renderJoinGroupModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {renderNoGroupState()}
      {renderCreateGroupModal()}
      {renderJoinGroupModal()}
    </SafeAreaView>
  );
}

// ✅ Styles from paste.txt (modern UI)
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
  typingDot1: {},
  typingDot2: {},
  typingDot3: {},
  
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

  // ✅ Additional styles from paste-2.txt for group info and modals
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  memberEmail: {
    fontSize: 12,
    color: '#888',
  },

  // No Group State Styles
  noGroupContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  noGroupSubtitle: {
    fontSize: 16,
    color: '#64748b',
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
    backgroundColor: '#27ae60',
  },
  joinButton: {
    backgroundColor: '#3498db',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },

  // Modal Styles
  createGroupModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
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
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  
  createGroupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  joinGroupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 8,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#2c3e50',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  infoText: {
    color: '#2c3e50',
    fontSize: 14,
    lineHeight: 20,
  },
  groupTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 10,
  },
  groupTypeOption: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  groupTypeOptionSelected: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  groupTypeText: {
    color: '#2c3e50',
    fontWeight: '500',
  },
  groupTypeTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalActionButton: {
    flex: 0.48,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  createGroupButton: {
    backgroundColor: '#27ae60',
  },
  joinGroupButton: {
    backgroundColor: '#3498db',
  },
  cancelButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
