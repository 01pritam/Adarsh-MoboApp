// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
// import RecordingButton from '../../components/RecordingButton';
// import { transcribeAudio } from '../../utils/sarvamSpeechToText'; // Path to your Sarvam AI service

// export default function MicScreen() {
//   const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     (async () => {
//       const status = await AudioModule.requestRecordingPermissionsAsync();
//       if (!status.granted) {
//         Alert.alert('Permission to access microphone was denied');
//       }
//     })();
//   }, []);

//   const startRecording = async () => {
//     try {
//       await audioRecorder.prepareToRecordAsync();
//       audioRecorder.record();
//       setIsRecording(true);
//     } catch (err) {
//       Alert.alert('Error', 'Failed to start recording');
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       await audioRecorder.stop();
//       setIsRecording(false);
//       if (audioRecorder.uri) {
//         setLoading(true);
//         const result = await transcribeAudio(audioRecorder.uri, {
//           languageCode: 'hi-IN', // or your preferred language
//           format: 'm4a', // or 'wav', depending on your preset
//           sampleRate: 44100,
//         });
//         setTranscript(result.transcript || result.error || 'No transcript received');
//         setLoading(false);
//       }
//     } catch (err) {
//       setIsRecording(false);
//       setLoading(false);
//       Alert.alert('Error', 'Failed to stop recording');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Voice Recorder</Text>
//       <RecordingButton
//         isRecording={isRecording}
//         onPress={isRecording ? stopRecording : startRecording}
//       />
//       {loading && <ActivityIndicator size="large" color="#007AFF" />}
//       <Text style={styles.transcriptLabel}>Transcription:</Text>
//       <Text style={styles.transcriptText}>{transcript || 'Your transcript will appear here.'}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   transcriptLabel: { marginTop: 30, fontWeight: 'bold' },
//   transcriptText: { marginTop: 10, fontSize: 16, color: '#333' },
// });








// import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
// import { Audio } from 'expo-av';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import RecordingButton from '../../../components/RecordingButton';
// import { transcribeAudio } from '../../../utils/sarvamSpeechToText';

// export default function MicScreen() {
//   const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   // New state for AI response
//   const [aiResponse, setAiResponse] = useState('');
//   const [audioUrl, setAudioUrl] = useState('');
//   const [messageId, setMessageId] = useState('');
//   const [urgency, setUrgency] = useState(false);
//   const [familyNotified, setFamilyNotified] = useState(false);
//   const [taskCreated, setTaskCreated] = useState(false);
//   const [taskId, setTaskId] = useState('');
//   const [sound, setSound] = useState(null);
//   const [isPlayingAudio, setIsPlayingAudio] = useState(false);

//   useEffect(() => {
//     (async () => {
//       const status = await AudioModule.requestRecordingPermissionsAsync();
//       if (!status.granted) {
//         Alert.alert('Permission to access microphone was denied');
//       }
//     })();
//   }, []);

//   // Cleanup sound on unmount
//   useEffect(() => {
//     return sound
//       ? () => {
//           sound.unloadAsync();
//         }
//       : undefined;
//   }, [sound]);

//   const startRecording = async () => {
//     try {
//       console.log('🟢 Preparing to record...');
//       await audioRecorder.prepareToRecordAsync();
//       audioRecorder.record();
//       setIsRecording(true);
//       console.log('🎙 Recording started');
//     } catch (err) {
//       console.error('❌ Error starting recording:', err);
//       Alert.alert('Error', 'Failed to start recording');
//     }
//   };

// const callAIAgent = async (transcriptText) => {
//   try {
//     console.log('🤖 Calling AI Agent...');
//     console.log('📝 Input transcript:', transcriptText);
//     console.log('📏 Transcript length:', transcriptText?.length || 0);
    
//     // Validate input
//     if (!transcriptText || transcriptText.trim() === '') {
//       throw new Error('Transcript text is required and cannot be empty');
//     }

//     const requestBody = {
//       transcript: transcriptText.trim() // ✅ Changed from 'message' to 'transcript'
//     };

//     console.log('📤 Request URL:', 'https://elderlybackend.onrender.com/api/agent/ai');
//     console.log('📤 Request method:', 'POST');
//     console.log('📤 Request headers:', {
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer [TOKEN_PRESENT]'
//     });
//     console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

