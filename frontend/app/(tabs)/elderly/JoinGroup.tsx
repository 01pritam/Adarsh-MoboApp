// import React, { useEffect, useState } from 'react';
// import {
//   SafeAreaView, View, Text, TextInput, TouchableOpacity,
//   FlatList, ActivityIndicator, Alert, StyleSheet
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function JoinGroupScreen() {
//   const [storedGroupId, setStoredGroupId] = useState<string | null>(null);
//   const [groupIdInput, setGroupIdInput] = useState('');
//   const [group, setGroup] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   // Load stored groupId on mount
//   useEffect(() => {
//     AsyncStorage.getItem('groupId')
//       .then(id => {
//         console.log('Stored groupId:', id);
//         setStoredGroupId(id);
//       })
//       .catch(e => console.error('AsyncStorage error:', e));
//   }, []);

//   // Fetch group info automatically if storedGroupId exists
//   useEffect(() => {
//     if (storedGroupId) fetchGroupInfo(storedGroupId);
//   }, [storedGroupId]);

//   // Fetch group details by ID
//   const fetchGroupInfo = async (id: string) => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('accessToken');
//       const res = await fetch(
//         `https://elderlybackend.onrender.com/api/group/info/${id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       setGroup(data.group);
//     } catch (err: any) {
//       Alert.alert('Error', err.message || 'Failed to fetch group info');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Join group by entered ID
//   const joinGroup = async () => {
//     if (!groupIdInput.trim()) {
//       Alert.alert('Validation Error', 'Group ID is required');
//       return;
//     }
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('accessToken');
//       const res = await fetch(
//         'https://elderlybackend.onrender.com/api/group/join',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`
//           },
//           body: JSON.stringify({ groupId: groupIdInput.trim() })
//         }
//       );
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message);
//       await AsyncStorage.setItem('groupId', groupIdInput.trim());
//       setStoredGroupId(groupIdInput.trim());
//       setGroupIdInput('');
//       Alert.alert('Success', 'Joined group successfully');
//     } catch (err: any) {
//       Alert.alert('Error', err.message || 'Join failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Render a single member item
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

//   // If group data exists, display group info and members
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

//   // Otherwise, show the join form
//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.header}>Join a Group</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter Group ID"
//         value={groupIdInput}
//         onChangeText={setGroupIdInput}
//         autoCapitalize="none"
//       />
//       <TouchableOpacity
//         style={styles.button}
//         onPress={joinGroup}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>Join Group</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: 'FFFDDD'
//   },
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   header: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 12
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#CCC',
//     borderRadius: 8,
//     padding: 12,
//     backgroundColor: 'white',
//     marginBottom: 16
//   },
//   button: {
//     backgroundColor: '#4caf50',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center'
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600'
//   },
//   groupTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 4
//   },
//   groupDesc: {
//     fontSize: 14,
//     color: '#6C6C70',
//     textAlign: 'center',
//     marginBottom: 12
//   },
//   settingsBox: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 12,
//     elevation: 1
//   },
//   settingsTitle: {
//     fontWeight: 'bold',
//     marginBottom: 4
//   },
//   section: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginVertical: 12
//   },
//   memberCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: 'white',
//     marginBottom: 8,
//     borderRadius: 8,
//     elevation: 2
//   },
//   memberName: {
//     fontSize: 16
//   },
//   memberRole: {
//     fontSize: 14,
//     color: '#666'
//   },
//   memberEmail: {
//     fontSize: 12,
//     color: '#888'
//   }
// });



import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  Animated,
  RefreshControl,
  AppState,
} from "react-native";
import socketService from "../../../utils/socketService.js";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

