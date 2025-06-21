// app/(tabs)/index.tsx - Enhanced Video Analysis with Video Player
import React, { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Linking,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  RefreshControl,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, Circle } from 'react-native-maps';
import { VideoView, useVideoPlayer } from 'expo-video';

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
  totalFrames: number;
  videoDuration: number;
  fallEvents: Array<{
    timestamp: number;
    confidence: number;
    severity: string;
  }>;
  geminiAnalysis: {
    summary: string;
    riskFactors: string[];
    recommendations: string[];
  };
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
    totalFrames: 1800,
    videoDuration: 60,
    fallEvents: [],
    geminiAnalysis: {
      summary: "No falls detected in the video",
      riskFactors: [],
      recommendations: []
    }
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Video Player Setup
  const videoSource = '../../data/pose1.mp4'; // Replace with your hardcoded video
  const player = useVideoPlayer(videoSource, player => {
    player.loop = false;
    player.muted = false;
  });

  // Hardcoded Analysis Results
  const analysisScenarios = [
    {
      fallDetected: false,
      confidence: 0.95,
      alertLevel: 'low' as const,
      fallTime: undefined,
      totalFrames: 1800,
      videoDuration: 60,
      fallEvents: [],
      geminiAnalysis: {
        summary: "Normal activity detected throughout the video. Person appears stable and mobile.",
        riskFactors: [],
        recommendations: ["Continue regular monitoring", "Maintain current safety measures"]
      }
    },
    {
      fallDetected: true,
      confidence: 0.92,
      alertLevel: 'high' as const,
      fallTime: 23.5,
      totalFrames: 1800,
      videoDuration: 60,
      fallEvents: [
        { timestamp: 23.5, confidence: 0.92, severity: 'High' },
        { timestamp: 24.1, confidence: 0.88, severity: 'Medium' }
      ],
      geminiAnalysis: {
        summary: "Fall detected at 23.5 seconds. Person appears to lose balance and fall backward.",
        riskFactors: ["Unsteady gait", "Poor lighting", "Cluttered environment"],
        recommendations: [
          "Immediate medical attention required",
          "Check for injuries",
          "Improve lighting in the area",
          "Remove obstacles from walkway"
        ]
      }
    },
    {
      fallDetected: true,
      confidence: 0.76,
      alertLevel: 'medium' as const,
      fallTime: 45.2,
      totalFrames: 1800,
      videoDuration: 60,
      fallEvents: [
        { timestamp: 45.2, confidence: 0.76, severity: 'Medium' }
      ],
      geminiAnalysis: {
        summary: "Possible fall detected at 45.2 seconds. Person appears to stumble but may have recovered.",
        riskFactors: ["Uneven surface", "Rapid movement"],
        recommendations: [
          "Verify person's condition",
          "Check for minor injuries",
          "Consider mobility aids",
          "Improve surface conditions"
        ]
      }
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
      console.error('Dashboard initialization error:', error);
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
    } finally {
      setLocationLoading(false);
    }
  };

  // Check Safe Zone Status
  const checkSafeZoneStatus = (data: LocationData) => {
    if (!data.location || !data.geofence) return;

    const distance = calculateDistance(
      data.location.latitude,
      data.location.longitude,
      data.geofence.center.latitude,
      data.geofence.center.longitude
    );

    const isInside = distance <= data.geofence.radius;
    setIsInsideSafeZone(isInside);

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

  // Calculate Distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

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

  // Video Analysis Function
  const analyzeVideo = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Select random analysis result
      const randomScenario = analysisScenarios[Math.floor(Math.random() * analysisScenarios.length)];
      
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

      // Show alert if fall detected
      if (analysisResult.fallDetected) {
        Alert.alert(
          '⚠️ Fall Detected!',
          `Fall detected at ${analysisResult.fallTime}s with ${(analysisResult.confidence * 100).toFixed(1)}% confidence.\n\n${analysisResult.geminiAnalysis.summary}`,
          [
            { text: 'View Details', style: 'default' },
            { text: 'Emergency Call', style: 'destructive', onPress: makeEmergencyCall }
          ]
        );
      } else {
        Alert.alert(
          '✅ Analysis Complete',
          'No falls detected in the video. All activities appear normal.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Video analysis error:', error);
      Alert.alert('Error', 'Failed to analyze video');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Video Control Functions
  const toggleVideoPlayback = () => {
    if (isVideoPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsVideoPlaying(!isVideoPlaying);
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

        {/* Enhanced Video Analysis Dashboard */}
        <View style={styles.videoAnalysisSection}>
          <Text style={styles.sectionTitle}>Fall Detection Analysis</Text>
          
          {/* Video Player */}
          <View style={styles.videoContainer}>
            <VideoView
              style={styles.videoPlayer}
              player={player}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
            />
            
            {/* Video Controls Overlay */}
            <View style={styles.videoControlsOverlay}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={toggleVideoPlayback}
              >
                <MaterialIcons 
                  name={isVideoPlaying ? "pause" : "play-arrow"} 
                  size={32} 
                  color="#FFF" 
                />
              </TouchableOpacity>
              
              {/* Analysis Status Badge */}
              <View style={[
                styles.analysisStatusBadge,
                { backgroundColor: videoAnalysis.fallDetected ? '#FF5100' : '#009951' }
              ]}>
                <MaterialIcons 
                  name={videoAnalysis.fallDetected ? "warning" : "check-circle"} 
                  size={16} 
                  color="#FFF" 
                />
                <Text style={styles.analysisStatusText}>
                  {videoAnalysis.fallDetected ? 'FALL DETECTED' : 'NORMAL'}
                </Text>
              </View>
            </View>

            {/* Fall Detection Timeline */}
            {videoAnalysis.fallDetected && videoAnalysis.fallTime && (
              <View style={styles.fallTimeline}>
                <View style={styles.timelineBar}>
                  <View 
                    style={[
                      styles.fallMarker,
                      { left: `${(videoAnalysis.fallTime / videoAnalysis.videoDuration) * 100}%` }
                    ]}
                  >
                    <MaterialIcons name="warning" size={12} color="#FF5100" />
                  </View>
                </View>
                <Text style={styles.fallTimeText}>
                  Fall at {formatTime(videoAnalysis.fallTime)}
                </Text>
              </View>
            )}
          </View>

          {/* Analysis Controls */}
          <TouchableOpacity
            style={[
              styles.analyzeButton,
              { backgroundColor: isAnalyzing ? '#ccc' : '#FF5100' }
            ]}
            onPress={analyzeVideo}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.analyzeButtonText}>Analyzing Video...</Text>
              </View>
            ) : (
              <Text style={styles.analyzeButtonText}>Analyze Video for Falls</Text>
            )}
          </TouchableOpacity>

          {/* Detailed Analysis Results */}
          <View style={styles.analysisResults}>
            <Text style={styles.analysisResultsTitle}>Analysis Results</Text>
            
            {/* Basic Results */}
            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Status:</Text>
                <Text style={[
                  styles.resultValue,
                  { color: videoAnalysis.fallDetected ? '#FF5100' : '#009951' }
                ]}>
                  {videoAnalysis.fallDetected ? 'Fall Detected' : 'Normal Activity'}
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Confidence:</Text>
                <Text style={styles.resultValue}>
                  {(videoAnalysis.confidence * 100).toFixed(1)}%
                </Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Alert Level:</Text>
                <View style={[
                  styles.alertBadge,
                  { backgroundColor: getAlertColor(videoAnalysis.alertLevel) }
                ]}>
                  <Text style={styles.alertText}>
                    {videoAnalysis.alertLevel.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Video Duration:</Text>
                <Text style={styles.resultValue}>
                  {formatTime(videoAnalysis.videoDuration)}
                </Text>
              </View>
            </View>

            {/* Fall Events */}
            {videoAnalysis.fallEvents.length > 0 && (
              <View style={styles.fallEventsSection}>
                <Text style={styles.fallEventsTitle}>Fall Events Detected:</Text>
                {videoAnalysis.fallEvents.map((event, index) => (
                  <View key={index} style={styles.fallEventItem}>
                    <MaterialIcons name="warning" size={16} color="#FF5100" />
                    <Text style={styles.fallEventText}>
                      {formatTime(event.timestamp)} - {event.severity} confidence ({(event.confidence * 100).toFixed(1)}%)
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Gemini AI Analysis */}
            <View style={styles.geminiAnalysisSection}>
              <Text style={styles.geminiAnalysisTitle}>🤖 AI Analysis Summary</Text>
              <Text style={styles.geminiSummary}>{videoAnalysis.geminiAnalysis.summary}</Text>
              
              {videoAnalysis.geminiAnalysis.riskFactors.length > 0 && (
                <View style={styles.riskFactorsSection}>
                  <Text style={styles.riskFactorsTitle}>⚠️ Risk Factors:</Text>
                  {videoAnalysis.geminiAnalysis.riskFactors.map((factor, index) => (
                    <Text key={index} style={styles.riskFactorItem}>• {factor}</Text>
                  ))}
                </View>
              )}
              
              {videoAnalysis.geminiAnalysis.recommendations.length > 0 && (
                <View style={styles.recommendationsSection}>
                  <Text style={styles.recommendationsTitle}>💡 Recommendations:</Text>
                  {videoAnalysis.geminiAnalysis.recommendations.map((rec, index) => (
                    <Text key={index} style={styles.recommendationItem}>• {rec}</Text>
                  ))}
                </View>
              )}
            </View>
            
            <Text style={styles.analysisTimestamp}>
              Last analyzed: {new Date(videoAnalysis.timestamp).toLocaleString()}
            </Text>
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

const getAlertColor = (level: string) => {
  switch (level) {
    case 'low': return '#009951';
    case 'medium': return '#FF8C00';
    case 'high': return '#FF5100';
    default: return '#009951';
  }
};

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
    height: 200,
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

  // Enhanced Video Analysis Styles
  videoAnalysisSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF5100",
    marginBottom: 16,
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  videoControlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 30,
    padding: 15,
  },
  analysisStatusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  analysisStatusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fallTimeline: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  timelineBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  fallMarker: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    backgroundColor: '#FF5100',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallTimeText: {
    color: '#FFF',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  analyzeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
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
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  resultGrid: {
    gap: 12,
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  alertBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fallEventsSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  fallEventsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5100',
    marginBottom: 8,
  },
  fallEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  fallEventText: {
    fontSize: 14,
    color: '#E65100',
  },
  geminiAnalysisSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F3E5F5',
    borderRadius: 8,
  },
  geminiAnalysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B1FA2',
    marginBottom: 8,
  },
  geminiSummary: {
    fontSize: 14,
    color: '#4A148C',
    marginBottom: 12,
    lineHeight: 20,
  },
  riskFactorsSection: {
    marginBottom: 12,
  },
  riskFactorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF8F00',
    marginBottom: 6,
  },
  riskFactorItem: {
    fontSize: 13,
    color: '#F57C00',
    marginBottom: 2,
  },
  recommendationsSection: {
    marginBottom: 8,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 6,
  },
  recommendationItem: {
    fontSize: 13,
    color: '#2E7D32',
    marginBottom: 2,
  },
  analysisTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
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
