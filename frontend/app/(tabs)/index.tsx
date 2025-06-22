// app/(tabs)/index.tsx - Clean Version with No Safety Alerts
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Geolocation from 'react-native-geolocation-service';
import MapView, { Circle, Marker } from 'react-native-maps';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

// Interfaces
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

interface VideoAnalysisResult {
  fallDetected: boolean;
  confidence: number;
  timestamp: string;
  alertLevel: 'low' | 'medium' | 'high';
  fallTime?: number;
  videoDuration: number;
  analysisType: 'dummy' | 'real';
  summary: string;
  recommendations: string[];
}

interface DashboardStats {
  totalAlerts: number;
  fallsDetected: number;
  safeHours: number;
  lastActivity: string;
  locationUpdates: number;
  emergencyContacts: number;
}

export default function IndexScreen() {
  // State Management
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysisResult>({
    fallDetected: false,
    confidence: 0.85,
    timestamp: new Date().toISOString(),
    alertLevel: 'low',
    fallTime: undefined,
    videoDuration: 60,
    analysisType: 'dummy',
    summary: "No analysis performed yet. Click 'Analyze Video' to simulate fall detection.",
    recommendations: ["Regular monitoring recommended", "Ensure clear walkways"]
  });
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalAlerts: 0,
    fallsDetected: 0,
    safeHours: 24,
    lastActivity: 'Just now',
    locationUpdates: 0,
    emergencyContacts: 2
  });
  const [locationPermission, setLocationPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isInsideSafeZone, setIsInsideSafeZone] = useState(true);
  const [elderlyUserId, setElderlyUserId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Constants for alert limiting
  const ALERT_DISTANCE_THRESHOLD = 100; // meters

  // Dummy Analysis Scenarios
  const dummyAnalysisScenarios = [
    {
      fallDetected: false,
      confidence: 0.95,
      alertLevel: 'low' as const,
      fallTime: undefined,
      videoDuration: 60,
      analysisType: 'dummy' as const,
      summary: "Normal activity detected throughout the monitoring period. Person appears stable and mobile with good balance.",
      recommendations: [
        "Continue regular monitoring",
        "Maintain current safety measures",
        "Keep walkways clear of obstacles",
        "Ensure adequate lighting"
      ]
    },
    {
      fallDetected: true,
      confidence: 0.92,
      alertLevel: 'high' as const,
      fallTime: 23.5,
      videoDuration: 60,
      analysisType: 'dummy' as const,
      summary: "CRITICAL: Fall detected at 23.5 seconds. Person appears to lose balance suddenly and fall backward. Immediate attention required.",
      recommendations: [
        "🚨 IMMEDIATE: Check for injuries and consciousness",
        "🚨 IMMEDIATE: Call emergency services if unresponsive",
        "📞 Contact family members immediately",
        "🏥 Consider medical evaluation even if conscious",
        "🔍 Review environment for fall hazards"
      ]
    },
    {
      fallDetected: true,
      confidence: 0.76,
      alertLevel: 'medium' as const,
      fallTime: 45.2,
      videoDuration: 60,
      analysisType: 'dummy' as const,
      summary: "Possible fall or stumble detected at 45.2 seconds. Person appears to lose footing but may have partially recovered.",
      recommendations: [
        "✅ Verify person's current condition",
        "🔍 Check for minor injuries or discomfort",
        "📋 Document incident for medical records",
        "🚶‍♂️ Consider mobility assessment",
        "🏠 Review home safety measures"
      ]
    },
    {
      fallDetected: false,
      confidence: 0.88,
      alertLevel: 'low' as const,
      fallTime: undefined,
      videoDuration: 60,
      analysisType: 'dummy' as const,
      summary: "Routine daily activities observed. Person moving confidently with no signs of distress or instability.",
      recommendations: [
        "Monitoring system functioning well",
        "No immediate concerns detected",
        "Continue scheduled check-ins",
        "Maintain emergency contact list"
      ]
    }
  ];

  // Initialization
  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      await requestLocationPermission();
      await initializeLocationData();
      startLocationTracking();
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
    }
  };

  // Location Permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location for safety monitoring.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        setLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.error('Location permission error:', err);
      }
    } else {
      setLocationPermission(true);
    }
  };

  // Initialize Location Data
  const initializeLocationData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('elderlyUserId');
      const userId = storedUserId || '6851b7fcc249a68ff0ec2ae1';
      
      setElderlyUserId(userId);
      await fetchLocationData(userId);
    } catch (error) {
      console.error('Initialize location data error:', error);
    }
  };

  // Fetch Location Data
  const fetchLocationData = async (userId?: string) => {
    const targetUserId = userId || elderlyUserId;
    
    if (!targetUserId) {
      setLocationLoading(false);
      return;
    }

    try {
      setLocationLoading(true);
      
      const token = await AsyncStorage.getItem('accessToken');
      const url = `https://elderlybackend.onrender.com/api/location/user/${targetUserId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setLocationData(data);
      checkSafeZoneStatus(data);
      
      setDashboardStats(prev => ({
        ...prev,
        locationUpdates: prev.locationUpdates + 1,
        lastActivity: 'Just now'
      }));
      
    } catch (error) {
      console.error('Fetch location error:', error);
      setLocationData(null);
    } finally {
      setLocationLoading(false);
    }
  };

  // ✅ Check Safe Zone Status WITHOUT alerts
  const checkSafeZoneStatus = (data: LocationData) => {
    if (!data.location || !data.geofence || !data.geofence.center) {
      setIsInsideSafeZone(true);
      return;
    }

    try {
      const userLat = parseFloat(data.location.latitude);
      const userLng = parseFloat(data.location.longitude);
      const centerLat = parseFloat(data.geofence.center.latitude);
      const centerLng = parseFloat(data.geofence.center.longitude);
      const radius = parseFloat(data.geofence.radius);

      if (isNaN(userLat) || isNaN(userLng) || isNaN(centerLat) || isNaN(centerLng) || isNaN(radius)) {
        setIsInsideSafeZone(true);
        return;
      }

      const distance = calculateDistance(userLat, userLng, centerLat, centerLng);
      const isInside = distance <= radius;
      
      setIsInsideSafeZone(isInside);

      // ✅ Only log status, no alerts
      if (!isInside && distance > ALERT_DISTANCE_THRESHOLD) {
        console.log(`User outside safe zone - Distance: ${distance.toFixed(0)}m, Threshold: ${ALERT_DISTANCE_THRESHOLD}m`);
      } else if (!isInside && distance <= ALERT_DISTANCE_THRESHOLD) {
        console.log(`User outside safe zone but distance too small: ${distance.toFixed(0)}m`);
      } else if (isInside) {
        console.log(`User is inside safe zone. Distance: ${distance.toFixed(0)}m`);
      }
    } catch (error) {
      console.error('Safe zone calculation error:', error);
      setIsInsideSafeZone(true);
    }
  };

  // Distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Location Tracking
  const startLocationTracking = () => {
    if (!locationPermission) return;

    try {
      const watchId = Geolocation.watchPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
            accuracy: position.coords.accuracy,
          };
          setCurrentLocation(locationData);
        },
        (error) => {
          console.error('Location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 30000,
          fastestInterval: 15000,
        }
      );

      return () => Geolocation.clearWatch(watchId);
    } catch (error) {
      console.error('Start location tracking error:', error);
    }
  };

  // Polling Setup
  useEffect(() => {
    if (elderlyUserId) {
      const interval = setInterval(() => {
        fetchLocationData(elderlyUserId);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [elderlyUserId]);

  // ✅ Dummy Video Analysis Function WITHOUT alerts
  const performDummyAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Select random analysis result
      const randomScenario = dummyAnalysisScenarios[Math.floor(Math.random() * dummyAnalysisScenarios.length)];
      
      const analysisResult = {
        ...randomScenario,
        timestamp: new Date().toISOString()
      };
      
      setVideoAnalysis(analysisResult);
      
      // Update dashboard stats
      setDashboardStats(prev => ({
        ...prev,
        totalAlerts: analysisResult.fallDetected ? prev.totalAlerts + 1 : prev.totalAlerts,
        fallsDetected: analysisResult.fallDetected ? prev.fallsDetected + 1 : prev.fallsDetected,
        lastActivity: 'Just now'
      }));

      // ✅ Only log results, no alerts
      if (analysisResult.fallDetected) {
        console.log('Fall detected in analysis:', {
          confidence: analysisResult.confidence,
          fallTime: analysisResult.fallTime,
          alertLevel: analysisResult.alertLevel
        });
      } else {
        console.log('Normal activity detected in analysis');
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to perform analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Utility Functions
  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    Geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
        };
        setCurrentLocation(locationData);
        setLocationLoading(false);
      },
      (error) => {
        console.error('Get current location error:', error);
        setLocationLoading(false);
        Alert.alert('Location Error', 'Unable to get current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const makeCall = () => {
    const phoneNumber = 'tel:+1234567890';
    Linking.openURL(phoneNumber).catch(err => {
      console.error('Make call error:', err);
      Alert.alert('Error', 'Unable to make call');
    });
  };

  const makeEmergencyCall = () => {
    const phoneNumber = 'tel:+911234567890';
    Linking.openURL(phoneNumber).catch(err => {
      console.error('Make emergency call error:', err);
      Alert.alert('Error', 'Unable to make emergency call');
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchLocationData();
      getCurrentLocation();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      console.log("Logout successful");
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'low': return '#009951';
      case 'medium': return '#FF8C00';
      case 'high': return '#FF5100';
      default: return '#009951';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.welcomeSection}>
            <Text style={styles.userName}>Safety Dashboard</Text>
            <Text style={styles.subtitle}>Real-time Monitoring</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={getCurrentLocation} style={styles.iconBtn}>
              <MaterialIcons name="my-location" size={28} color="#FF5100" />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.iconBtn}>
              <MaterialIcons name="logout" size={28} color="#FF5100" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Status Card with Map */}
        <View style={styles.locationCard}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="location-on" size={24} color="#009951" />
            <Text style={styles.cardTitle}>Location Status</Text>
            {locationLoading && <ActivityIndicator size="small" color="#009951" />}
          </View>
          
          {/* Safe Zone Status */}
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

          {/* Map View */}
          {(currentLocation || locationData) && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={{
                  latitude: currentLocation?.latitude || locationData?.location.latitude || 0,
                  longitude: currentLocation?.longitude || locationData?.location.longitude || 0,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
              >
                {/* Current Device Location Marker */}
                {currentLocation && (
                  <Marker
                    coordinate={{
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                    }}
                    title="Your Current Location"
                    pinColor="blue"
                  />
                )}

                {/* Elderly Person Location Marker */}
                {locationData && (
                  <Marker
                    coordinate={{
                      latitude: locationData.location.latitude,
                      longitude: locationData.location.longitude,
                    }}
                    title={`${locationData.name}'s Location`}
                    pinColor="red"
                  />
                )}

                {/* Safe Zone Circle */}
                {locationData && locationData.geofence && (
                  <Circle
                    center={{
                      latitude: locationData.geofence.center.latitude,
                      longitude: locationData.geofence.center.longitude,
                    }}
                    radius={locationData.geofence.radius}
                    strokeColor="rgba(0, 153, 81, 0.5)"
                    fillColor="rgba(0, 153, 81, 0.2)"
                  />
                )}
              </MapView>
            </View>
          )}
          
          {/* Location Data Display */}
          {locationData ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                📍 {locationData.location.latitude.toFixed(6)}, {locationData.location.longitude.toFixed(6)}
              </Text>
              <Text style={styles.addressText}>
                User: {locationData.name} ({locationData.role})
              </Text>
              <Text style={styles.timestampText}>
                Last updated: {new Date(locationData.location.updatedAt).toLocaleTimeString()}
              </Text>
              <Text style={styles.accuracyText}>
                Safe zone radius: {locationData.geofence.radius}m
              </Text>
            </View>
          ) : (
            <Text style={styles.noLocationText}>
              {locationPermission ? 'Loading location data...' : 'Location permission required'}
            </Text>
          )}
        </View>

        {/* Fall Detection Analysis Dashboard */}
        <View style={styles.videoAnalysisSection}>
          <Text style={styles.sectionTitle}>Fall Detection Analysis</Text>
          
          {/* Analysis Placeholder */}
          <View style={styles.analysisPlaceholder}>
            <MaterialIcons name="analytics" size={64} color="#FF5100" />
            <Text style={styles.placeholderTitle}>AI-Powered Fall Detection</Text>
            <Text style={styles.placeholderSubtitle}>
              Simulated analysis using advanced machine learning algorithms
            </Text>
          </View>

          {/* Analysis Button */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              { backgroundColor: isAnalyzing ? '#ccc' : '#FF5100' }
            ]}
            onPress={performDummyAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.analyzeButtonText}>Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.analyzeButtonText}>Perform Fall Detection Analysis</Text>
            )}
          </TouchableOpacity>

          {/* Analysis Results */}
          <View style={styles.analysisResults}>
            <Text style={styles.analysisResultsTitle}>Latest Analysis Results</Text>
            
            {/* Status Overview */}
            <View style={styles.statusOverview}>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: videoAnalysis.fallDetected ? '#FF5100' : '#009951' }
              ]}>
                <MaterialIcons 
                  name={videoAnalysis.fallDetected ? "warning" : "check-circle"} 
                  size={32} 
                  color="#FFF" 
                />
              </View>
              <View style={styles.statusInfo}>
                <Text style={[
                  styles.statusTitle,
                  { color: videoAnalysis.fallDetected ? '#FF5100' : '#009951' }
                ]}>
                  {videoAnalysis.fallDetected ? 'Fall Detected' : 'Normal Activity'}
                </Text>
                <Text style={styles.confidenceText}>
                  Confidence: {(videoAnalysis.confidence * 100).toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Analysis Details */}
            <View style={styles.analysisDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Analysis Type:</Text>
                <Text style={styles.detailValue}>
                  {videoAnalysis.analysisType === 'dummy' ? 'Simulated' : 'Real-time'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Alert Level:</Text>
                <View style={[
                  styles.alertBadge,
                  { backgroundColor: getAlertColor(videoAnalysis.alertLevel) }
                ]}>
                  <Text style={styles.alertText}>
                    {videoAnalysis.alertLevel.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              {videoAnalysis.fallTime && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fall Time:</Text>
                  <Text style={styles.detailValue}>
                    {formatTime(videoAnalysis.fallTime)}
                  </Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Analysis:</Text>
                <Text style={styles.detailValue}>
                  {new Date(videoAnalysis.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>

            {/* Summary */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Analysis Summary</Text>
              <Text style={styles.summaryText}>{videoAnalysis.summary}</Text>
            </View>

            {/* Recommendations */}
            {videoAnalysis.recommendations.length > 0 && (
              <View style={styles.recommendationsSection}>
                <Text style={styles.recommendationsTitle}>Recommendations</Text>
                {videoAnalysis.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Emergency Actions */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>Emergency Actions</Text>
          <View style={styles.emergencyGrid}>
            <TouchableOpacity
              style={[styles.emergencyBtn, { backgroundColor: "#FF5100" }]}
              onPress={makeEmergencyCall}
            >
              <MaterialIcons name="phone" size={32} color="#FFF" />
              <Text style={styles.emergencyText}>Emergency Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.emergencyBtn, { backgroundColor: "#009951" }]}
              onPress={getCurrentLocation}
            >
              <MaterialIcons name="gps-fixed" size={32} color="#FFF" />
              <Text style={styles.emergencyText}>Update Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 20,
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
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF5100",
  },
  subtitle: {
    fontSize: 16,
    color: "#C15C2D",
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    marginLeft: 12,
    padding: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 81, 0, 0.1)",
  },
  
  // Location Card Styles
  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF5100",
    marginLeft: 12,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Map Styles
  mapContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  map: {
    width: '100%',
    height: 250,
  },
  
  locationInfo: {
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#009951",
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  timestampText: {
    fontSize: 12,
    color: "#999",
  },
  accuracyText: {
    fontSize: 12,
    color: "#999",
  },
  noLocationText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },

  // Video Analysis Styles
  videoAnalysisSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF5100",
    marginBottom: 16,
  },
  analysisPlaceholder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF5100',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  analyzeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  analysisResults: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  analysisResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5100',
    marginBottom: 16,
  },
  statusOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statusIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
  },
  analysisDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  alertText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  summarySection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5100',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  recommendationsSection: {
    padding: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#009951',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationBullet: {
    fontSize: 16,
    color: '#009951',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 18,
  },

  // Emergency Section Styles
  emergencySection: {
    marginBottom: 20,
  },
  emergencyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  emergencyBtn: {
    width: (width - 60) / 2,
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 8,
    textAlign: "center",
  },
});