//     const startTime = Date.now();
    
//     const response = await fetch('https://elderlybackend.onrender.com/api/agent/ai', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODRmYjRkMjVmMGQ4YTVjZGY2MWY3ODEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiZWxkZXJseSIsImlhdCI6MTc1MDA1NDE3MiwiZXhwIjoxNzUwNjU4OTcyfQ.rSGMq29DsrX_wYFi44CiDFrdqzg_UBAt-4m8H0Wb3sw'
//       },
//       body: JSON.stringify(requestBody)
//     });

//     const endTime = Date.now();
//     const requestDuration = endTime - startTime;

//     console.log('📥 Response received in:', requestDuration + 'ms');
//     console.log('📥 Response status:', response.status);
//     console.log('📥 Response ok:', response.ok);

//     if (!response.ok) {
//       let errorBody = '';
//       let errorData = null;
      
//       try {
//         errorBody = await response.text();
//         console.log('❌ Error response body (raw):', errorBody);
        
//         if (errorBody) {
//           try {
//             errorData = JSON.parse(errorBody);
//             console.log('❌ Error response body (parsed JSON):', JSON.stringify(errorData, null, 2));
//           } catch (parseError) {
//             console.log('❌ Error response is not valid JSON');
//           }
//         }
//       } catch (readError) {
//         console.log('❌ Failed to read error response body:', readError);
//       }

//       const errorMessage = errorData?.message || errorData?.error || errorBody || `HTTP ${response.status} ${response.statusText}`;
//       throw new Error(`HTTP error! status: ${response.status} | ${errorMessage}`);
//     }

//     // Parse successful response
//     let data;
//     const responseText = await response.text();
//     console.log('✅ Success response body (raw):', responseText);
    
//     try {
//       data = JSON.parse(responseText);
//       console.log('✅ Success response body (parsed):', JSON.stringify(data, null, 2));
//     } catch (parseError) {
//       console.error('❌ Failed to parse success response as JSON:', parseError);
//       throw new Error('Invalid JSON response from server');
//     }

//     console.log('🤖 AI Agent Response Success:', data.success);

//     if (data.success) {
//       console.log('📊 Response data structure:');
//       console.log('  - aiResponse:', data.data?.aiResponse?.substring(0, 100) + '...');
//       console.log('  - audioUrl:', data.data?.audioUrl);
//       console.log('  - messageId:', data.data?.messageId);
//       console.log('  - urgency:', data.data?.urgency);
//       console.log('  - familyNotified:', data.data?.familyNotified);
//       console.log('  - taskCreated:', data.data?.taskCreated);
//       console.log('  - taskId:', data.data?.taskId);

//       // Store important data in state
//       setAiResponse(data.data.aiResponse);
//       setAudioUrl(data.data.audioUrl);
//       setMessageId(data.data.messageId);
//       setUrgency(data.data.urgency);
//       setFamilyNotified(data.data.familyNotified);
//       setTaskCreated(data.data.taskCreated);
//       setTaskId(data.data.taskId);

//       // Auto-play the audio response
//       if (data.data.audioUrl) {
//         console.log('🔊 Attempting to play audio:', data.data.audioUrl);
//         await playAudioResponse(data.data.audioUrl);
//       } else {
//         console.log('⚠️ No audio URL provided in response');
//       }
//     } else {
//       console.log('❌ API returned success: false');
//       console.log('❌ Error details:', data.error || data.message || 'No error details provided');
//       throw new Error(data.error || data.message || 'API request failed');
//     }

//   } catch (error) {
//     console.log('🚨 === FULL ERROR DETAILS ===');
//     console.log('Error name:', error.name);
//     console.log('Error message:', error.message);
//     console.log('🚨 === END ERROR DETAILS ===');
    
//     console.error('❌ Error calling AI Agent:', error);
    
//     // Show user-friendly error message
//     let userMessage = 'Failed to get AI response';
//     if (error.message.includes('400')) {
//       userMessage = 'Invalid request. Please try again.';
//     } else if (error.message.includes('401')) {
//       userMessage = 'Authentication failed. Please restart the app.';
//     } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
//       userMessage = 'Server is temporarily unavailable. Please try again later.';
//     } else if (error.message.includes('Network request failed')) {
//       userMessage = 'Network connection failed. Please check your internet connection.';
//     }
    
