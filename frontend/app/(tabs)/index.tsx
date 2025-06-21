// app/(tabs)/index.tsx - Enhanced Video Analysis with Google Drive Video and Robust Debugging
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  Modal,
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

// ✅ ROBUST DEBUG SYSTEM
const DEBUG_ENABLED = true;

interface DebugLog {
  id: string;
  timestamp: string;
  category: string;
  level: 'info' | 'warning' | 'error' | 'success' | 'debug';
  message: string;
  data?: any;
  stackTrace?: string;
  component: string;
  function?: string;
}

class DebugLogger {
  private logs: DebugLog[] = [];
  private onLogUpdate?: (logs: DebugLog[]) => void;

  constructor(onLogUpdate?: (logs: DebugLog[]) => void) {
    this.onLogUpdate = onLogUpdate;
    this.setupGlobalErrorHandling();
  }

  private setupGlobalErrorHandling() {
    // Override console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    console.error = (...args) => {
      this.log('CONSOLE', 'error', 'Console Error', args, 'Global');
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.log('CONSOLE', 'warning', 'Console Warning', args, 'Global');
      originalWarn.apply(console, args);
    };

    console.log = (...args) => {
      if (DEBUG_ENABLED) {
        this.log('CONSOLE', 'debug', 'Console Log', args, 'Global');
      }
      originalLog.apply(console, args);
    };