interface GroupMember {
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  role: "admin" | "member" | "elderly" | "family_member" | "caregiver";
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
    type: "text" | "image" | "file" | "audio" | "video";
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

export default function ModernGroupChat({
  groupId: propGroupId,
}: GroupMessageProps) {
  // Component state and refs
  const componentId = useRef(`CHAT_${Math.random().toString(36).substr(2, 9)}`);
  const isMounted = useRef(true);
  const isFullyInitialized = useRef(false);

  // State management
  const [actualGroupId, setActualGroupId] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingGroupInfo, setIsLoadingGroupInfo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<string | null>(null);
  const [showQuickReactions, setShowQuickReactions] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastLoadTime = useRef<number>(0);
  const appStateRef = useRef(AppState.currentState);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Enhanced emoji reactions
  const reactions = [
    "👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🔥",
    "💯", "🎉", "😍", "🤔", "👎", "😴", "🤯", "🙄",
  ];
  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // MAIN INITIALIZATION EFFECT - This runs once when component mounts or screen focuses
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Screen focused, initializing...");
      initializeComponent();
    }, [])
  );

  // Complete initialization function
  const initializeComponent = useCallback(async () => {
    if (!isMounted.current) return;

    console.log("🚀 Starting complete initialization...");
    setIsInitializing(true);
    setLoading(true);
    setInitializationError(null);

    try {
      // Step 1: Get Group ID
      console.log("📋 Step 1: Getting group ID...");
      const storedId = await AsyncStorage.getItem("groupId");
      const finalGroupId = propGroupId || storedId;

      if (!finalGroupId) {
        throw new Error("No group ID found. Please select a group first.");
      }

      if (isMounted.current) {
        setActualGroupId(finalGroupId);
        console.log("✅ Group ID set:", finalGroupId);
      }

      // Step 2: Get User Data
      console.log("👤 Step 2: Getting user data...");
      const [userId, userName, userEmail] = await Promise.all([
        AsyncStorage.getItem("userId"),
        AsyncStorage.getItem("userName"),
        AsyncStorage.getItem("userEmail"),
      ]);

      if (!userId) {
        throw new Error("No user data found. Please login again.");
      }

      const userData = { _id: userId, name: userName, email: userEmail };
      if (isMounted.current) {
        setCurrentUser(userData);
        console.log("✅ User set:", userData.name);
      }

      // Step 3: Initialize Socket
      console.log("🔌 Step 3: Initializing socket...");
      try {
        await socketService.connect();
        if (isMounted.current) {
          setIsConnected(true);
          setConnectionStatus("Connected");
          console.log("✅ Socket connected");
        }
      } catch (error) {
        console.warn("⚠️ Socket connection failed, using REST API:", error);
        if (isMounted.current) {
          setIsConnected(false);
          setConnectionStatus("Using REST API");
        }
      }

      // Step 4: Load All Data
      console.log("📊 Step 4: Loading all data...");
      await Promise.all([
        loadGroupInfoDirect(finalGroupId, userData),
        loadMessagesDirect(finalGroupId),
        getUnreadCountDirect(finalGroupId)
      ]);

      // Step 5: Setup Socket Listeners
      if (isMounted.current) {
        setupSocketListeners(finalGroupId, userData);
      }

      // Mark as fully initialized
      isFullyInitialized.current = true;
      if (isMounted.current) {
        setLoading(false);
        setIsInitializing(false);
        console.log("✅ Component fully initialized");
      }

    } catch (error) {
      console.error("💥 Initialization error:", error);
      if (isMounted.current) {
        setInitializationError(error.message);
        setLoading(false);
        setIsInitializing(false);
      }
    }
  }, [propGroupId]);

  // Setup socket listeners
  const setupSocketListeners = useCallback((groupId: string, user: any) => {
    if (!isConnected) return;

    console.log("🎧 Setting up socket listeners...");
    socketService.joinGroup(groupId);

    socketService.onNewMessage((data) => {
      const { message, groupId: msgGroupId } = data;
      if (msgGroupId === groupId && isMounted.current) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === message._id);
          if (exists) return prev;
          const updated = [...prev, message];
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          return updated;
        });
      }
    });

    socketService.onUserTyping((data) => {
      const { userId, groupId: typingGroupId, isTyping } = data;
      if (typingGroupId === groupId && userId !== user._id && isMounted.current) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      }
    });

    socketService.onReactionAdded((data) => {
      const { messageId, reactions } = data;
      if (isMounted.current) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg))
        );
      }
    });

    return () => {
      socketService.removeListener("new_message");
      socketService.removeListener("user_typing");
      socketService.removeListener("reaction_added");
      socketService.removeListener("group_joined");
    };
  }, [isConnected]);

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auth headers
  const getAuthHeaders = useCallback(async () => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("No auth token found. Please login again.");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  // Direct load functions that don't depend on state
  const loadGroupInfoDirect = useCallback(async (groupId: string, user: any) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `https://elderlybackend.onrender.com/api/group/info/${groupId}`,
        { headers }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const group = data.group || data;
      if (isMounted.current) {
        setGroupInfo(group);
        setGroupMembers(group.members);

        const currentUserMember = group.members.find(
          (member: GroupMember) => member.userId._id === user._id
        );

        setCurrentUserRole(currentUserMember?.role || "member");
      }
    } catch (error) {
      console.error("💥 Error loading group info:", error);
      throw error;
    }
  }, [getAuthHeaders]);

  const loadMessagesDirect = useCallback(async (groupId: string, page = 1) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `https://elderlybackend.onrender.com/api/groupmsg/${groupId}/messages?page=${page}&limit=50`,
        { headers }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const messagesData = data.data?.messages || data.messages || [];
      const sortedMessages = messagesData.sort(
        (a: Message, b: Message) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      if (isMounted.current) {
        setMessages(sortedMessages);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    } catch (error) {
      console.error("💥 Error loading messages:", error);
      throw error;
    }
  }, [getAuthHeaders]);

  const getUnreadCountDirect = useCallback(async (groupId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `https://elderlybackend.onrender.com/api/groupmsg/${groupId}/messages/unread-count`,
        { headers }
      );

      const data = await response.json();
      if (response.ok && isMounted.current) {
        const count = data.data?.unreadCount || data.unreadCount || 0;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("💥 Error getting unread count:", error);
    }
  }, [getAuthHeaders]);

  // Force refresh function
  const handleForceRefresh = useCallback(() => {
    console.log("🔄 Force refreshing chat...");
    setMessages([]);
    setGroupInfo(null);
    setGroupMembers([]);
    setInitializationError(null);
    isFullyInitialized.current = false;
    initializeComponent();
  }, [initializeComponent]);

  // Regular load functions for refreshing
  const loadMessages = useCallback(
    async (page = 1, append = false) => {
      if (!actualGroupId || isLoadingMessages) return;

      const now = Date.now();
      if (now - lastLoadTime.current < 500) return;
      lastLoadTime.current = now;

      setIsLoadingMessages(true);
      if (!append) setLoading(true);

      try {
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

        if (isMounted.current) {
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
        }
      } catch (error) {
        console.error("💥 Error loading messages:", error);
      } finally {
        if (isMounted.current) {
          setIsLoadingMessages(false);
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [actualGroupId, isLoadingMessages, getAuthHeaders]
  );

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    console.log("🔄 Pull to refresh triggered");
    setRefreshing(true);
    loadMessages(1);
  }, [loadMessages]);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!actualGroupId || !newMessage.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    const messageText = newMessage.trim();
    setNewMessage("");
    setReplyingTo(null);

    try {
      if (isConnected) {
        socketService.sendMessage(
          actualGroupId,
          { text: messageText, type: "text" },
          replyingTo?._id
        );
        socketService.stopTyping(actualGroupId);
      } else {
        const headers = await getAuthHeaders();
        const payload = {
          content: { text: messageText, type: "text" },
          replyTo: replyingTo?._id,
        };

        const response = await fetch(
          `https://elderlybackend.onrender.com/api/groupmsg/${actualGroupId}/messages`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          }
        );

        if (response.ok && isMounted.current) {
          const data = await response.json();
          const sentMessage = data.data?.message || data.message;
          setMessages((prev) => [...prev, sentMessage]);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    } catch (error) {
      console.error("💥 Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
      setNewMessage(messageText);
    } finally {
      if (isMounted.current) {
        setIsSendingMessage(false);
      }
    }
  }, [
    actualGroupId,
    newMessage,
    replyingTo,
    isConnected,
    isSendingMessage,
    getAuthHeaders,
  ]);

  // Handle text change
  const handleTextChange = useCallback(
    (text: string) => {
      setNewMessage(text);

      if (isConnected && actualGroupId) {
        if (text.length > 0) {
          socketService.startTyping(actualGroupId);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            socketService.stopTyping(actualGroupId);
          }, 2000);
        } else {
          socketService.stopTyping(actualGroupId);
        }
      }
    },
    [isConnected, actualGroupId]
  );

  // Load more messages
  const loadMoreMessages = useCallback(() => {
    if (hasMoreMessages && !isLoadingMessages && !loading) {
      loadMessages(currentPage + 1, true);
    }
  }, [hasMoreMessages, isLoadingMessages, loading, currentPage, loadMessages]);

  // Add reaction
  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        if (isConnected) {
          socketService.addReaction(messageId, emoji);
          setShowReactionPicker(null);
          setShowQuickReactions(null);
          setSelectedMessageForReaction(null);
        } else {
          const headers = await getAuthHeaders();
          const payload = { emoji };
          const response = await fetch(
            `https://elderlybackend.onrender.com/api/groupmsg/messages/${messageId}/reactions`,
            {
              method: "POST",
              headers,
              body: JSON.stringify(payload),
            }
          );
          if (response.ok && isMounted.current) {
            const data = await response.json();
            const updatedReactions =
              data.data?.reactions || data.reactions || [];

            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === messageId
                  ? { ...msg, reactions: updatedReactions }
                  : msg
              )
            );

            setShowReactionPicker(null);
            setShowQuickReactions(null);
            setSelectedMessageForReaction(null);
          }
        }
      } catch (error) {
        console.error("💥 Error adding reaction:", error);
        Alert.alert("Error", "Failed to add reaction");
      }
    },
    [isConnected, getAuthHeaders]
  );

  // Remove reaction
  const removeReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        if (isConnected) {
          socketService.removeReaction(messageId, emoji);
        } else {
          const headers = await getAuthHeaders();
          const response = await fetch(
            `https://elderlybackend.onrender.com/api/groupmsg/messages/${messageId}/reactions`,
            {
              method: "DELETE",
              headers,
              body: JSON.stringify({ emoji }),
            }
          );

          if (response.ok && isMounted.current) {
            const data = await response.json();
            const updatedReactions =
              data.data?.reactions || data.reactions || [];

            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === messageId
                  ? { ...msg, reactions: updatedReactions }
                  : msg
              )
            );
          }
        }
      } catch (error) {
        console.error("💥 Error removing reaction:", error);
      }
    },
    [isConnected, getAuthHeaders]
  );

  // Utility functions
  const getMemberRoleColor = useCallback((role: string) => {
    const colors = {
      admin: "#009951",
      elderly: "#FF8C00",
      family_member: "#C15C2D",
      caregiver: "#009951",
      member: "#FF8C00",
    };
    return colors[role as keyof typeof colors] || "#009951";
  }, []);

  const getRoleDisplayName = useCallback((role: string) => {
    const displayNames = {
      family_member: "Family",
      caregiver: "Caregiver",
      elderly: "Elderly",
      admin: "Admin",
      member: "Member",
    };
    return displayNames[role as keyof typeof displayNames] || role;
  }, []);

  const getUserInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, []);

  const formatTime = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (diffInDays < 1) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } else if (diffInDays < 7) {
        return date.toLocaleDateString([], {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } else {
        return date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch (error) {
      console.error(`💥 Error formatting time for ${dateString}:`, error);
      return "Invalid date";
    }
  }, []);

  // Render avatar with modern design
  const renderAvatar = useCallback(
    (user: any, size = 40) => {
      const roleColors = getMemberRoleColor(currentUserRole);

      if (user?.profilePicture) {
        return (
          <View style={[styles.avatarContainer, { width: size, height: size }]}>
            <Image
              source={{ uri: user.profilePicture }}
              style={[
                styles.avatar,
                { width: size, height: size, borderRadius: size / 2 },
              ]}
            />
          </View>
        );
      }

      return (
        <View
          style={[
            styles.avatarPlaceholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: roleColors,
            },
          ]}
        >
          <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>
            {getUserInitials(user?.name || "U")}
          </Text>
        </View>
      );
    },
    [getMemberRoleColor, currentUserRole, getUserInitials]
  );

  // Connection status
  const renderConnectionStatus = useMemo(() => {
    if (isConnected) return null;

    return (
      <Animated.View
        style={[styles.connectionStatusContainer, { opacity: fadeAnim }]}
      >
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionStatusText}>🔴 {connectionStatus}</Text>
        </View>
      </Animated.View>
    );
  }, [isConnected, connectionStatus, fadeAnim]);

  // Typing indicator
  const renderTypingIndicator = useMemo(() => {
    if (typingUsers.size === 0) return null;

    const typingUserNames = Array.from(typingUsers).map((userId) => {
      const member = groupMembers.find((m) => m.userId._id === userId);
      return member?.userId.name || "Someone";
    });

    return (
      <Animated.View style={[styles.typingContainer, { opacity: fadeAnim }]}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>
            {typingUserNames.join(", ")}{" "}
            {typingUserNames.length === 1 ? "is" : "are"} typing...
          </Text>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, { animationDelay: 0 }]} />
            <View style={[styles.typingDot, { animationDelay: 0.2 }]} />
            <View style={[styles.typingDot, { animationDelay: 0.4 }]} />
          </View>
        </View>
      </Animated.View>
    );
  }, [typingUsers, groupMembers, fadeAnim]);

  // Quick reactions
  const renderQuickReactions = useCallback(
    (messageId: string) => {
      if (showQuickReactions !== messageId) return null;

      return (
        <Animated.View
          style={[styles.quickReactionsContainer, { opacity: fadeAnim }]}
        >
          <View style={styles.quickReactionsCard}>
            {quickReactions.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => addReaction(messageId, emoji)}
                style={styles.quickReactionButton}
              >
                <Text style={styles.quickReactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                setSelectedMessageForReaction(messageId);
                setShowReactionPicker(messageId);
                setShowQuickReactions(null);
              }}
              style={styles.moreReactionsButton}
            >
              <View style={styles.moreReactionsGradient}>
                <Text style={styles.moreReactionsText}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    },
    [showQuickReactions, addReaction, fadeAnim]
  );

  // Message reactions
  const renderMessageReactions = useCallback(
    (message: Message) => {
      if (!message.reactions || message.reactions.length === 0) return null;

      const groupedReactions = message.reactions.reduce(
        (acc, reaction) => {
          if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
          }
          acc[reaction.emoji].push(reaction);
          return acc;
        },
        {} as Record<string, typeof message.reactions>
      );

      return (
        <View style={styles.reactionsContainer}>
          {Object.entries(groupedReactions).map(([emoji, reactions]) => {
            const userReacted = reactions.some(
              (r) => r.userId === currentUser?._id
            );
            return (
              <TouchableOpacity
                key={emoji}
                onPress={() => {
                  if (userReacted) {
                    removeReaction(message._id, emoji);
                  } else {
                    addReaction(message._id, emoji);
                  }
                }}
                style={styles.reactionBubbleContainer}
              >
                <View
                  style={[
                    styles.reactionBubble,
                    userReacted && styles.userReactionBubble,
                  ]}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  <Text
                    style={[
                      styles.reactionCount,
                      userReacted && styles.userReactionCount,
                    ]}
                  >
                    {reactions.length}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    },
    [currentUser, addReaction, removeReaction]
  );

  // Render message with modern design
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwnMessage = item.sender._id === currentUser?._id;
      const hasReactions = item.reactions && item.reactions.length > 0;

      const showSenderName =
        !isOwnMessage &&
        (index === 0 || messages[index - 1]?.sender._id !== item.sender._id);

      return (
        <Animated.View
          style={[
            styles.messageContainer,
            isOwnMessage && styles.ownMessageContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.messageRow}>
            {!isOwnMessage && (
              <View style={styles.messageAvatar}>
                {renderAvatar(item.sender, 36)}
              </View>
            )}

            <TouchableOpacity
              onLongPress={() => setShowQuickReactions(item._id)}
              style={[
                styles.messageBubbleContainer,
                isOwnMessage && styles.ownMessageBubbleContainer,
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.messageBubble,
                  isOwnMessage ? styles.ownMessage : styles.otherMessage,
                ]}
              >
                {showSenderName && (
                  <Text style={styles.senderName}>{item.sender.name}</Text>
                )}

                <Text
                  style={[
                    styles.messageText,
                    isOwnMessage && styles.ownMessageText,
                  ]}
                >
                  {item.content.text}
                </Text>

                <View style={styles.messageFooter}>
                  <Text
                    style={[
                      styles.timeText,
                      isOwnMessage && styles.ownTimeText,
                    ]}
                  >
                    {formatTime(item.createdAt)}
                    {item.isEdited && " • edited"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {isOwnMessage && (
              <View style={styles.messageAvatar}>
                {renderAvatar(item.sender, 36)}
              </View>
            )}
          </View>

          {hasReactions && renderMessageReactions(item)}
          {renderQuickReactions(item._id)}
        </Animated.View>
      );
    },
    [
      currentUser,
      messages,
      renderAvatar,
      formatTime,
      renderMessageReactions,
      renderQuickReactions,
      fadeAnim,
      slideAnim,
    ]
  );

  // Group details modal
  const renderGroupDetailsModal = useCallback(
    () => (
      <Modal
        visible={showGroupDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowGroupDetails(false)}
      >
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Group Details</Text>
              <TouchableOpacity
                onPress={() => setShowGroupDetails(false)}
                style={styles.closeButton}
              >
                <View style={styles.closeButtonBackground}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </View>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {groupInfo ? (
                <>
                  <View style={styles.groupHeaderCard}>
                    <View style={styles.groupIconContainer}>
                      <Text style={styles.groupIcon}>👥</Text>
                    </View>
                    <Text style={styles.groupName}>{groupInfo.name}</Text>
                    <Text style={styles.groupDescription}>
                      {groupInfo.description}
                    </Text>
                    <View style={styles.groupStats}>
                      <View style={styles.statCard}>
                        <View style={styles.statGradient}>
                          <Text style={styles.statNumber}>
                            {groupMembers.length}
                          </Text>
                          <Text style={styles.statLabel}>Members</Text>
                        </View>
                      </View>
                      <View style={styles.statCard}>
                        <View style={styles.statGradient}>
                          <Text style={styles.statNumber}>
                            {messages.length}
                          </Text>
                          <Text style={styles.statLabel}>Messages</Text>
                        </View>
                      </View>
                      <View style={styles.statCard}>
                        <View style={styles.statGradient}>
                          <Text style={styles.statNumber}>
                            {Math.ceil(
                              (Date.now() -
                                new Date(groupInfo.createdAt).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}
                          </Text>
                          <Text style={styles.statLabel}>Days</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}>Information</Text>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Type</Text>
                      <Text style={styles.infoValue}>
                        {groupInfo.groupType}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Created</Text>
                      <Text style={styles.infoValue}>
                        {new Date(groupInfo.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Created By</Text>
                      <Text style={styles.infoValue}>
                        {groupInfo.createdBy.name}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.center}>
                  <Text style={styles.emptyText}>
                    No group information available
                  </Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    ),
    [showGroupDetails, groupInfo, groupMembers, messages]
  );

  // Members list modal
  const renderMembersListModal = useCallback(
    () => (
      <Modal
        visible={showMembersList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMembersList(false)}
      >
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Members ({groupMembers.length})
              </Text>
              <TouchableOpacity
                onPress={() => setShowMembersList(false)}
                style={styles.closeButton}
              >
                <View style={styles.closeButtonBackground}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </View>
              </TouchableOpacity>
            </View>

            <FlatList
              data={groupMembers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => {
                const memberName =
                  item.userId?.name || item.userId?.email || "Unknown User";
                const memberEmail = item.userId?.email || "No email provided";
                const roleColors = getMemberRoleColor(item.role);
                return (
                  <View style={styles.memberCard}>
                    <View style={styles.memberAvatar}>
                      {renderAvatar(item.userId || { name: memberName }, 48)}
                      <View style={styles.onlineIndicator} />
                    </View>
                    <View style={styles.memberInfo}>
                      <View style={styles.memberHeader}>
                        <Text style={styles.memberName}>{memberName}</Text>
                        <View
                          style={[
                            styles.roleBadge,
                            { backgroundColor: roleColors },
                          ]}
                        >
                          <Text style={styles.roleText}>
                            {getRoleDisplayName(item.role)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.memberEmail}>{memberEmail}</Text>
                      <Text style={styles.memberDate}>
                        Joined{" "}
                        {new Date(item.addedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>
                );
              }}
              style={styles.membersList}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View style={styles.memberSeparator} />
              )}
              ListEmptyComponent={() => (
                <View style={styles.center}>
                  <Text style={styles.emptyText}>No members found</Text>
                </View>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    ),
    [
      showMembersList,
      groupMembers,
      renderAvatar,
      getMemberRoleColor,
      getRoleDisplayName,
    ]
  );

  // Reaction picker modal
  const renderReactionPickerModal = useCallback(
    () => (
      <Modal
        visible={!!showReactionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowReactionPicker(null);
          setSelectedMessageForReaction(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.reactionPickerModal,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
            ]}
          >
            <View style={styles.reactionPickerCard}>
              <Text style={styles.reactionPickerTitle}>Choose a reaction</Text>
              <View style={styles.reactionsGrid}>
                {reactions.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      if (selectedMessageForReaction) {
                        addReaction(selectedMessageForReaction, emoji);
                      }
                    }}
                    style={styles.reactionOptionContainer}
                  >
                    <View style={styles.reactionOption}>
                      <Text style={styles.reactionOptionEmoji}>{emoji}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    ),
    [
      showReactionPicker,
      selectedMessageForReaction,
      addReaction,
      reactions,
      fadeAnim,
    ]
  );

  // Header with modern design and refresh button
  const renderHeader = useMemo(
    () => (
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <TouchableOpacity
          onPress={() => setShowGroupDetails(true)}
          style={styles.headerTouchable}
          activeOpacity={0.9}
        >
          <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.groupAvatarContainer}>
                  <View style={styles.groupAvatar}>
                    <Text style={styles.groupAvatarText}>👥</Text>
                  </View>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle} numberOfLines={1}>
                    {groupInfo?.name || "Group Chat"}
                  </Text>
                  <Text style={styles.headerSubtitle} numberOfLines={1}>
                    {getRoleDisplayName(currentUserRole)} • Tap for details
                  </Text>
                </View>
              </View>

              <View style={styles.headerRight}>
                {/* Refresh Button */}
                <TouchableOpacity
                  onPress={handleForceRefresh}
                  style={styles.headerActionButton}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="refresh" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowMembersList(true)}
                  style={styles.headerActionButton}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="people" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    ),
    [
      groupInfo?.name,
      groupMembers.length,
      currentUserRole,
      unreadCount,
      getRoleDisplayName,
      headerAnim,
      handleForceRefresh,
    ]
  );

  // Error state
  if (initializationError) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={64} color="#FF5100" />
        <Text style={styles.loadingText}>Failed to load chat</Text>
        <Text style={styles.errorText}>{initializationError}</Text>
        <TouchableOpacity onPress={handleForceRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (loading || isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009951" />
        <Text style={styles.loadingText}>
          {isInitializing ? "Initializing chat..." : "Loading messages..."}
        </Text>
        <TouchableOpacity onPress={handleForceRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        {renderConnectionStatus}
        {renderHeader}

        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#009951"]}
                tintColor="#009951"
                title="Pull to refresh"
                titleColor="#009951"
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesList}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={8}
            initialNumToRender={10}
            ListHeaderComponent={
              hasMoreMessages ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color="#FF5100" />
                  <Text style={styles.loadingMoreText}>
                    Loading older messages...
                  </Text>
                </View>
              ) : null
            }
          />

          {renderTypingIndicator}
        </View>

        {/* Input container positioned above navigation tabs */}
        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyingToContainer}>
              <View style={styles.replyingToGradient}>
                <View style={styles.replyingToContent}>
                  <Text style={styles.replyingToLabel}>
                    Replying to {replyingTo.sender.name}
                  </Text>
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
            </View>
          )}

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.messageInput}
                placeholder="Type your message..."
                placeholderTextColor="#94a3b8"
                value={newMessage}
                onChangeText={handleTextChange}
                multiline
                maxLength={1000}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              onPress={sendMessage}
              style={styles.sendButtonContainer}
              disabled={!newMessage.trim() || isSendingMessage}
            >
              <View
                style={[
                  styles.sendButton,
                  {
                    backgroundColor:
                      newMessage.trim() && !isSendingMessage
                        ? "#FF5100"
                        : "#e2e8f0",
                  },
                ]}
              >
                {isSendingMessage ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.sendIcon}>
                    {newMessage.trim() ? "➤" : "✏️"}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {renderGroupDetailsModal()}
        {renderMembersListModal()}
        {renderReactionPickerModal()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: "#FFF3DD",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF3DD",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: "#FF5100",
    textAlign: "center",
    fontStyle: "italic",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#009951",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // Header styles
  header: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  headerTouchable: {
    width: "100%",
  },
  headerContainer: {
    backgroundColor: "#009951",
    paddingTop: Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 24,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  groupAvatarContainer: {
    marginRight: 16,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  groupAvatarText: {
    fontSize: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  // Connection status
  connectionStatusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  connectionStatus: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#FF8C00",
  },
  connectionStatusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  // Messages container
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  messagesList: {
    paddingVertical: 16,
    paddingBottom: 180,
  },
  // Typing indicator
  typingContainer: {
    paddingVertical: 8,
    marginBottom: 10,
  },
  typingBubble: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  typingText: {
    fontSize: 14,
    color: "black",
    fontWeight: "500",
    marginRight: 8,
  },
  typingDots: {
    flexDirection: "row",
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF5100",
    marginHorizontal: 1,
  },
  // Message styles
  messageContainer: {
    marginVertical: 6,
    paddingHorizontal: 4,
  },
  ownMessageContainer: {
    alignItems: "flex-end",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: "85%",
  },
  messageAvatar: {
    marginHorizontal: 8,
    marginBottom: 4,
  },
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    borderWidth: 3,
    borderColor: "white",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: "white",
    fontWeight: "700",
  },
  messageBubbleContainer: {
    maxWidth: "100%",
  },
  ownMessageBubbleContainer: {
    marginLeft: 40,
  },
  messageBubble: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  ownMessage: {
    backgroundColor: "#A7C1A8",
    borderBottomRightRadius: 8,
  },
  otherMessage: {
    backgroundColor: "white",
    borderBottomLeftRadius: 8,
    marginRight: 40,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "black",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: "black",
    fontWeight: "500",
  },
  ownMessageText: {
    color: "white",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 6,
  },
  timeText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
  ownTimeText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  // Reactions
  reactionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginLeft: 52,
  },
  reactionBubbleContainer: {
    marginRight: 6,
    marginBottom: 4,
  },
  reactionBubble: {
    backgroundColor: "#FFF3DD",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF8C00",
  },
  userReactionBubble: {
    backgroundColor: "#FF5100",
    borderColor: "#FF5100",
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 2,
  },
  reactionCount: {
    fontSize: 12,
    color: "#FF5100",
    fontWeight: "600",
  },
  userReactionCount: {
    color: "white",
  },
  // Quick reactions
  quickReactionsContainer: {
    marginTop: 8,
    marginLeft: -5,
    alignSelf: "flex-start",
  },
  quickReactionsCard: {
    backgroundColor: "white",
    borderRadius: 24,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  quickReactionButton: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  quickReactionEmoji: {
    fontSize: 20,
  },
  moreReactionsButton: {
    marginLeft: 4,
  },
  moreReactionsGradient: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#009951",
  },
  moreReactionsText: {
    fontSize: 18,
    color: "white",
    fontWeight: "700",
  },
  // Input container
  inputContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  replyingToContainer: {
    marginBottom: 12,
  },
  replyingToGradient: {
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#FF5100",
    backgroundColor: "#FFF3DD",
  },
  replyingToContent: {
    flex: 1,
  },
  replyingToLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF5100",
    marginBottom: 2,
  },
  replyingToText: {
    fontSize: 14,
    color: "black",
    lineHeight: 18,
    fontWeight: "500",
  },
  cancelReplyButton: {
    backgroundColor: "#FFF3DD",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  cancelReplyIcon: {
    fontSize: 16,
    color: "#FF5100",
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#FFF3DD",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginRight: 12,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#FF8C00",
  },
  messageInput: {
    fontSize: 16,
    lineHeight: 22,
    color: "black",
    maxHeight: 92,
    fontWeight: "500",
  },
  sendButtonContainer: {
    shadowColor: "#FF5100",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 14,
  },
  sendButton: {
    borderRadius: 26,
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: {
    fontSize: 20,
    color: "white",
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 13,
    color: "black",
    fontWeight: "500",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFF3DD",
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop:
      Platform.OS === "ios"
        ? 60
        : StatusBar.currentHeight
          ? StatusBar.currentHeight + 16
          : 40,
    backgroundColor: "#009951",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
  },
  closeButton: {},
  closeButtonBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "700",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF3DD",
  },
  // Group details modal
  groupHeaderCard: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 28,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  groupIconContainer: {
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#009951",
  },
  groupIcon: {
    fontSize: 40,
  },
  groupName: {
    fontSize: 26,
    fontWeight: "700",
    color: "black",
    textAlign: "center",
    marginBottom: 10,
  },
  groupDescription: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: "500",
  },
  groupStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statCard: {
    alignItems: "center",
    minWidth: 90,
  },
  statGradient: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    minWidth: 80,
    backgroundColor: "#FF8C00",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Info cards
  infoCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "black",
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#FFF3DD",
  },
  infoLabel: {
    fontSize: 15,
    color: "black",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
    color: "black",
    fontWeight: "600",
  },
  // Members list
  membersList: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#FFF3DD",
  },
  memberCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  memberAvatar: {
    position: "relative",
    marginRight: 16,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#009951",
    borderWidth: 3,
    borderColor: "white",
  },
  memberInfo: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  memberName: {
    fontSize: 17,
    fontWeight: "600",
    color: "black",
    flex: 1,
  },
  roleBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  memberEmail: {
    fontSize: 14,
    color: "black",
    marginBottom: 4,
    fontWeight: "500",
  },
  memberDate: {
    fontSize: 12,
    color: "black",
    fontWeight: "500",
  },
  memberSeparator: {
    height: 1,
    backgroundColor: "#FFF3DD",
    marginHorizontal: 16,
  },
  // Reaction picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  reactionPickerModal: {
    margin: 20,
    maxWidth: width * 0.9,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
  },
  reactionPickerCard: {
    backgroundColor: "white",
    padding: 28,
  },
  reactionPickerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "black",
    textAlign: "center",
    marginBottom: 24,
  },
  reactionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  reactionOptionContainer: {
    margin: 8,
  },
  reactionOption: {
    backgroundColor: "#FFF3DD",
    borderRadius: 20,
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF8C00",
  },
  reactionOptionEmoji: {
    fontSize: 28,
  },
  // Empty state
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "500",
  },
});