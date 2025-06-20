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
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

async function logout() {
  try {
    await AsyncStorage.clear();
    console.log('Logout successful, AsyncStorage cleared.');
    // TODO: Navigate to login screen
  } catch (e) {
    console.error('Error clearing AsyncStorage during logout', e);
  }
}

export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.userName}>Aadarsh</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={logout} style={styles.iconBtn}>
            <MaterialIcons name="person" size={28} color="#1C1C1E" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="notifications-none" size={28} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Prompt */}
      <View style={styles.promptBox}>
        <Text style={styles.promptTitle}>Ask Me Anything…</Text>
        <Text style={styles.promptSub}>push to talk or start typing…</Text>
      </View>

      {/* Tap-to-talk label */}
      <Text style={styles.tapLabel}>tap to talk</Text>

      {/* Mic Button */}
      <View style={styles.micContainer}>
        <TouchableOpacity style={styles.micBtn}>
          <MaterialIcons name="mic-off" size={64} color="#f44336" />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="music-note" size={28} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="home" size={28} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="check-circle-outline" size={28} color="gray" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDDD',
    padding: 20,
    justifyContent: 'space-between'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E'
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconBtn: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  promptBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  promptTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12
  },
  promptSub: {
    fontSize: 16,
    color: '#6C6C70'
  },
  tapLabel: {
    textAlign: 'center',
    color: '#6C6C70',
    marginBottom: -8
  },
  micContainer: {
    alignItems: 'center',
    marginVertical: 20
  },
  micBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#f44336',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#FFFDDD'
  },
  tabItem: {
    alignItems: 'center'
  }
});