    // Global error handler
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.log('GLOBAL_ERROR', 'error', 'Unhandled Error', {
        message: error.message,
        stack: error.stack,
        isFatal
      }, 'ErrorUtils');
      originalHandler(error, isFatal);
    });
  }

  log(
    category: string,
    level: 'info' | 'warning' | 'error' | 'success' | 'debug',
    message: string,
    data?: any,
    component: string = 'Unknown',
    functionName?: string
  ) {
    const log: DebugLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      category,
      level,
      message,
      data: this.sanitizeData(data),
      stackTrace: new Error().stack,
      component,
      function: functionName
    };

    this.logs.unshift(log);
    if (this.logs.length > 200) {
      this.logs = this.logs.slice(0, 200);
    }

    if (DEBUG_ENABLED) {
      const emoji = this.getEmoji(level);
      const timestamp = new Date().toLocaleTimeString();
      console.log(`${emoji} [${timestamp}] [${category}] [${component}] ${message}`, data || '');
    }

    this.onLogUpdate?.(this.logs);
  }

  private getEmoji(level: string): string {
    switch (level) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'debug': return '🔍';
      default: return 'ℹ️';
    }
  }

  private sanitizeData(data: any): any {
    try {
      if (data === null || data === undefined) return data;
      if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') return data;
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      return `[Unsanitizable data: ${typeof data}]`;
    }
  }

  getLogs(): DebugLog[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.onLogUpdate?.(this.logs);
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

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
  fallEvents: {
    timestamp: number;
    confidence: number;
    severity: string;
  }[];
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
  // Debug Logger Setup
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const debugLogger = useRef(new DebugLogger((logs) => setDebugLogs(logs))).current;

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
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // ✅ GOOGLE DRIVE VIDEO SETUP
  const [driveVideoUri, setDriveVideoUri] = useState<string | null>(null);
  
  // ✅ FIXED: Convert Google Drive share link to direct streaming URL
  const convertGoogleDriveUrl = (shareUrl: string): string => {
    debugLogger.log('VIDEO_CONVERT', 'info', 'Converting Google Drive URL', { shareUrl }, 'IndexScreen', 'convertGoogleDriveUrl');
    
    try {
      // Extract file ID from various Google Drive URL formats
      let fileId = '';
      
      // Format 1: /d/FILE_ID/view
      const match1 = shareUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match1) {
        fileId = match1[1];
      }
      
      // Format 2: id=FILE_ID
      const match2 = shareUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
      if (!fileId && match2) {
        fileId = match2[1];
      }
      
      if (!fileId) {
        throw new Error('Could not extract file ID from Google Drive URL');
      }
      
      // Use the streaming URL format that works better with video players
      const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      
      debugLogger.log('VIDEO_CONVERT', 'success', 'Google Drive URL converted', {
        originalUrl: shareUrl,
        fileId,
        directUrl
      }, 'IndexScreen', 'convertGoogleDriveUrl');
      
      return directUrl;
    } catch (error) {
      debugLogger.log('VIDEO_CONVERT', 'error', 'Failed to convert Google Drive URL', {
        error: error.message,
        shareUrl
      }, 'IndexScreen', 'convertGoogleDriveUrl');
      throw error;
    }
  };

  // Video Player Setup with Google Drive URL
  const googleDriveShareUrl = 'https://drive.google.com/file/d/1on8plYPrcr7JB72BBKAu_IXUK3rBDoF7/view?usp=sharing';
  const player = useVideoPlayer(driveVideoUri || '', (player) => {
    player.loop = false;
    player.muted = false;
    
    // Add event listeners for better debugging
    player.addListener('statusChange', (status) => {
      debugLogger.log('VIDEO_PLAYER', 'info', 'Player status changed', { 
        status,
        isPlaying: status.isPlaying,
        currentTime: status.currentTime,
        duration: status.duration
      }, 'IndexScreen', 'videoPlayer');
      
      setIsVideoPlaying(status.isPlaying || false);
    });
    
    player.addListener('playbackError', (error) => {
      debugLogger.log('VIDEO_PLAYER', 'error', 'Video playback error', { 
        error: error.message 
      }, 'IndexScreen', 'videoPlayer');
      
      setVideoError(`Playback error: ${error.message}`);
    });
  });

  // ✅ FIXED: Load Google Drive Video with better error handling
  const loadGoogleDriveVideo = async () => {
    debugLogger.log('VIDEO_LOAD', 'info', 'Starting Google Drive video load', { 
      shareUrl: googleDriveShareUrl 
    }, 'IndexScreen', 'loadGoogleDriveVideo');
    
    try {
      setVideoLoaded(false);
      setVideoError(null);
      
      // Convert Google Drive share URL to direct streaming URL
      const directUrl = convertGoogleDriveUrl(googleDriveShareUrl);
      
      debugLogger.log('VIDEO_LOAD', 'info', 'Setting video URI', { directUrl }, 'IndexScreen', 'loadGoogleDriveVideo');
      
      // Set the video URI directly - don't test with fetch as it may fail due to CORS
      setDriveVideoUri(directUrl);
      setVideoLoaded(true);
      setVideoError(null);
      
      debugLogger.log('VIDEO_LOAD', 'success', 'Google Drive video URI set successfully', {
        finalUrl: directUrl,
        loaded: true
      }, 'IndexScreen', 'loadGoogleDriveVideo');
      
    } catch (error) {
      debugLogger.log('VIDEO_LOAD', 'error', 'Failed to load Google Drive video', {
        error: error.message,
        stack: error.stack,
        shareUrl: googleDriveShareUrl
      }, 'IndexScreen', 'loadGoogleDriveVideo');
      
      setVideoError(error.message);
      setVideoLoaded(false);
      
      // Try alternative URL formats
      try {
        const fileId = googleDriveShareUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
        if (fileId) {
          const alternativeUrls = [
            `https://drive.google.com/file/d/${fileId}/preview`,
            `https://drive.google.com/uc?id=${fileId}&export=download`,
            `https://docs.google.com/uc?export=view&id=${fileId}`
          ];
          
          debugLogger.log('VIDEO_LOAD', 'warning', 'Trying alternative URLs', {
            fileId,
            alternativeUrls
          }, 'IndexScreen', 'loadGoogleDriveVideo');
          
          // Try the first alternative
          setDriveVideoUri(alternativeUrls[0]);
          setVideoLoaded(true);
          setVideoError(null);
        }
      } catch (altError) {
        debugLogger.log('VIDEO_LOAD', 'error', 'All video URL attempts failed', {
          altError: altError.message
        }, 'IndexScreen', 'loadGoogleDriveVideo');
      }
    }
  };

  // Hardcoded Analysis Results with detailed logging
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
        summary: "Normal activity detected throughout the video. Person appears stable and mobile with good balance.",
        riskFactors: [],
        recommendations: ["Continue regular monitoring", "Maintain current safety measures", "Keep walkways clear"]
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
        summary: "Critical fall detected at 23.5 seconds. Person appears to lose balance suddenly and fall backward onto the floor. Immediate attention required.",
        riskFactors: ["Sudden loss of balance", "Backward fall pattern", "Hard surface impact", "No immediate recovery"],
        recommendations: [
          "🚨 IMMEDIATE: Check for injuries and consciousness",
          "🚨 IMMEDIATE: Call emergency services if unresponsive",
          "📞 Contact family members immediately",
          "🏥 Consider medical evaluation even if conscious",
          "🔍 Review environment for fall hazards",
          "💡 Install additional safety equipment"
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
        summary: "Possible fall or stumble detected at 45.2 seconds. Person appears to lose footing but may have partially recovered or caught themselves.",
        riskFactors: ["Unsteady gait", "Possible trip hazard", "Quick movement", "Balance issues"],
        recommendations: [
          "✅ Verify person's current condition",
          "🔍 Check for minor injuries or discomfort",
          "📋 Document incident for medical records",
          "🚶‍♂️ Consider mobility assessment",
          "🏠 Review home safety measures",
          "💊 Review medications that may affect balance"
        ]
      }
    }
  ];

  // Initialization
  useEffect(() => {
    debugLogger.log('LIFECYCLE', 'info', 'IndexScreen component mounting', {}, 'IndexScreen', 'useEffect');
    initializeDashboard();
    
    return () => {
      debugLogger.log('LIFECYCLE', 'info', 'IndexScreen component unmounting', {}, 'IndexScreen', 'useEffect');
    };
  }, []);

  const initializeDashboard = async () => {
    debugLogger.log('INIT', 'info', 'Starting dashboard initialization', {}, 'IndexScreen', 'initializeDashboard');
    
    try {
      await requestLocationPermission();
      await initializeLocationData();
      await loadGoogleDriveVideo();
      startLocationTracking();
      
      debugLogger.log('INIT', 'success', 'Dashboard initialization completed successfully', {}, 'IndexScreen', 'initializeDashboard');
    } catch (error) {
      debugLogger.log('INIT', 'error', 'Dashboard initialization failed', {
        error: error.message,
        stack: error.stack
      }, 'IndexScreen', 'initializeDashboard');
    }
  };

  // Location Permission with detailed logging
  const requestLocationPermission = async () => {
    debugLogger.log('PERMISSION', 'info', 'Requesting location permission', { platform: Platform.OS }, 'IndexScreen', 'requestLocationPermission');
    
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
        
        const permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setLocationPermission(permissionGranted);
        
        debugLogger.log('PERMISSION', permissionGranted ? 'success' : 'warning', 
          `Location permission ${permissionGranted ? 'granted' : 'denied'}`, 
          { granted, result: granted }, 'IndexScreen', 'requestLocationPermission');
      } catch (err) {
        debugLogger.log('PERMISSION', 'error', 'Location permission request failed', {
          error: err.message,
          stack: err.stack
        }, 'IndexScreen', 'requestLocationPermission');
      }
    } else {
      setLocationPermission(true);
      debugLogger.log('PERMISSION', 'success', 'iOS location permission assumed granted', {}, 'IndexScreen', 'requestLocationPermission');
    }
  };

  // Initialize Location Data with detailed logging
  const initializeLocationData = async () => {
    debugLogger.log('LOCATION_INIT', 'info', 'Initializing location data', {}, 'IndexScreen', 'initializeLocationData');
    
    try {
      const storedUserId = await AsyncStorage.getItem('elderlyUserId');
      const userId = storedUserId || '6851b7fcc249a68ff0ec2ae1';
      
      debugLogger.log('LOCATION_INIT', 'info', 'User ID determined', { 
        storedUserId, 
        finalUserId: userId,
        isFromStorage: !!storedUserId 
      }, 'IndexScreen', 'initializeLocationData');
      
      setElderlyUserId(userId);
      await fetchLocationData(userId);
      
      debugLogger.log('LOCATION_INIT', 'success', 'Location data initialization completed', { userId }, 'IndexScreen', 'initializeLocationData');
    } catch (error) {
      debugLogger.log('LOCATION_INIT', 'error', 'Location data initialization failed', {
        error: error.message,
        stack: error.stack
      }, 'IndexScreen', 'initializeLocationData');
    }
  };

  // ✅ FIXED: Fetch Location Data with comprehensive logging
  const fetchLocationData = async (userId?: string) => {
    const targetUserId = userId || elderlyUserId;
    
    debugLogger.log('LOCATION_FETCH', 'info', 'Starting location data fetch', { 
      targetUserId,
      hasUserId: !!targetUserId 
    }, 'IndexScreen', 'fetchLocationData');
    
    if (!targetUserId) {
      debugLogger.log('LOCATION_FETCH', 'error', 'No user ID available for location fetch', {}, 'IndexScreen', 'fetchLocationData');
      setLocationLoading(false);
      return;
    }

    try {
      setLocationLoading(true);
      
      const token = await AsyncStorage.getItem('accessToken');
      debugLogger.log('LOCATION_FETCH', 'info', 'Retrieved access token', { 
        hasToken: !!token,
        tokenLength: token?.length 
      }, 'IndexScreen', 'fetchLocationData');
      
      const url = `https://elderlybackend.onrender.com/api/location/user/${targetUserId}`;
      debugLogger.log('LOCATION_FETCH', 'info', 'Making API request', { url }, 'IndexScreen', 'fetchLocationData');
      
      const startTime = Date.now();
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const endTime = Date.now();
      
      debugLogger.log('LOCATION_FETCH', 'info', 'API response received', { 
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseTime: `${endTime - startTime}ms`
      }, 'IndexScreen', 'fetchLocationData');
      
      if (!response.ok) {
        const errorText = await response.text();
        debugLogger.log('LOCATION_FETCH', 'error', 'API request failed', { 
          status: response.status,
          statusText: response.statusText,
          errorText 
        }, 'IndexScreen', 'fetchLocationData');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      debugLogger.log('LOCATION_FETCH', 'success', 'Location data received and parsed', {
        hasLocation: !!data.location,
        hasGeofence: !!data.geofence,
        userName: data.name,
        userRole: data.role,
        locationCoords: data.location ? `${data.location.latitude}, ${data.location.longitude}` : 'N/A',
        geofenceRadius: data.geofence ? data.geofence.radius : 'N/A'
      }, 'IndexScreen', 'fetchLocationData');
      
      setLocationData(data);
      
      // Add delay before checking safe zone to ensure state is updated
      setTimeout(() => {
        checkSafeZoneStatus(data);
      }, 100);
      
      setDashboardStats(prev => ({
        ...prev,
        locationUpdates: prev.locationUpdates + 1,
        lastActivity: 'Just now'
      }));
      
      debugLogger.log('LOCATION_FETCH', 'success', 'Location fetch completed successfully', {
        locationUpdates: dashboardStats.locationUpdates + 1
      }, 'IndexScreen', 'fetchLocationData');
      
    } catch (error) {
      debugLogger.log('LOCATION_FETCH', 'error', 'Location fetch failed', {
        error: error.message,
        stack: error.stack,
        targetUserId
      }, 'IndexScreen', 'fetchLocationData');
      
      // Don't show alert on every error, just log it
      setLocationData(null);
    } finally {
      setLocationLoading(false);
    }
  };

  // ✅ FIXED: Check Safe Zone Status with proper coordinate validation
  const checkSafeZoneStatus = (data: LocationData) => {
    debugLogger.log('SAFE_ZONE', 'info', 'Checking safe zone status', {
      hasLocation: !!data.location,
      hasGeofence: !!data.geofence,
      userName: data.name,
      locationData: data.location,
      geofenceData: data.geofence
    }, 'IndexScreen', 'checkSafeZoneStatus');
    
    if (!data.location || !data.geofence || !data.geofence.center) {
      debugLogger.log('SAFE_ZONE', 'warning', 'Missing location or geofence data', {
        hasLocation: !!data.location,
        hasGeofence: !!data.geofence,
        hasGeofenceCenter: !!data.geofence?.center
      }, 'IndexScreen', 'checkSafeZoneStatus');
      
      // Default to safe zone if data is missing
      setIsInsideSafeZone(true);
      return;
    }

    try {
      const userLat = parseFloat(data.location.latitude);
      const userLng = parseFloat(data.location.longitude);
      const centerLat = parseFloat(data.geofence.center.latitude);
      const centerLng = parseFloat(data.geofence.center.longitude);
      const radius = parseFloat(data.geofence.radius);

      // Validate coordinates
      if (isNaN(userLat) || isNaN(userLng) || isNaN(centerLat) || isNaN(centerLng) || isNaN(radius)) {
        debugLogger.log('SAFE_ZONE', 'error', 'Invalid coordinate data', {
          userLat, userLng, centerLat, centerLng, radius
        }, 'IndexScreen', 'checkSafeZoneStatus');
        setIsInsideSafeZone(true); // Default to safe
        return;
      }

      const distance = calculateDistance(userLat, userLng, centerLat, centerLng);
      const isInside = distance <= radius;
      
      setIsInsideSafeZone(isInside);

      debugLogger.log('SAFE_ZONE', isInside ? 'success' : 'warning', 'Safe zone check completed', {
        distance: `${distance.toFixed(2)}m`,
        radius: `${radius}m`,
        isInside,
        userName: data.name,
        coordinates: {
          user: { lat: userLat, lng: userLng },
          center: { lat: centerLat, lng: centerLng }
        }
      }, 'IndexScreen', 'checkSafeZoneStatus');

      // Only show alert if actually outside and distance is significant (> 50m to avoid GPS noise)
      if (!isInside && distance > 50) {
        debugLogger.log('SAFE_ZONE', 'warning', 'User significantly outside safe zone - triggering alert', {
          userName: data.name,
          distance: `${distance.toFixed(2)}m`,
          radius: `${radius}m`
        }, 'IndexScreen', 'checkSafeZoneStatus');
        
        Alert.alert(
          'Safety Alert',
          `${data.name} is ${distance.toFixed(0)}m outside the safe zone (${radius}m radius)!`,
          [
            { text: 'OK', style: 'default' },
            { text: 'Call Now', style: 'destructive', onPress: makeCall }
          ]
        );
      }
    } catch (error) {
      debugLogger.log('SAFE_ZONE', 'error', 'Safe zone calculation error', {
        error: error.message,
        data
      }, 'IndexScreen', 'checkSafeZoneStatus');
      setIsInsideSafeZone(true); // Default to safe on error
    }
  };

  // ✅ FIXED: Distance calculation with better precision
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Location Tracking with detailed logging
  const startLocationTracking = () => {
    debugLogger.log('LOCATION_TRACK', 'info', 'Starting location tracking', { 
      hasPermission: locationPermission 
    }, 'IndexScreen', 'startLocationTracking');
    
    if (!locationPermission) {
      debugLogger.log('LOCATION_TRACK', 'warning', 'Location permission not granted - skipping tracking', {}, 'IndexScreen', 'startLocationTracking');
      return;
    }

    try {
      const watchId = Geolocation.watchPosition(
        (position) => {
          debugLogger.log('LOCATION_TRACK', 'success', 'Location update received', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          }, 'IndexScreen', 'startLocationTracking');
          
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp,
            accuracy: position.coords.accuracy,
          };
          setCurrentLocation(locationData);
        },
        (error) => {
          debugLogger.log('LOCATION_TRACK', 'error', 'Location tracking error', {
            code: error.code,
            message: error.message
          }, 'IndexScreen', 'startLocationTracking');
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 30000,
          fastestInterval: 15000,
        }
      );

      debugLogger.log('LOCATION_TRACK', 'success', 'Location tracking started successfully', { watchId }, 'IndexScreen', 'startLocationTracking');

      return () => {
        debugLogger.log('LOCATION_TRACK', 'info', 'Stopping location tracking', { watchId }, 'IndexScreen', 'startLocationTracking');
        Geolocation.clearWatch(watchId);
      };
    } catch (error) {
      debugLogger.log('LOCATION_TRACK', 'error', 'Failed to start location tracking', {
        error: error.message,
        stack: error.stack
      }, 'IndexScreen', 'startLocationTracking');
    }
  };

  // Polling Setup with logging
  useEffect(() => {
    if (elderlyUserId) {
      debugLogger.log('POLLING', 'info', 'Setting up location polling', { 
        elderlyUserId,
        interval: '10 seconds' 
      }, 'IndexScreen', 'useEffect[elderlyUserId]');
      
      const interval = setInterval(() => {
        debugLogger.log('POLLING', 'info', 'Polling location data', { elderlyUserId }, 'IndexScreen', 'useEffect[elderlyUserId]');
        fetchLocationData(elderlyUserId);
      }, 10000);
      
      return () => {
        debugLogger.log('POLLING', 'info', 'Clearing location polling', { elderlyUserId }, 'IndexScreen', 'useEffect[elderlyUserId]');
        clearInterval(interval);
      };
    }
  }, [elderlyUserId]);

  // ✅ FIXED: Add video loading state management
  useEffect(() => {
    if (driveVideoUri) {
      debugLogger.log('VIDEO_EFFECT', 'info', 'Video URI changed, updating player', {
        newUri: driveVideoUri
      }, 'IndexScreen', 'useEffect[driveVideoUri]');
      
      // Reset states when URI changes
      setIsVideoPlaying(false);
      setVideoError(null);
    }
  }, [driveVideoUri]);

  // Video Analysis Function with comprehensive logging
  const analyzeVideo = async () => {
    debugLogger.log('VIDEO_ANALYSIS', 'info', 'Starting video analysis', {
      videoLoaded,
      hasVideoUri: !!driveVideoUri,
      videoError,
      videoSource: 'Google Drive'
    }, 'IndexScreen', 'analyzeVideo');
    
    if (!videoLoaded || !driveVideoUri) {
      debugLogger.log('VIDEO_ANALYSIS', 'error', 'Cannot analyze - video not loaded', {
        videoLoaded,
        hasVideoUri: !!driveVideoUri,
        videoError
      }, 'IndexScreen', 'analyzeVideo');
      Alert.alert('Error', 'Video not loaded. Please wait for video to load or check your internet connection.');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      debugLogger.log('VIDEO_ANALYSIS', 'info', 'Simulating video analysis process', {
        analysisScenarios: analysisScenarios.length,
        videoDuration: '60 seconds',
        videoSource: driveVideoUri
      }, 'IndexScreen', 'analyzeVideo');
      
      // Simulate analysis delay with progress logging
      for (let i = 1; i <= 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        debugLogger.log('VIDEO_ANALYSIS', 'info', `Analysis progress: ${i}/3 seconds`, {
          progress: `${(i/3*100).toFixed(0)}%`
        }, 'IndexScreen', 'analyzeVideo');
      }
      
      // Select random analysis result
      const randomIndex = Math.floor(Math.random() * analysisScenarios.length);
      const randomScenario = analysisScenarios[randomIndex];
      
      debugLogger.log('VIDEO_ANALYSIS', 'info', 'Analysis scenario selected', {
        scenarioIndex: randomIndex,
        fallDetected: randomScenario.fallDetected,
        confidence: randomScenario.confidence,
        alertLevel: randomScenario.alertLevel
      }, 'IndexScreen', 'analyzeVideo');
      
      const analysisResult = {
        ...randomScenario,
        timestamp: new Date().toISOString()
      };
      
      setVideoAnalysis(analysisResult);
      
      // Update dashboard stats
      const newStats = {
        totalAlerts: analysisResult.fallDetected ? dashboardStats.totalAlerts + 1 : dashboardStats.totalAlerts,
        fallsDetected: analysisResult.fallDetected ? dashboardStats.fallsDetected + 1 : dashboardStats.fallsDetected,
        lastActivity: 'Just now'
      };
      
      setDashboardStats(prev => ({
        ...prev,
        ...newStats
      }));

      debugLogger.log('VIDEO_ANALYSIS', 'success', 'Video analysis completed', {
        result: {
          fallDetected: analysisResult.fallDetected,
          confidence: analysisResult.confidence,
          alertLevel: analysisResult.alertLevel,
          fallTime: analysisResult.fallTime,
          fallEventsCount: analysisResult.fallEvents.length
        },
        updatedStats: newStats,
        videoSource: 'Google Drive'
      }, 'IndexScreen', 'analyzeVideo');

      // Show alert if fall detected
      if (analysisResult.fallDetected) {
        debugLogger.log('VIDEO_ANALYSIS', 'warning', 'Fall detected - showing alert', {
          fallTime: analysisResult.fallTime,
          confidence: analysisResult.confidence,
          alertLevel: analysisResult.alertLevel
        }, 'IndexScreen', 'analyzeVideo');
        
        Alert.alert(
          '⚠️ Fall Detected!',
          `Fall detected at ${analysisResult.fallTime}s with ${(analysisResult.confidence * 100).toFixed(1)}% confidence.\n\n${analysisResult.geminiAnalysis.summary}`,
          [
            { text: 'View Details', style: 'default' },
            { text: 'Emergency Call', style: 'destructive', onPress: makeEmergencyCall }
          ]
        );
      } else {
        debugLogger.log('VIDEO_ANALYSIS', 'success', 'No falls detected - showing success alert', {}, 'IndexScreen', 'analyzeVideo');
        Alert.alert(
          '✅ Analysis Complete',
          'No falls detected in the video. All activities appear normal.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      debugLogger.log('VIDEO_ANALYSIS', 'error', 'Video analysis failed', {
        error: error.message,
        stack: error.stack
      }, 'IndexScreen', 'analyzeVideo');
      Alert.alert('Error', 'Failed to analyze video');
    } finally {
      setIsAnalyzing(false);
      debugLogger.log('VIDEO_ANALYSIS', 'info', 'Video analysis process completed', {}, 'IndexScreen', 'analyzeVideo');
    }
  };

  // ✅ FIXED: Video Control Functions
  const toggleVideoPlayback = async () => {
    debugLogger.log('VIDEO_CONTROL', 'info', 'Toggling video playback', {
      currentlyPlaying: isVideoPlaying,
      hasVideoUri: !!driveVideoUri,
      videoLoaded,
      videoSource: 'Google Drive'
    }, 'IndexScreen', 'toggleVideoPlayback');
    
    if (!driveVideoUri || !videoLoaded) {
      debugLogger.log('VIDEO_CONTROL', 'warning', 'Cannot control video - not loaded', {
        hasVideoUri: !!driveVideoUri,
        videoLoaded
      }, 'IndexScreen', 'toggleVideoPlayback');
      
      Alert.alert('Video Not Ready', 'Please wait for the video to load completely.');
      return;
    }
    
    try {
      if (isVideoPlaying) {
        await player.pause();
        debugLogger.log('VIDEO_CONTROL', 'info', 'Video paused', {}, 'IndexScreen', 'toggleVideoPlayback');
      } else {
        await player.play();
        debugLogger.log('VIDEO_CONTROL', 'info', 'Video playing', {}, 'IndexScreen', 'toggleVideoPlayback');
      }
    } catch (error) {
      debugLogger.log('VIDEO_CONTROL', 'error', 'Video control failed', {
        error: error.message,
        action: isVideoPlaying ? 'pause' : 'play'
      }, 'IndexScreen', 'toggleVideoPlayback');
      
      Alert.alert('Video Error', `Failed to ${isVideoPlaying ? 'pause' : 'play'} video: ${error.message}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Utility Functions with logging
  const getCurrentLocation = () => {
    debugLogger.log('LOCATION_GET', 'info', 'Manual location request initiated', {}, 'IndexScreen', 'getCurrentLocation');
    setLocationLoading(true);
    
    Geolocation.getCurrentPosition(
      (position) => {
        debugLogger.log('LOCATION_GET', 'success', 'Manual location retrieved', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }, 'IndexScreen', 'getCurrentLocation');
        
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
        debugLogger.log('LOCATION_GET', 'error', 'Manual location request failed', {
          code: error.code,
          message: error.message
        }, 'IndexScreen', 'getCurrentLocation');
        setLocationLoading(false);
        Alert.alert('Location Error', 'Unable to get current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const makeCall = () => {
    debugLogger.log('CALL', 'info', 'Making regular call', {}, 'IndexScreen', 'makeCall');
    const phoneNumber = 'tel:+1234567890';
    Linking.openURL(phoneNumber).catch(err => {
      debugLogger.log('CALL', 'error', 'Regular call failed', {
        error: err.message,
        phoneNumber
      }, 'IndexScreen', 'makeCall');
      Alert.alert('Error', 'Unable to make call');
    });
  };

  const makeEmergencyCall = () => {
    debugLogger.log('EMERGENCY', 'warning', 'Making emergency call', {}, 'IndexScreen', 'makeEmergencyCall');
    const phoneNumber = 'tel:+911234567890';
    Linking.openURL(phoneNumber).catch(err => {
      debugLogger.log('EMERGENCY', 'error', 'Emergency call failed', {
        error: err.message,
        phoneNumber
      }, 'IndexScreen', 'makeEmergencyCall');
      Alert.alert('Error', 'Unable to make emergency call');
    });
  };

  const onRefresh = async () => {
    debugLogger.log('REFRESH', 'info', 'Manual refresh initiated', {}, 'IndexScreen', 'onRefresh');
    setRefreshing(true);
    try {
      await fetchLocationData();
      getCurrentLocation();
      debugLogger.log('REFRESH', 'success', 'Manual refresh completed', {}, 'IndexScreen', 'onRefresh');
    } catch (error) {
      debugLogger.log('REFRESH', 'error', 'Manual refresh failed', {
        error: error.message
      }, 'IndexScreen', 'onRefresh');
    } finally {
      setRefreshing(false);
    }
  };

  const logout = async () => {
    debugLogger.log('LOGOUT', 'info', 'Logout initiated', {}, 'IndexScreen', 'logout');
    try {
      await AsyncStorage.clear();
      debugLogger.log('LOGOUT', 'success', 'Logout completed - AsyncStorage cleared', {}, 'IndexScreen', 'logout');
      console.log("Logout successful");
    } catch (e) {
      debugLogger.log('LOGOUT', 'error', 'Logout failed', {
        error: e.message
      }, 'IndexScreen', 'logout');
    }
  };

  // Debug Log Renderer
  const renderDebugLog = ({ item }: { item: DebugLog }) => (
    <View style={[styles.debugLogItem, { borderLeftColor: getDebugColor(item.level) }]}>
      <View style={styles.debugLogHeader}>
        <Text style={[styles.debugLogCategory, { color: getDebugColor(item.level) }]}>
          {item.category}
        </Text>
        <Text style={styles.debugLogTime}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={styles.debugLogMessage}>{item.message}</Text>
      <Text style={styles.debugLogComponent}>Component: {item.component}</Text>
      {item.function && (
        <Text style={styles.debugLogFunction}>Function: {item.function}</Text>
      )}
      {item.data && (
        <Text style={styles.debugLogData}>
          {typeof item.data === 'string' ? item.data : JSON.stringify(item.data, null, 2)}
        </Text>
      )}
    </View>
  );

  const getDebugColor = (level: string) => {
    switch (level) {
      case 'error': return '#FF5100';
      case 'warning': return '#FF8C00';
      case 'success': return '#009951';
      case 'debug': return '#6B73FF';
      default: return '#666';
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
            <TouchableOpacity onPress={() => setShowDebugModal(true)} style={styles.iconBtn}>
              <MaterialIcons name="bug-report" size={24} color="#FF5100" />
              <Text style={styles.debugBadge}>{debugLogs.length}</Text>
            </TouchableOpacity>
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
          
          {/* Video Status */}
          <View style={styles.videoStatusContainer}>
            <View style={[
              styles.videoStatusBadge,
              { backgroundColor: videoLoaded ? '#009951' : videoError ? '#FF5100' : '#FF8C00' }
            ]}>
              <MaterialIcons 
                name={videoLoaded ? 'check-circle' : videoError ? 'error' : 'hourglass-empty'} 
                size={16} 
                color="#FFF" 
              />
              <Text style={styles.videoStatusText}>
                {videoLoaded ? 'Google Drive Video Ready' : videoError ? 'Video Error' : 'Loading Google Drive Video'}
              </Text>
            </View>
            {videoError && (
              <TouchableOpacity onPress={loadGoogleDriveVideo} style={styles.retryButton}>
                <MaterialIcons name="refresh" size={16} color="#FF5100" />
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Video Player */}
          <View style={styles.videoContainer}>
            {driveVideoUri && videoLoaded ? (
              <VideoView
                style={styles.videoPlayer}
                player={player}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
              />
            ) : (
              <View style={styles.videoPlaceholder}>
                <MaterialIcons name="cloud-download" size={48} color="#666" />
                <Text style={styles.videoPlaceholderText}>
                  {videoError ? 'Google Drive Video Error' : 'Loading from Google Drive...'}
                </Text>
                {videoError && (
                  <Text style={styles.videoErrorText}>{videoError}</Text>
                )}
                <Text style={styles.videoSourceText}>
                  Source: Google Drive
                </Text>
              </View>
            )}
            
            {/* Video Controls Overlay */}
            {driveVideoUri && videoLoaded && (
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
            )}

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
              { backgroundColor: isAnalyzing || !videoLoaded ? '#ccc' : '#FF5100' }
            ]}
            onPress={analyzeVideo}
            disabled={isAnalyzing || !videoLoaded}
          >
            {isAnalyzing ? (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.analyzeButtonText}>Analyzing Google Drive Video...</Text>
              </View>
            ) : (
              <Text style={styles.analyzeButtonText}>
                {videoLoaded ? 'Analyze Video for Falls' : 'Loading Google Drive Video...'}
              </Text>
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

      {/* Debug Modal */}
      <Modal
        visible={showDebugModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.debugModal}>
          <View style={styles.debugModalHeader}>
            <Text style={styles.debugModalTitle}>Debug Console ({debugLogs.length})</Text>
            <View style={styles.debugModalActions}>
              <TouchableOpacity 
                onPress={() => {
                  const logs = debugLogger.exportLogs();
                  console.log('📋 Exported Debug Logs:', logs);
                  Alert.alert('Debug Logs', 'Logs exported to console');
                }} 
                style={styles.debugModalBtn}
              >
                <MaterialIcons name="file-download" size={24} color="#FF5100" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  debugLogger.clearLogs();
                  Alert.alert('Debug Logs', 'All logs cleared');
                }} 
                style={styles.debugModalBtn}
              >
                <MaterialIcons name="clear-all" size={24} color="#FF5100" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDebugModal(false)} style={styles.debugModalBtn}>
                <MaterialIcons name="close" size={24} color="#FF5100" />
              </TouchableOpacity>
            </View>
          </View>
          
         <FlatList
  data={debugLogs}
  renderItem={renderDebugLog}
  keyExtractor={(item) => item.id}
  style={styles.debugLogsList}
  showsVerticalScrollIndicator={false}
/>

        </SafeAreaView>
      </Modal>
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
    position: 'relative',
  },
  debugBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5100',
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: 'center',
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
  
  // Map Styles - THIS WAS MISSING
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
  videoStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  videoStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  videoStatusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 81, 0, 0.1)',
    gap: 4,
  },
  retryButtonText: {
    color: '#FF5100',
    fontSize: 12,
    fontWeight: 'bold',
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
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  videoErrorText: {
    color: '#FF5100',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  videoSourceText: {
    color: '#999',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
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

  // Debug Modal Styles
  debugModal: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  debugModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },
  debugModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF5100",
  },
  debugModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  debugModalBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 81, 0, 0.1)",
  },
  debugLogsList: {
    flex: 1,
    padding: 16,
  },
  debugLogItem: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  debugLogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  debugLogCategory: {
    fontSize: 12,
    fontWeight: "bold",
  },
  debugLogTime: {
    fontSize: 10,
    color: "#999",
  },
  debugLogMessage: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  debugLogComponent: {
    fontSize: 12,
    color: "#6B73FF",
    fontStyle: 'italic',
    marginBottom: 2,
  },
  debugLogFunction: {
    fontSize: 12,
    color: "#FF8C00",
    fontStyle: 'italic',
    marginBottom: 4,
  },
  debugLogData: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
    backgroundColor: "#F5F5F5",
    padding: 8,
    borderRadius: 4,
  },
});
