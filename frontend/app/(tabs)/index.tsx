// // IndexScreen.tsx
// import React from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   SafeAreaView, 
//   TouchableOpacity 
// } from 'react-native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// async function logout() {
//   try {
//     await AsyncStorage.clear();  // Clears all AsyncStorage data[1]
//     console.log('Logout successful, AsyncStorage cleared.');
//     // Optionally, navigate to login screen here
//   } catch (e) {
//     console.error('Error clearing AsyncStorage during logout', e);
//   }
// }

// export default function IndexScreen() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.headerContainer}>
//         <Text style={styles.header}>ELDERLY</Text>
//         <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
//           <MaterialIcons name="logout" size={28} color="#f44336" />  {/* Logout icon[3] */}
//         </TouchableOpacity>
//       </View>
      
//       <Text style={styles.subheader}>
//         Your 24/7 assistant for monitoring, assistance, and entertainment.
//       </Text>

//       <View style={styles.cardGrid}>
//         <FeatureCard icon="mic" label="Voice Recorder" onPress={() => {}} />
//         <FeatureCard icon="favorite" label="Health Monitor" onPress={() => {}} />
//         <FeatureCard icon="group" label="Family Connect" onPress={() => {}} />
//         <FeatureCard icon="play-circle-outline" label="Entertainment" onPress={() => {}} />
//       </View>
//     </SafeAreaView>
//   );
// }

// function FeatureCard({
//   icon,
//   label,
//   onPress
// }: {
//   icon: string;
//   label: string;
//   onPress: () => void;
// }) {
//   return (
//     <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
//       <MaterialIcons name={icon} size={48} color="#4caf50" />  {/* Feature icon[3] */}
//       <Text style={styles.cardLabel}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F0F4FA',
//     padding: 20
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
//   header: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#1C1C1E',
//     textAlign: 'left',
//     marginVertical: 10
//   },
//   logoutBtn: {
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: 'rgba(244, 67, 54, 0.1)'
//   },
//   subheader: {
//     fontSize: 16,
//     color: '#6C6C70',
//     textAlign: 'center',
//     marginVertical: 10
//   },
//   cardGrid: {
//     flex: 1,
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginTop: 20
//   },
//   card: {
//     width: '48%',
//     height: 140,
//     backgroundColor: 'white',
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3
//   },
//   cardLabel: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#1C1C1E',
//     fontWeight: '500'
//   }
// });


// IndexScreen.tsx
// import React from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   SafeAreaView,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity
// } from 'react-native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// async function logout() {
//   try {
//     await AsyncStorage.clear();
//     console.log('Logout successful, AsyncStorage cleared.');
//     // TODO: Navigate to login screen
//   } catch (e) {
//     console.error('Error clearing AsyncStorage during logout', e);
//   }
// }

// export default function IndexScreen() {
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.headerRow}>
//         <Text style={styles.userName}>Aadarsh</Text>
//         <View style={styles.headerIcons}>
//           <TouchableOpacity onPress={logout} style={styles.iconBtn}>
//             <MaterialIcons name="person" size={28} color="#1C1C1E" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconBtn}>
//             <MaterialIcons name="notifications-none" size={28} color="#f44336" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Prompt */}
//       <View style={styles.promptBox}>
//         <Text style={styles.promptTitle}>Ask Me Anything…</Text>
//         <Text style={styles.promptSub}>push to talk or start typing…</Text>
//       </View>

//       {/* Tap-to-talk label */}
//       <Text style={styles.tapLabel}>tap to talk</Text>

//       {/* Mic Button */}
//       <View style={styles.micContainer}>
//         <TouchableOpacity style={styles.micBtn}>
//           <MaterialIcons name="mic-off" size={64} color="#f44336" />
//         </TouchableOpacity>
//       </View>

//       {/* Bottom Navigation */}
//       <View style={styles.tabBar}>
//         <TouchableOpacity style={styles.tabItem}>
//           <MaterialIcons name="music-note" size={28} color="gray" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.tabItem}>
//           <MaterialIcons name="home" size={28} color="#007AFF" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.tabItem}>
//           <MaterialIcons name="check-circle-outline" size={28} color="gray" />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFFDDD',
//     padding: 20,
//     justifyContent: 'space-between'
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   },
//   userName: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#1C1C1E'
//   },
//   headerIcons: {
//     flexDirection: 'row',
//     alignItems: 'center'
//   },
//   iconBtn: {
//     marginLeft: 16,
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: 'rgba(0,0,0,0.05)'
//   },
//   promptBox: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   promptTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#1C1C1E',
//     marginBottom: 12
//   },
//   promptSub: {
//     fontSize: 16,
//     color: '#6C6C70'
//   },
//   tapLabel: {
//     textAlign: 'center',
//     color: '#6C6C70',
//     marginBottom: -8
//   },
//   micContainer: {
//     alignItems: 'center',
//     marginVertical: 20
//   },
//   micBtn: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 2,
//     borderColor: '#f44336',
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   tabBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 12,
//     backgroundColor: '#FFFDDD'
//   },
//   tabItem: {
//     alignItems: 'center'
//   }
// });




// IndexScreen.tsx (Elderly Side)

// IndexScreen.tsx (Elderly Side)
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LocationService from "../../utils/LocationService";

const { width } = Dimensions.get("window");

async function logout() {
  try {
    LocationService.stopTracking(); // Stop location tracking on logout
    await AsyncStorage.clear();
    console.log("Logout successful, AsyncStorage cleared.");
  } catch (e) {
    console.error("Error clearing AsyncStorage during logout", e);
  }
}

