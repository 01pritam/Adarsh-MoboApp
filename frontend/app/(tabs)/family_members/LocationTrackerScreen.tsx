// LocationTrackerScreen.tsx (Fixed Version)
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationData {
  userId: string;
  name: string;
  role: string;
  location: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  geofence: {
    center: {
      latitude: number;
      longitude: number;
    };
    radius: number;
    updatedAt: string;
  };
}

export default function LocationTrackerScreen() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInsideSafeZone, setIsInsideSafeZone] = useState(true);
  const [elderlyUserId, setElderlyUserId] = useState<string>('');

  // Initialize elderlyUserId and start fetching data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Try to get from AsyncStorage first
        const storedUserId = await AsyncStorage.getItem('elderlyUserId');
        const userId = storedUserId || '6851b7fcc249a68ff0ec2ae1'; // Fallback to hardcoded ID
        
        setElderlyUserId(userId);
        
        // Fetch data immediately after setting userId
        await fetchLocationData(userId);
        
      } catch (error) {
        console.error('Error initializing data:', error);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Set up polling when elderlyUserId is available
  useEffect(() => {
    if (elderlyUserId) {
      // Set up polling every 10 seconds
      const interval = setInterval(() => {
        fetchLocationData(elderlyUserId);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [elderlyUserId]);

  const fetchLocationData = async (userId?: string) => {
    const targetUserId = userId || elderlyUserId;
    
    if (!targetUserId) {
      console.error('No userId available for fetching location');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      
      console.log('Fetching location for userId:', targetUserId);
      
      const response = await fetch(
        `https://elderlybackend.onrender.com/api/location/user/${targetUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Location data received:', data);
      
      setLocationData(data);
      checkSafeZoneStatus(data);
      
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Error', `Failed to fetch location data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSafeZoneStatus = (data: LocationData) => {
    if (!data.location || !data.geofence) {
      console.log('Missing location or geofence data');
      return;
    }

    const distance = calculateDistance(
      data.location.latitude,
      data.location.longitude,
      data.geofence.center.latitude,
      data.geofence.center.longitude
    );

    const isInside = distance <= data.geofence.radius;
    setIsInsideSafeZone(isInside);

    console.log(`Distance: ${distance}m, Radius: ${data.geofence.radius}m, Inside: ${isInside}`);

    // Show alert if outside safe zone
    if (!isInside) {
      Alert.alert(
        'Safety Alert',
        `${data.name} is outside the safe zone!`,
        [
          { text: 'OK', style: 'default' },
          { text: 'Call Now', style: 'destructive', onPress: makeCall }
        ]
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const makeCall = () => {
    // Replace with actual phone number from user data
    const phoneNumber = 'tel:+1234567890';
    Linking.openURL(phoneNumber).catch(err => 
      Alert.alert('Error', 'Unable to make call')
    );
  };

  // Add manual refresh function
  const handleRefresh = () => {
    fetchLocationData();
  };

  if (loading && !locationData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading location data...</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!locationData) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#f44336" />
        <Text style={styles.errorText}>Unable to load location data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with refresh button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Elderly Location Tracker</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <MaterialIcons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={[
        styles.statusContainer,
        { backgroundColor: isInsideSafeZone ? '#e8f5e8' : '#ffebee' }
      ]}>
        <MaterialIcons 
          name={isInsideSafeZone ? 'check-circle' : 'warning'} 
          size={24} 
          color={isInsideSafeZone ? '#4caf50' : '#f44336'} 
        />
        <Text style={[
          styles.statusText,
          { color: isInsideSafeZone ? '#4caf50' : '#f44336' }
        ]}>
          {isInsideSafeZone ? 'Inside Safe Zone' : 'Outside Safe Zone'}
        </Text>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: locationData.location.latitude,
            longitude: locationData.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          region={{
            latitude: locationData.location.latitude,
            longitude: locationData.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {/* Elderly user marker */}
          <Marker
            coordinate={{
              latitude: locationData.location.latitude,
              longitude: locationData.location.longitude,
            }}
            title={locationData.name}
            description="Current Location"
          >
            <MaterialIcons name="person-pin" size={40} color="#007AFF" />
          </Marker>

          {/* Safe zone circle */}
          <Circle
            center={{
              latitude: locationData.geofence.center.latitude,
              longitude: locationData.geofence.center.longitude,
            }}
            radius={locationData.geofence.radius}
            strokeColor="rgba(76, 175, 80, 0.8)"
            fillColor="rgba(76, 175, 80, 0.2)"
            strokeWidth={2}
          />
        </MapView>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{locationData.name}</Text>
        <Text style={styles.lastUpdate}>
          Last updated: {new Date(locationData.location.updatedAt).toLocaleTimeString()}
        </Text>
      </View>

      {/* Call Button */}
      <TouchableOpacity style={styles.callButton} onPress={makeCall}>
        <MaterialIcons name="phone" size={28} color="white" />
        <Text style={styles.callButtonText}>Call</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDDD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDDD',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDDD',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  refreshButton: {
    padding: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    flex: 1,
  },
  userInfo: {
    padding: 20,
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  lastUpdate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  callButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
