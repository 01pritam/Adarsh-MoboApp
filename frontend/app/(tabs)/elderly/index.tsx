// IndexScreen.tsx (Elderly Side) - Home Page with Features & SOS
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LocationService from '../../../utils/LocationService';

const { width } = Dimensions.get('window');

async function logout() {
  try {
    LocationService.stopTracking();
    await AsyncStorage.clear();
    console.log('Logout successful, AsyncStorage cleared.');
  } catch (e) {
    console.error('Error clearing AsyncStorage during logout', e);
  }
}

export default function IndexScreen() {
  const [locationActive, setLocationActive] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [userName, setUserName] = useState('Aadarsh');

  useEffect(() => {
    const initializeLocationTracking = async () => {
      const success = await LocationService.startTracking();
      setLocationActive(success);
      if (success) {
        console.log('Location tracking started successfully');
      }
    };

    const loadUserName = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) {
          setUserName(storedName);
        }
      } catch (error) {
        console.error('Error loading user name:', error);
      }
    };

    initializeLocationTracking();
    loadUserName();

    return () => {
      LocationService.stopTracking();
    };
  }, []);

  const sendSOSAlert = async () => {
    setSosLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      const response = await fetch('https://elderlybackend.onrender.com/api/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: "Something went wrong, please help!"
        })
      });

      if (response.ok) {
        Alert.alert(
          'SOS Alert Sent!',
          'Emergency alert has been sent to your family members and caregivers.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('Failed to send SOS alert');
      }
    } catch (error) {
      console.error('SOS Error:', error);
      Alert.alert(
        'SOS Alert Failed',
        'Unable to send emergency alert. Please try again or call emergency services directly.',
        [
          { text: 'Retry', onPress: sendSOSAlert },
          { text: 'Cancel' }
        ]
      );
    } finally {
      setSosLoading(false);
    }
  };

  const confirmSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'Are you sure you want to send an emergency alert to your family and caregivers?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send SOS', style: 'destructive', onPress: sendSOSAlert }
      ]
    );
  };

  const features = [
    {
      icon: 'location-on',
      title: 'Location Tracking',
      description: 'Your location is being monitored for safety',
      color: '#4CAF50',
      status: locationActive ? 'Active' : 'Inactive'
    },
    {
      icon: 'video-camera-back',
      title: 'Fall Detection',
      description: 'AI-powered fall detection monitoring',
      color: '#FF9800',
      status: 'Monitoring'
    },
    {
      icon: 'medication',
      title: 'Medicine Reminders',
      description: 'Never miss your medication schedule',
      color: '#2196F3',
      status: 'Scheduled'
    },
    {
      icon: 'family-restroom',
      title: 'Family Connect',
      description: 'Stay connected with your loved ones',
      color: '#9C27B0',
      status: 'Connected'
    },
    {
      icon: 'health-and-safety',
      title: 'Health Monitoring',
      description: 'Track your daily health metrics',
      color: '#F44336',
      status: 'Active'
    },
    {
      icon: 'support-agent',
      title: '24/7 Support',
      description: 'Round-the-clock assistance available',
      color: '#00BCD4',
      status: 'Available'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.userName}>Hello, {userName}</Text>
          <Text style={styles.subtitle}>Welcome to ElderCare</Text>
        </View>
        <View style={styles.headerIcons}>
          
        </View>
      </View>

      {/* Location Status */}
      <View style={[
        styles.locationStatus,
        { backgroundColor: locationActive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }
      ]}>
        <MaterialIcons 
          name="location-on" 
          size={24} 
          color={locationActive ? '#4caf50' : '#f44336'} 
        />
        <Text style={[
          styles.locationText,
          { color: locationActive ? '#4caf50' : '#f44336' }
        ]}>
          Location tracking {locationActive ? 'active' : 'inactive'}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Message */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Your Safety Dashboard</Text>
          <Text style={styles.welcomeDescription}>
            Monitor your health, stay connected with family, and get help when you need it.
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Available Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity key={index} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                  <MaterialIcons name={feature.icon} size={32} color="#FFF" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${feature.color}20` }]}>
                  <Text style={[styles.statusText, { color: feature.color }]}>
                    {feature.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <MaterialIcons name="phone" size={32} color="#4CAF50" />
              <Text style={styles.quickActionText}>Call Family</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <MaterialIcons name="medical-services" size={32} color="#2196F3" />
              <Text style={styles.quickActionText}>Health Check</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <MaterialIcons name="chat" size={32} color="#FF9800" />
              <Text style={styles.quickActionText}>Send Message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <MaterialIcons name="settings" size={32} color="#9C27B0" />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* SOS Button */}
      <View style={styles.sosContainer}>
        <Text style={styles.sosLabel}>Emergency Help</Text>
        <TouchableOpacity 
          style={[styles.sosButton, sosLoading && styles.sosButtonDisabled]}
          onPress={confirmSOS}
          disabled={sosLoading}
        >
          {sosLoading ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : (
            <>
              <MaterialIcons name="emergency" size={48} color="#FFF" />
              <Text style={styles.sosText}>SOS</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.sosDescription}>
          Tap to send emergency alert to your family and caregivers
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3DD',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5100',
  },
  subtitle: {
    fontSize: 16,
    color: '#C15C2D',
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginLeft: 16,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 81, 0, 0.1)',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 20,
    marginBottom: 20,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF5100',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5100',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  sosContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sosLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5100',
    marginBottom: 12,
  },
  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF5100',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF5100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 12,
  },
  sosButtonDisabled: {
    backgroundColor: '#ccc',
    shadowColor: '#ccc',
  },
  sosText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  sosDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