export default function IndexScreen() {
  useEffect(() => {
    // Start location tracking when app loads
    const initializeLocationTracking = async () => {
      const success = await LocationService.startTracking();
      if (success) {
        console.log("Location tracking started successfully");
      }
    };

    initializeLocationTracking();

    // Cleanup on unmount
    return () => {
      LocationService.stopTracking();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.welcomeSection}>
            <Text style={styles.userName}>Aadarsh</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={logout} style={styles.iconBtn}>
              <MaterialIcons name="person" size={32} color="#FF5100" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialIcons name="notifications" size={32} color="#FF5100" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MaterialIcons name="location-on" size={28} color="#009951" />
            <Text style={styles.statusTitle}>Location Safe</Text>
          </View>
          <Text style={styles.statusSubtext}>
            Your location is being monitored for safety
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: "#009951" }]}
            >
              <MaterialIcons name="local-hospital" size={36} color="#FFF3DD" />
              <Text style={styles.quickActionText}>Emergency</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: "#FF8C00" }]}
            >
              <MaterialIcons name="phone" size={36} color="#FFF3DD" />
              <Text style={styles.quickActionText}>Call Family</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: "#C15C2D" }]}
            >
              <MaterialIcons name="medication" size={36} color="#FFF3DD" />
              <Text style={styles.quickActionText}>Medicine</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: "#FF5100" }]}
            >
              <MaterialIcons name="help" size={36} color="#FFF3DD" />
              <Text style={styles.quickActionText}>Help</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Voice Assistant Section */}
        <View style={styles.voiceSection}>
          <Text style={styles.sectionTitle}>Voice Assistant</Text>
          <View style={styles.promptBox}>
            <Text style={styles.promptTitle}>Ask Me Anything</Text>
            <Text style={styles.promptSub}>
              Tap the microphone and speak clearly
            </Text>
          </View>

          {/* Mic Button */}
          <View style={styles.micContainer}>
            <TouchableOpacity style={styles.micBtn} activeOpacity={0.8}>
              <MaterialIcons name="mic" size={48} color="#FFF3DD" />
            </TouchableOpacity>
            <Text style={styles.tapLabel}>Tap to Talk</Text>
          </View>
        </View>

        {/* Health Reminders */}
        <View style={styles.remindersSection}>
          <Text style={styles.sectionTitle}>Today's Reminders</Text>
          <View style={styles.reminderCard}>
            <View style={styles.reminderIcon}>
              <MaterialIcons name="schedule" size={24} color="#FF8C00" />
            </View>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Take Morning Medicine</Text>
              <Text style={styles.reminderTime}>9:00 AM</Text>
            </View>
            <TouchableOpacity style={styles.reminderCheck}>
              <MaterialIcons
                name="check-circle-outline"
                size={28}
                color="#009951"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.reminderCard}>
            <View style={styles.reminderIcon}>
              <MaterialIcons name="restaurant" size={24} color="#C15C2D" />
            </View>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Lunch Time</Text>
              <Text style={styles.reminderTime}>12:30 PM</Text>
            </View>
            <TouchableOpacity style={styles.reminderCheck}>
              <MaterialIcons
                name="check-circle-outline"
                size={28}
                color="#009951"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      {/* <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="favorite" size={32} color="#C15C2D" />
          <Text style={styles.tabLabel}>Health</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
          <MaterialIcons name="home" size={32} color="#FF5100" />
          <Text style={[styles.tabLabel, styles.activeTabLabel]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="people" size={32} color="#C15C2D" />
          <Text style={styles.tabLabel}>Family</Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF3DD",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Changed from 20 to 120 for tab bar space
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 40,
    marginBottom: 24,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    color: "#C15C2D",
    fontWeight: "500",
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF5100",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    marginLeft: 16,
    padding: 12,
    borderRadius: 25,
    backgroundColor: "rgba(255, 81, 0, 0.1)",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF5100",
  },
  statusCard: {
    backgroundColor: "rgba(0, 153, 81, 0.1)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(0, 153, 81, 0.2)",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#009951",
    marginLeft: 12,
  },
  statusSubtext: {
    fontSize: 16,
    color: "#009951",
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF5100",
    marginBottom: 16,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: (width - 60) / 2,
    aspectRatio: 1.2,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF3DD",
    marginTop: 12,
    textAlign: "center",
  },
  voiceSection: {
    marginBottom: 32,
  },
  promptBox: {
    backgroundColor: "rgba(255, 140, 0, 0.1)",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 140, 0, 0.2)",
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF8C00",
    marginBottom: 8,
    textAlign: "center",
  },
  promptSub: {
    fontSize: 16,
    color: "#C15C2D",
    textAlign: "center",
  },
  micContainer: {
    alignItems: "center",
  },
  micBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FF5100",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#FF5100",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 12,
  },
  tapLabel: {
    fontSize: 16,
    color: "#C15C2D",
    fontWeight: "500",
  },
  remindersSection: {
    marginBottom: 20,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 140, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF5100",
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 16,
    color: "#C15C2D",
  },
  reminderCheck: {
    padding: 8,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(193, 92, 45, 0.1)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: "rgba(255, 81, 0, 0.1)",
  },
  tabLabel: {
    fontSize: 14,
    color: "#C15C2D",
    marginTop: 4,
    fontWeight: "500",
  },
  activeTabLabel: {
    color: "#FF5100",
    fontWeight: "bold",
  },
});