//     Alert.alert('Error', userMessage);
//   }
// };



//   const playAudioResponse = async (url) => {
//     try {
//       console.log('🔊 Playing audio response...');
//       setIsPlayingAudio(true);
      
//       // Unload previous sound if exists
//       if (sound) {
//         await sound.unloadAsync();
//       }

//       const { sound: newSound } = await Audio.Sound.createAsync(
//         { uri: url },
//         { shouldPlay: true }
//       );
      
//       setSound(newSound);

//       // Set up playback status listener
//       newSound.setOnPlaybackStatusUpdate((status) => {
//         if (status.didJustFinish) {
//           setIsPlayingAudio(false);
//         }
//       });

//     } catch (error) {
//       console.error('❌ Error playing audio:', error);
//       setIsPlayingAudio(false);
//       Alert.alert('Error', 'Failed to play audio response');
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       console.log('🛑 Stopping recording...');
//       await audioRecorder.stop();
//       setIsRecording(false);
//       console.log('📁 File saved at:', audioRecorder.uri);

//       if (audioRecorder.uri) {
//         setLoading(true);
        
//         // First, transcribe the audio
//         const result = await transcribeAudio(audioRecorder.uri, {
//           language_code: 'en-IN', // Changed to snake_case
//           format: 'wav',
//           sampleRate: 44100,
//         });
        
//         console.log('📝 Transcription Result:', result);
//         const transcriptText = result.transcript || 'No transcript received';
//         setTranscript(transcriptText);

//         // If transcription successful, call AI agent
//         if (result.transcript && !result.error) {
//           await callAIAgent(result.transcript);
//         }
        
//         setLoading(false);
//       }
//     } catch (err) {
//       console.error('❌ Error stopping recording:', err);
//       setIsRecording(false);
//       setLoading(false);
//       Alert.alert('Error', 'Failed to stop recording');
//     }
//   };

//   const replayAudio = async () => {
//     if (audioUrl) {
//       await playAudioResponse(audioUrl);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Voice Assistant</Text>
      
//       <RecordingButton
//         isRecording={isRecording}
//         onPress={isRecording ? stopRecording : startRecording}
//       />
      
//       {loading && (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007AFF" />
//           <Text style={styles.loadingText}>Processing...</Text>
//         </View>
//       )}

//       {/* Transcript Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionLabel}>Your Message:</Text>
//         <Text style={styles.transcriptText}>
//           {transcript || 'Your message will appear here.'}
//         </Text>
//       </View>

//       {/* AI Response Section */}
//       {aiResponse && (
//         <View style={styles.section}>
//           <Text style={styles.sectionLabel}>AI Response:</Text>
//           <Text style={styles.responseText}>{aiResponse}</Text>
          
//           {/* Audio Controls */}
//           {audioUrl && (
//             <TouchableOpacity 
//               style={styles.audioButton} 
//               onPress={replayAudio}
//               disabled={isPlayingAudio}
//             >
//               <Text style={styles.audioButtonText}>
//                 {isPlayingAudio ? '🔊 Playing...' : '🔊 Replay Audio'}
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       )}

//       {/* Status Indicators */}
//       {(urgency || familyNotified || taskCreated) && (
//         <View style={styles.statusContainer}>
//           {urgency && <Text style={styles.urgentStatus}>⚠️ Urgent</Text>}
//           {familyNotified && <Text style={styles.status}>👨‍👩‍👧‍👦 Family Notified</Text>}
//           {taskCreated && <Text style={styles.status}>✅ Task Created</Text>}
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     padding: 20,
//     backgroundColor: '#FFFDDD'
//   },
//   title: { 
//     fontSize: 24, 
//     fontWeight: 'bold', 
//     marginBottom: 30,
//     color: '#333'
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     marginVertical: 20
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#007AFF',
//     fontSize: 16
//   },
//   section: {
//     width: '100%',
//     marginVertical: 15,
//     padding: 15,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3
//   },
//   sectionLabel: { 
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 8,
//     color: '#333'
//   },
//   transcriptText: { 
//     fontSize: 16, 
//     color: '#666',
//     lineHeight: 22
//   },
//   responseText: {
//     fontSize: 16,
//     color: '#333',
//     lineHeight: 22,
//     marginBottom: 10
//   },
//   audioButton: {
//     backgroundColor: '#007AFF',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10
//   },
//   audioButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600'
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//     marginTop: 15
//   },
//   status: {
//     backgroundColor: '#4CAF50',
//     color: 'white',
//     padding: 8,
//     borderRadius: 15,
//     margin: 4,
//     fontSize: 12,
//     fontWeight: '600'
//   },
//   urgentStatus: {
//     backgroundColor: '#FF5722',
//     color: 'white',
//     padding: 8,
//     borderRadius: 15,
//     margin: 4,
//     fontSize: 12,
//     fontWeight: '600'
//   }
// });


