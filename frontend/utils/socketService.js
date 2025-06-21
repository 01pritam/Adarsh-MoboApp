import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("No authentication credentials found");
      }

      console.log("🔌 Connecting to Socket.IO server...");

      // ✅ FIXED: Better configuration for deployed servers
      this.socket = io("https://elderlybackend.onrender.com", {
        transports: ["polling", "websocket"], // ✅ Start with polling, then upgrade
        upgrade: true,
        rememberUpgrade: false, // ✅ Don't remember upgrade for deployed servers
        timeout: 30000, // ✅ Increase timeout for slow servers
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 5,
        // ✅ Add these for deployed servers
        withCredentials: false,
        extraHeaders: {
          "User-Agent": "ReactNative",
        },
      });

      this.setupEventListeners();

      // Authenticate after connection
      this.socket.on("connect", () => {
        console.log("🔌 Connected to WebSocket server");
        this.isConnected = true;
        this.reconnectAttempts = 0;

        this.socket.emit("authenticate", {
          userId: userId,
          token: token,
        });
      });

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 30000);

        this.socket.on("authenticated", () => {
          clearTimeout(timeout);
          resolve(true);
        });

        this.socket.on("auth_error", (error) => {
          clearTimeout(timeout);
          reject(error);
        });

        this.socket.on("connect_error", (error) => {
          clearTimeout(timeout);
          console.error("❌ Connection error:", error);
          reject(error);
        });
      });
    } catch (error) {
      console.error("❌ Socket connection error:", error);
      throw error;
    }
  }

  setupEventListeners() {
    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from server:", reason);
      this.isConnected = false;

      // Only auto-reconnect if server disconnected us
      if (reason === "io server disconnect") {
        this.reconnect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      this.isConnected = false;
      this.reconnect();
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after max attempts");
      this.isConnected = false;
    });
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}`);

      setTimeout(
        () => {
          if (this.socket) {
            this.socket.connect();
          }
        },
        Math.pow(2, this.reconnectAttempts) * 1000
      ); // Exponential backoff
    } else {
      console.error("❌ Max reconnection attempts reached");
      this.isConnected = false;
    }
  }

  // Join a group
  joinGroup(groupId) {
    if (this.socket && this.isConnected) {
      console.log("👥 Joining group:", groupId);
      this.socket.emit("join_group", { groupId });
    }
  }

  // Leave a group
  leaveGroup(groupId) {
    if (this.socket && this.isConnected) {
      console.log("👋 Leaving group:", groupId);
      this.socket.emit("leave_group", { groupId });
    }
  }

  // Send message
  sendMessage(groupId, content, replyTo = null) {
    if (this.socket && this.isConnected) {
      console.log("📤 Sending message to group:", groupId);
      this.socket.emit("send_message", {
        groupId,
        content,
        replyTo,
      });
    }
  }

  // Typing indicators
  startTyping(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing_start", { groupId });
    }
  }

  stopTyping(groupId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing_stop", { groupId });
    }
  }

  // Add reaction
  addReaction(messageId, emoji) {
    if (this.socket && this.isConnected) {
      console.log("😀 Adding reaction:", emoji, "to message:", messageId);
      this.socket.emit("add_reaction", { messageId, emoji });
    }
  }

  // Event listeners
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("new_message", callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  onReactionAdded(callback) {
    if (this.socket) {
      this.socket.on("reaction_added", callback);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on("user_joined", callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on("user_left", callback);
    }
  }

  onGroupJoined(callback) {
    if (this.socket) {
      this.socket.on("group_joined", callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on("error", callback);
    }
  }

  // Remove event listeners
  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null,
    };
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting from Socket.IO server...");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }
}

export default new SocketService();
