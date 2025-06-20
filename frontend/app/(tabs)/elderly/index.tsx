// IndexScreen.tsx (Elderly Side)
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LocationService from '../../../utils/LocationService';

async function logout() {
  try {
    LocationService.stopTracking(); // Stop location tracking on logout
    await AsyncStorage.clear();
    console.log('Logout successful, AsyncStorage cleared.');
  } catch (e) {
    console.error('Error clearing AsyncStorage during logout', e);
  }
}

export default function IndexScreen() {
  useEffect(() => {
    // Start location tracking when app loads
    const initializeLocationTracking = async () => {
      const success = await LocationService.startTracking();
      if (success) {
        console.log('Location tracking started successfully');
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

      {/* Location Status */}
      <View style={styles.locationStatus}>
        <MaterialIcons name="location-on" size={24} color="#4caf50" />
        <Text style={styles.locationText}>Location tracking active</Text>
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
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 20
  },
  locationText: {
    marginLeft: 8,
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '500'
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
