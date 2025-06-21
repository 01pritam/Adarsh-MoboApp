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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import socketService from "../../../utils/socketService.js";

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

export default function GroupMessageScreen({
  groupId: propGroupId,
}: GroupMessageProps) {
  // Get safe area insets for proper spacing
  const insets = useSafeAreaInsets();

  // Tab bar height from your ElderlyTabs.tsx
  const TAB_BAR_HEIGHT = 80;
  const INPUT_CONTAINER_HEIGHT = 70;

  // Performance optimization refs
  const componentId = useRef(`CHAT_${Math.random().toString(36).substr(2, 9)}`);
  const initializationStarted = useRef(false);
  const socketInitialized = useRef(false);
  const currentUserSet = useRef(false);

  // Core state
  const [actualGroupId, setActualGroupId] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Message state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
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
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastLoadTime = useRef(0);

  // Color palette for member avatars
  const memberColors = [
    "#FF8C00", "#C15C2D", "#009951", "#FF5100",
    "#FFA500", "#32CD32", "#FF6347", "#20B2AA",
  ];

  // Extended emoji reactions
  const reactions = [
    "👍", "❤️", "😂", "😮", "😢", "😡", "👏", "🔥",
    "💯", "🎉", "😍", "🤔", "👎", "😴", "🤯", "🙄",
  ];

  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  // Initialize groupId
  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;

    const initializeGroupId = async () => {
      try {
        const storedId = await AsyncStorage.getItem("groupId");
        const finalGroupId = propGroupId || storedId;
        if (finalGroupId) {
          setActualGroupId(finalGroupId);
        } else {
          Alert.alert("Error", "No group ID found. Please select a group first.");
        }
      } catch (error) {
        console.error(`💥 [${componentId.current}] Error getting groupId:`, error);
      }
    };

    initializeGroupId();
  }, [propGroupId]);

  // Initialize current user
  useEffect(() => {
    if (!actualGroupId || currentUserSet.current) return;

    const initializeUser = async () => {
      try {
        const [userId, userName, userEmail] = await Promise.all([
          AsyncStorage.getItem("userId"),
          AsyncStorage.getItem("userName"),
          AsyncStorage.getItem("userEmail"),
        ]);

        if (userId) {
          const userData = { _id: userId, name: userName, email: userEmail };
          setCurrentUser(userData);
          currentUserSet.current = true;
        }
      } catch (error) {
        console.error(`💥 [${componentId.current}] Error setting current user:`, error);
      }
    };

    initializeUser();
  }, [actualGroupId]);

  // Initialize WebSocket
  useEffect(() => {
    if (socketInitialized.current) return;

    const initializeSocket = async () => {
      try {
        socketInitialized.current = true;
        setConnectionStatus("Connecting...");
        await socketService.connect();
        setIsConnected(true);
        setConnectionStatus("Connected");
      } catch (error) {
        console.error(`❌ [${componentId.current}] WebSocket connection failed:`, error);
        setIsConnected(false);
        setConnectionStatus("Using REST API");
      }
    };

    initializeSocket();
  }, []);

  // Setup socket listeners
  useEffect(() => {
    if (!isConnected || !actualGroupId || !currentUser) return;

    socketService.joinGroup(actualGroupId);

    socketService.onNewMessage((data) => {
      const { message, groupId } = data;
      if (groupId === actualGroupId) {
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
      const { userId, groupId, isTyping } = data;
      if (groupId === actualGroupId && userId !== currentUser._id) {
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
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg))
      );
    });

    return () => {
      socketService.removeListener("new_message");
      socketService.removeListener("user_typing");
      socketService.removeListener("reaction_added");
      socketService.removeListener("group_joined");
    };
  }, [isConnected, actualGroupId, currentUser]);

  // Load data when ready
  useEffect(() => {
    if (!actualGroupId || !currentUser || isInitializing) return;

    const initializeData = async () => {
      setIsInitializing(true);
      try {
        await Promise.all([loadGroupInfo(), loadMessages()]);
      } catch (error) {
        console.error(`💥 [${componentId.current}] Data initialization error:`, error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeData();
  }, [actualGroupId, currentUser]);

  // Auth headers
  const getAuthHeaders = useCallback(async () => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("No auth token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  // Load group info
  const loadGroupInfo = useCallback(async () => {
    if (!actualGroupId || !currentUser || isLoadingGroupInfo) return;

    setIsLoadingGroupInfo(true);
    try {
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
        setCurrentUserRole("member");
      }
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
    setNewMessage("");
    setReplyingTo(null);

    try {
      if (isConnected) {
        socketService.sendMessage(
          actualGroupId,
          {
            text: messageText,
            type: "text",
          },
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

        if (response.ok) {
          const data = await response.json();
          const sentMessage = data.data?.message || data.message;
          setMessages((prev) => [...prev, sentMessage]);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    } catch (error) {
      console.error(`💥 [${componentId.current}] Error sending message:`, error);
      Alert.alert("Error", "Failed to send message");
      setNewMessage(messageText);
    } finally {
      setIsSendingMessage(false);
    }
  }, [actualGroupId, newMessage, replyingTo, isConnected, isSendingMessage, getAuthHeaders]);

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

  // Reload messages function
  const reloadMessages = useCallback(() => {
    setRefreshing(true);
    loadMessages(1);
  }, [loadMessages]);

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

          if (response.ok) {
            const data = await response.json();
            const updatedReactions = data.data?.reactions || data.reactions || [];
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

          if (response.ok) {
            const data = await response.json();
            const updatedReactions = data.data?.reactions || data.reactions || [];
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
  const getMemberColor = useCallback((userId: string) => {
    const index = groupMembers.findIndex(member => member.userId._id === userId);
    return memberColors[index % memberColors.length];
  }, [groupMembers]);

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
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (diffInDays < 1) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } else if (diffInDays < 7) {
        return date.toLocaleDateString([], {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } else {
        return date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
    } catch (error) {
      console.error(`💥 Error formatting time for ${dateString}:`, error);
      return "Invalid date";
    }
  }, []);

  // Render avatar
  const renderAvatar = useCallback(
    (user: any, size: number = 40) => {
      const backgroundColor = getMemberColor(user?._id || user?.userId?._id);

      if (user?.profilePicture) {
        return (
          <Image
            source={{ uri: user.profilePicture }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 2,
              borderColor: "#fff",
            }}
          />
        );
      }

      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "#fff",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: size * 0.35 }}>
            {getUserInitials(user?.name || user?.userId?.name || "U")}
          </Text>
        </View>
      );
    },
    [getMemberColor, getUserInitials]
  );

  // Connection status
  const renderConnectionStatus = useMemo(() => {
    if (isConnected) return null;

    return (
      <View style={{ backgroundColor: "#ef4444", paddingVertical: 8, paddingHorizontal: 16, alignItems: "center" }}>
        <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
          🔴 {connectionStatus}
        </Text>
      </View>
    );
  }, [isConnected, connectionStatus]);

  // Typing indicator
  const renderTypingIndicator = useMemo(() => {
    if (typingUsers.size === 0) return null;

    const typingUserNames = Array.from(typingUsers).map((userId) => {
      const member = groupMembers.find((m) => m.userId._id === userId);
      return member?.userId.name || "Someone";
    });

    return (
      <View style={{ paddingHorizontal: 20, paddingVertical: 8, backgroundColor: "#f9fafb" }}>
        <Text style={{ fontSize: 14, color: "#6b7280", fontStyle: "italic" }}>
          {typingUserNames.join(", ")}{" "}
          {typingUserNames.length === 1 ? "is" : "are"} typing...
        </Text>
      </View>
    );
  }, [typingUsers, groupMembers]);

  // Quick reactions
  const renderQuickReactions = useCallback(
    (messageId: string) => {
      if (showQuickReactions !== messageId) return null;

      return (
        <View style={{
          flexDirection: "row",
          backgroundColor: "white",
          borderRadius: 24,
          paddingHorizontal: 8,
          paddingVertical: 8,
          marginTop: 8,
          marginLeft: 48,
          alignSelf: "flex-start",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          {quickReactions.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => addReaction(messageId, emoji)}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 16,
                marginHorizontal: 2,
              }}
            >
              <Text style={{ fontSize: 20 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => {
              setSelectedMessageForReaction(messageId);
              setShowReactionPicker(messageId);
              setShowQuickReactions(null);
            }}
            style={{
              backgroundColor: "#f3f4f6",
              borderRadius: 16,
              paddingHorizontal: 10,
              paddingVertical: 4,
              marginLeft: 4,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 16, color: "#6b7280", fontWeight: "600" }}>+</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [showQuickReactions, addReaction]
  );

  // Message reactions
  const renderMessageReactions = useCallback(
    (message: Message) => {
      if (!message.reactions || message.reactions.length === 0) return null;

      const groupedReactions = message.reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction);
        return acc;
      }, {} as Record<string, any[]>);

      return (
        <View style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: 8,
          marginLeft: 48,
        }}>
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
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginRight: 6,
                  marginBottom: 4,
                  backgroundColor: userReacted ? "#3b82f6" : "#f9fafb",
                  borderWidth: userReacted ? 0 : 1,
                  borderColor: "transparent",
                }}
              >
                <Text style={{ fontSize: 14, marginRight: 4 }}>{emoji}</Text>
                <Text style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: userReacted ? "white" : "#6b7280",
                }}>
                  {reactions.length}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    },
    [currentUser, addReaction, removeReaction]
  );

  // Message item - No avatar for sent messages
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwnMessage = item.sender._id === currentUser?._id;
      const hasReactions = item.reactions && item.reactions.length > 0;

      const showSenderName =
        !isOwnMessage &&
        (index === 0 || messages[index - 1]?.sender._id !== item.sender._id);

      return (
        <View style={{
          marginVertical: 4,
          paddingHorizontal: 4,
          alignItems: isOwnMessage ? "flex-end" : "flex-start",
        }}>
          <View style={{
            flexDirection: isOwnMessage ? "row-reverse" : "row",
            alignItems: "flex-end",
            maxWidth: "85%",
          }}>
            {/* Only show avatar for received messages */}
            {!isOwnMessage && (
              <View style={{ marginHorizontal: 8, marginBottom: 4 }}>
                {renderAvatar(item.sender, 32)}
              </View>
            )}

            <TouchableOpacity
              onLongPress={() => setShowQuickReactions(item._id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                backgroundColor: isOwnMessage ? "#10b981" : "white",
                borderBottomRightRadius: isOwnMessage ? 4 : 16,
                borderBottomLeftRadius: isOwnMessage ? 16 : 4,
                marginLeft: isOwnMessage ? 40 : 0,
                marginRight: isOwnMessage ? 0 : 40,
              }}
              activeOpacity={0.8}
            >
              {showSenderName && (
                <Text style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#6b7280",
                  marginBottom: 4,
                }}>
                  {item.sender.name}
                </Text>
              )}
              <Text style={{
                fontSize: 16,
                lineHeight: 20,
                color: isOwnMessage ? "white" : "#1f2937",
              }}>
                {item.content.text}
              </Text>
              <View style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: 4,
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: isOwnMessage ? "rgba(255,255,255,0.8)" : "#9ca3af",
                }}>
                  {formatTime(item.createdAt)}
                  {item.isEdited && " • edited"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {hasReactions && renderMessageReactions(item)}
          {renderQuickReactions(item._id)}
        </View>
      );
    },
    [currentUser, messages, renderAvatar, formatTime, renderMessageReactions, renderQuickReactions]
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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fef3e2" }}>
          <View style={{
            backgroundColor: "#16a34a",
            paddingHorizontal: 20,
            paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 40,
            paddingBottom: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>Group Details</Text>
            <TouchableOpacity
              onPress={() => setShowGroupDetails(false)}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: 20,
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="close" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 16 }}>
            {groupInfo ? (
              <>
                <View style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 20,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                  <View style={{
                    backgroundColor: "#10b981",
                    borderRadius: 40,
                    width: 80,
                    height: 80,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}>
                    <MaterialIcons name="groups" size={36} color="white" />
                  </View>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#1f2937",
                    textAlign: "center",
                    marginBottom: 8,
                  }}>
                    {groupInfo.name}
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: "#6b7280",
                    textAlign: "center",
                    lineHeight: 24,
                    marginBottom: 20,
                  }}>
                    {groupInfo.description}
                  </Text>

                  <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                    <View style={{
                      alignItems: "center",
                      backgroundColor: "#fef3e2",
                      borderRadius: 12,
                      padding: 16,
                      minWidth: 80,
                    }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#ea580c",
                        marginBottom: 4,
                      }}>
                        {groupMembers.length}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: "#6b7280",
                        fontWeight: "500",
                        textAlign: "center",
                      }}>
                        Members
                      </Text>
                    </View>
                    <View style={{
                      alignItems: "center",
                      backgroundColor: "#fef3e2",
                      borderRadius: 12,
                      padding: 16,
                      minWidth: 80,
                    }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#ea580c",
                        marginBottom: 4,
                      }}>
                        {messages.length}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: "#6b7280",
                        fontWeight: "500",
                        textAlign: "center",
                      }}>
                        Messages
                      </Text>
                    </View>
                    <View style={{
                      alignItems: "center",
                      backgroundColor: "#fef3e2",
                      borderRadius: 12,
                      padding: 16,
                      minWidth: 80,
                    }}>
                      <Text style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#ea580c",
                        marginBottom: 4,
                      }}>
                        {Math.ceil(
                          (Date.now() - new Date(groupInfo.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                        )}
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: "#6b7280",
                        fontWeight: "500",
                        textAlign: "center",
                      }}>
                        Days
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#1f2937",
                    marginBottom: 16,
                  }}>
                    Information
                  </Text>

                  <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#fef3e2",
                  }}>
                    <Text style={{ fontSize: 14, color: "#6b7280", fontWeight: "500" }}>Type</Text>
                    <Text style={{ fontSize: 14, color: "#1f2937", fontWeight: "600" }}>
                      {groupInfo.groupType}
                    </Text>
                  </View>

                  <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#fef3e2",
                  }}>
                    <Text style={{ fontSize: 14, color: "#6b7280", fontWeight: "500" }}>Created</Text>
                    <Text style={{ fontSize: 14, color: "#1f2937", fontWeight: "600" }}>
                      {new Date(groupInfo.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </View>

                  <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                  }}>
                    <Text style={{ fontSize: 14, color: "#6b7280", fontWeight: "500" }}>Created By</Text>
                    <Text style={{ fontSize: 14, color: "#1f2937", fontWeight: "600" }}>
                      {groupInfo.createdBy.name}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 16, color: "#9ca3af", fontStyle: "italic" }}>
                  No group information available
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fef3e2" }}>
          <View style={{
            backgroundColor: "#16a34a",
            paddingHorizontal: 20,
            paddingTop: Platform.OS === "ios" ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 40,
            paddingBottom: 20,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
              Members ({groupMembers.length})
            </Text>
            <TouchableOpacity
              onPress={() => setShowMembersList(false)}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: 20,
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="close" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={groupMembers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              const memberName = item.userId?.name || item.userId?.email || "Unknown User";
              const memberEmail = item.userId?.email || "No email provided";
              const roleColor = getMemberColor(item.userId._id);

              return (
                <View style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 16,
                  marginHorizontal: 16,
                  marginVertical: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                  {renderAvatar(item.userId || { name: memberName }, 50)}

                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <View style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#1f2937",
                        flex: 1,
                      }}>
                        {memberName}
                      </Text>
                      <View style={{
                        borderRadius: 12,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        backgroundColor: roleColor,
                      }}>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color: "white",
                          textAlign: "center",
                        }}>
                          {getRoleDisplayName(item.role)}
                        </Text>
                      </View>
                    </View>
                    <Text style={{
                      fontSize: 14,
                      color: "#6b7280",
                      marginBottom: 2,
                    }}>
                      {memberEmail}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#9ca3af" }}>
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
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{
                  fontSize: 16,
                  color: "#9ca3af",
                  fontStyle: "italic",
                  textAlign: "center",
                }}>
                  No members found
                </Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    ),
    [showMembersList, groupMembers, renderAvatar, getMemberColor, getRoleDisplayName]
  );

  // Reaction picker modal
  const renderReactionPickerModal = useCallback(
    () => (
      <Modal
        visible={!!showReactionPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowReactionPicker(null);
          setSelectedMessageForReaction(null);
        }}
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <View style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            marginHorizontal: 20,
            maxWidth: "90%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 16,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#1f2937",
              textAlign: "center",
              marginBottom: 20,
            }}>
              Choose a reaction
            </Text>

            <View style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
            }}>
              {reactions.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (selectedMessageForReaction) {
                      addReaction(selectedMessageForReaction, emoji);
                    }
                  }}
                  style={{
                    backgroundColor: "#fef3e2",
                    borderRadius: 16,
                    width: 56,
                    height: 56,
                    alignItems: "center",
                    justifyContent: "center",
                    margin: 6,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    ),
    [showReactionPicker, selectedMessageForReaction, addReaction, reactions]
  );

  // UPDATED HEADER - Completely removed the "24" badge
  const renderHeader = useMemo(
    () => (
      <View style={{
        backgroundColor: "#16a34a",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "ios" ? 64 : StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 40,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
        <TouchableOpacity
          onPress={() => setShowGroupDetails(true)}
          style={{ flex: 1 }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
            {groupInfo?.name || "Group Chat"}
          </Text>
          <Text style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.8)",
            marginTop: 2,
            fontWeight: "500",
          }}>
            {groupMembers.length} members • {getRoleDisplayName(currentUserRole)}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Reload button */}
          <TouchableOpacity
            onPress={reloadMessages}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <MaterialIcons name="refresh" size={20} color="white" />
          </TouchableOpacity>

          {/* People icon */}
          <TouchableOpacity
            onPress={() => setShowMembersList(true)}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="people" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [groupInfo?.name, groupMembers.length, currentUserRole, getRoleDisplayName, reloadMessages]
  );

  // Early returns
  if (!actualGroupId || !currentUser) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#10b981" }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ marginTop: 20, fontSize: 16, color: "white", fontWeight: "600" }}>
          Initializing chat...
        </Text>
      </View>
    );
  }

  if (loading && messages.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#10b981" }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ marginTop: 20, fontSize: 16, color: "white", fontWeight: "600" }}>
          Loading messages...
        </Text>
      </View>
    );
  }

  // MAIN RETURN - Fixed layout with improved input styling
  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <StatusBar barStyle="light-content" backgroundColor="#16a34a" />

      {renderConnectionStatus}
      {renderHeader}

      {/* Messages Container */}
      <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessage}
          onEndReached={loadMoreMessages}
          onEndReachedThreshold={0.1}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadMessages(1);
          }}
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={8}
          initialNumToRender={10}
          ListHeaderComponent={
            hasMoreMessages ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#16a34a" />
                <Text style={{
                  marginTop: 8,
                  fontSize: 14,
                  color: "#6b7280",
                  fontWeight: "500",
                }}>
                  Loading older messages...
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ 
            paddingBottom: TAB_BAR_HEIGHT + INPUT_CONTAINER_HEIGHT + 40
          }}
        />

        {renderTypingIndicator}
      </View>

      {/* UPDATED INPUT CONTAINER - Better styled placeholder and no "24" badge */}
      <View style={{
        position: "absolute",
        bottom: TAB_BAR_HEIGHT,
        left: 0,
        right: 0,
        height: INPUT_CONTAINER_HEIGHT,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
        {replyingTo && (
          <View style={{
            backgroundColor: "#f0fdf4",
            borderRadius: 12,
            padding: 8,
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 10,
                fontWeight: "600",
                color: "#16a34a",
                marginBottom: 1,
              }}>
                Replying to {replyingTo.sender.name}
              </Text>
              <Text style={{
                fontSize: 12,
                color: "#6b7280",
                lineHeight: 14,
              }}>
                {replyingTo.content.text}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setReplyingTo(null)}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: 12,
                width: 24,
                height: 24,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 8,
              }}
            >
              <MaterialIcons name="close" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        {/* IMPROVED INPUT ROW - Better styled placeholder */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Input Field - Improved styling */}
          <View style={{
            flex: 1,
            backgroundColor: "#f8f9fa",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginRight: 12,
            minHeight: 44,
            maxHeight: 100,
            borderWidth: 1,
            borderColor: "#e9ecef",
            justifyContent: "center",
          }}>
            <TextInput
              ref={inputRef}
              value={newMessage}
              onChangeText={handleTextChange}
              placeholder="Type a message..."
              placeholderTextColor="#6c757d"
              multiline
              style={{
                fontSize: 16,
                lineHeight: 22,
                color: "#212529",
                textAlignVertical: "center",
                fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                fontWeight: '400',
                paddingVertical: 0,
              }}
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            onPress={sendMessage}
            disabled={isSendingMessage || !newMessage.trim()}
            style={{
              borderRadius: 22,
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: newMessage.trim() ? "#16a34a" : "#d1d5db",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {renderGroupDetailsModal()}
      {renderMembersListModal()}
      {renderReactionPickerModal()}
    </View>
  );
}


