// LocationService.js - Updated for Expo
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LocationService {
  constructor() {
    this.subscription = null;
    this.isTracking = false;
  }

  async requestLocationPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async sendLocationToBackend(latitude, longitude) {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');
      
      const response = await fetch('https://elderlybackend.onrender.com/api/location/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          latitude,
          longitude,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error sending location:', error);
    }
  }

  async startTracking() {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      return false;
    }

    this.subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000,
        distanceInterval: 10,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        this.sendLocationToBackend(latitude, longitude);
      }
    );

    this.isTracking = true;
    return true;
  }

  stopTracking() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
      this.isTracking = false;
    }
  }
}

export default new LocationService();