import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { transcribeAudio } from "../../../utils/sarvamSpeechToText";

const { width, height } = Dimensions.get("window");

export default function AdaptiveTextVoiceAssistant() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [sound, setSound] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Animation values
  const pulseAnim = new Animated.Value(1);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert(
            "Permission Required",
            "Microphone access is needed for voice recording"
          );
        }
      } catch (error) {
        console.error("Permission error:", error);
      }
    };

    requestPermissions();
  }, []);

  // Cleanup sound on unmount
  useEffect(() => {
    return sound
      ? () => {
          if (sound) {
            sound.unloadAsync();
          }
        }
      : undefined;
  }, [sound]);

  // Animation effect for recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording, pulseAnim]);

  // Dynamic font size calculation
  const getMainTextSize = (text) => {
    if (!text || text === "Ask Me Anything..." || text === "Processing...") {
      return 36; // Default size
    }
    const length = text.length;
    if (length < 50) return 32;
    if (length < 100) return 28;
    if (length < 200) return 24;
    if (length < 300) return 20;
    return 18; // Minimum size for very long text
  };

  const getSubTextSize = (text) => {
    if (
      !text ||
      text === "push to talk or start typing..." ||
      text === "Please wait..."
    ) {
      return 16; // Default size
    }
    const length = text.length;
    if (length < 30) return 16;
    if (length < 60) return 15;
    if (length < 120) return 14;
    if (length < 200) return 13;
    return 12; // Minimum size for very long text
  };

  // Dynamic line height calculation
  const getMainLineHeight = (fontSize) => {
    return fontSize + 8;
  };

  const getSubLineHeight = (fontSize) => {
    return fontSize + 4;
  };

  const handleMicPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      setTranscript("");
      setAiResponse("");
      setAudioUrl("");

      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);

      if (audioRecorder.uri) {
        setLoading(true);

        try {
          const result = await transcribeAudio(audioRecorder.uri, {
            language_code: "en-IN",
            format: "wav",
            sampleRate: 44100,
          });

          const transcriptText =
            result.transcript || "Could not understand audio";
          setTranscript(transcriptText);

          if (result.transcript && !result.error) {
            await callAIAgent(result.transcript);
          }
        } catch (transcribeError) {
          console.error("Transcription error:", transcribeError);
          setTranscript("Error transcribing audio");
        }

        setLoading(false);
      }
    } catch (err) {
      console.error("Error stopping recording:", err);
      setIsRecording(false);
      setLoading(false);
      Alert.alert("Error", "Failed to process recording");
    }
  };

  const callAIAgent = async (transcriptText) => {
    try {
      const response = await fetch(
        "https://elderlybackend.onrender.com/api/agent/ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODRmYjRkMjVmMGQ4YTVjZGY2MWY3ODEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiZWxkZXJseSIsImlhdCI6MTc1MDA1NDE3MiwiZXhwIjoxNzUwNjU4OTcyfQ.rSGMq29DsrX_wYFi44CiDFrdqzg_UBAt-4m8H0Wb3sw",
          },
          body: JSON.stringify({ transcript: transcriptText.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAiResponse(data.data.aiResponse);
        setAudioUrl(data.data.audioUrl);

        if (data.data.audioUrl) {
          await playAudioResponse(data.data.audioUrl);
        }
      } else {
        throw new Error(data.error || "AI request failed");
      }
    } catch (error) {
      console.error("AI Agent error:", error);
      setAiResponse(
        "Sorry, I couldn't process your request right now. Please try again."
      );
    }
  };

  const playAudioResponse = async (url) => {
    try {
      setIsPlayingAudio(true);

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      });
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlayingAudio(false);
    }
  };

  const replayAudio = async () => {
    if (audioUrl) {
      await playAudioResponse(audioUrl);
    }
  };

  const clearResults = () => {
    setTranscript("");
    setAiResponse("");
    setAudioUrl("");
  };

  // Get current text content for sizing
  const currentMainText = loading
    ? "Processing..."
    : aiResponse
    ? aiResponse
    : "Ask Me Anything...";

  const currentSubText = loading
    ? "Please wait..."
    : transcript
    ? transcript
    : "push to talk or start typing...";

  const mainFontSize = getMainTextSize(currentMainText);
  const subFontSize = getSubTextSize(currentSubText);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.userName}>Voice Assistant</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.profileButton}>
            <MaterialIcons name="person" size={24} color="#666" />
          </TouchableOpacity>
          {(transcript || aiResponse) && (
            <TouchableOpacity
              onPress={clearResults}
              style={styles.notificationButton}
            >
              <MaterialIcons name="refresh" size={24} color="#FF5100" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content Area with Fixed Layout */}
      <View style={styles.mainContent}>
        {/* Scrollable Text Area - Fixed Height */}
        <View style={styles.textAreaContainer}>
          <ScrollView
            style={styles.textScrollView}
            contentContainerStyle={styles.textScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* AI Response Text (Large) */}
            <View style={styles.mainTextContainer}>
              <Text
                style={[
                  styles.mainText,
                  {
                    fontSize: mainFontSize,
                    lineHeight: getMainLineHeight(mainFontSize),
                  },
                ]}
              >
                {currentMainText}
              </Text>
            </View>

            {/* User Text (Small) */}
            <View style={styles.subTextContainer}>
              <Text
                style={[
                  styles.subText,
                  {
                    fontSize: subFontSize,
                    lineHeight: getSubLineHeight(subFontSize),
                  },
                ]}
              >
                {currentSubText}
              </Text>
            </View>

            {/* Status Indicator */}
            {(isRecording || loading) && (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  {isRecording ? "tap to stop" : "processing..."}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Fixed Microphone Section */}
        <View style={styles.micSection}>
          <View style={styles.micContainer}>
            {/* Pulse ring for recording */}
            {isRecording && (
              <Animated.View
                style={[
                  styles.pulseRing,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
            )}

            {/* Main Mic Button */}
            <Animated.View
              style={[styles.micButton, { transform: [{ scale: scaleAnim }] }]}
            >
              <TouchableOpacity
                style={styles.micTouchable}
                onPress={handleMicPress}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size={60} color="#009951" />
                ) : (
                  <MaterialIcons
                    name={isRecording ? "stop" : "mic"}
                    size={80}
                    color="#009951"
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Replay Button */}
          {audioUrl && !isRecording && !loading && (
            <TouchableOpacity
              style={styles.replayButton}
              onPress={replayAudio}
              disabled={isPlayingAudio}
            >
              <MaterialIcons
                name={isPlayingAudio ? "volume-up" : "replay"}
                size={20}
                color="#FF5100"
              />
              <Text style={styles.replayText}>
                {isPlayingAudio ? "Playing..." : "Replay"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF3DD",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 81, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Fixed height text area container
  textAreaContainer: {
    height: height * 0.45, // Fixed 45% of screen height
    marginBottom: 20,
  },
  textScrollView: {
    flex: 1,
  },
  textScrollContent: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },

  mainTextContainer: {
    marginBottom: 20,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  mainText: {
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
    maxWidth: width - 60,
  },
  subTextContainer: {
    marginBottom: 20,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  subText: {
    color: "#FF5100",
    textAlign: "center",
    fontWeight: "400",
    maxWidth: width - 80,
  },
  statusContainer: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  // Fixed microphone section
  micSection: {
    alignItems: "center",
    justifyContent: "center",
    height: 200, // Fixed height
    paddingBottom: 20,
  },
  micContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  pulseRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#009951",
    backgroundColor: "rgba(0, 153, 81, 0.1)",
  },
  micButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "#009951",
    backgroundColor: "#FFF3DD",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  micTouchable: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  replayButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 81, 0, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  replayText: {
    fontSize: 14,
    color: "#FF5100",
    fontWeight: "600",
    marginLeft: 6,
  },
});
