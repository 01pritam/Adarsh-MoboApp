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








import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RecordingButton from '../../../components/RecordingButton';
import { transcribeAudio } from '../../../utils/sarvamSpeechToText';

export default function MicScreen() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New state for AI response
  const [aiResponse, setAiResponse] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [messageId, setMessageId] = useState('');
  const [urgency, setUrgency] = useState(false);
  const [familyNotified, setFamilyNotified] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);
  const [taskId, setTaskId] = useState('');
  const [sound, setSound] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
  }, []);

  // Cleanup sound on unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const startRecording = async () => {
    try {
      console.log('🟢 Preparing to record...');
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      console.log('🎙 Recording started');
    } catch (err) {
      console.error('❌ Error starting recording:', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

const callAIAgent = async (transcriptText) => {
  try {
    console.log('🤖 Calling AI Agent...');
    console.log('📝 Input transcript:', transcriptText);
    console.log('📏 Transcript length:', transcriptText?.length || 0);
    
    // Validate input
    if (!transcriptText || transcriptText.trim() === '') {
      throw new Error('Transcript text is required and cannot be empty');
    }

    const requestBody = {
      transcript: transcriptText.trim() // ✅ Changed from 'message' to 'transcript'
    };

    console.log('📤 Request URL:', 'https://elderlybackend.onrender.com/api/agent/ai');
    console.log('📤 Request method:', 'POST');
    console.log('📤 Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [TOKEN_PRESENT]'
    });
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    const startTime = Date.now();
    
    const response = await fetch('https://elderlybackend.onrender.com/api/agent/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODRmYjRkMjVmMGQ4YTVjZGY2MWY3ODEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiZWxkZXJseSIsImlhdCI6MTc1MDA1NDE3MiwiZXhwIjoxNzUwNjU4OTcyfQ.rSGMq29DsrX_wYFi44CiDFrdqzg_UBAt-4m8H0Wb3sw'
      },
      body: JSON.stringify(requestBody)
    });

    const endTime = Date.now();
    const requestDuration = endTime - startTime;

    console.log('📥 Response received in:', requestDuration + 'ms');
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      let errorBody = '';
      let errorData = null;
      
      try {
        errorBody = await response.text();
        console.log('❌ Error response body (raw):', errorBody);
        
        if (errorBody) {
          try {
            errorData = JSON.parse(errorBody);
            console.log('❌ Error response body (parsed JSON):', JSON.stringify(errorData, null, 2));
          } catch (parseError) {
            console.log('❌ Error response is not valid JSON');
          }
        }
      } catch (readError) {
        console.log('❌ Failed to read error response body:', readError);
      }

      const errorMessage = errorData?.message || errorData?.error || errorBody || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(`HTTP error! status: ${response.status} | ${errorMessage}`);
    }

    // Parse successful response
    let data;
    const responseText = await response.text();
    console.log('✅ Success response body (raw):', responseText);
    
    try {
      data = JSON.parse(responseText);
      console.log('✅ Success response body (parsed):', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse success response as JSON:', parseError);
      throw new Error('Invalid JSON response from server');
    }

    console.log('🤖 AI Agent Response Success:', data.success);

    if (data.success) {
      console.log('📊 Response data structure:');
      console.log('  - aiResponse:', data.data?.aiResponse?.substring(0, 100) + '...');
      console.log('  - audioUrl:', data.data?.audioUrl);
      console.log('  - messageId:', data.data?.messageId);
      console.log('  - urgency:', data.data?.urgency);
      console.log('  - familyNotified:', data.data?.familyNotified);
      console.log('  - taskCreated:', data.data?.taskCreated);
      console.log('  - taskId:', data.data?.taskId);

      // Store important data in state
      setAiResponse(data.data.aiResponse);
      setAudioUrl(data.data.audioUrl);
      setMessageId(data.data.messageId);
      setUrgency(data.data.urgency);
      setFamilyNotified(data.data.familyNotified);
      setTaskCreated(data.data.taskCreated);
      setTaskId(data.data.taskId);

      // Auto-play the audio response
      if (data.data.audioUrl) {
        console.log('🔊 Attempting to play audio:', data.data.audioUrl);
        await playAudioResponse(data.data.audioUrl);
      } else {
        console.log('⚠️ No audio URL provided in response');
      }
    } else {
      console.log('❌ API returned success: false');
      console.log('❌ Error details:', data.error || data.message || 'No error details provided');
      throw new Error(data.error || data.message || 'API request failed');
    }

  } catch (error) {
    console.log('🚨 === FULL ERROR DETAILS ===');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('🚨 === END ERROR DETAILS ===');
    
    console.error('❌ Error calling AI Agent:', error);
    
    // Show user-friendly error message
    let userMessage = 'Failed to get AI response';
    if (error.message.includes('400')) {
      userMessage = 'Invalid request. Please try again.';
    } else if (error.message.includes('401')) {
      userMessage = 'Authentication failed. Please restart the app.';
    } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
      userMessage = 'Server is temporarily unavailable. Please try again later.';
    } else if (error.message.includes('Network request failed')) {
      userMessage = 'Network connection failed. Please check your internet connection.';
    }
    
    Alert.alert('Error', userMessage);
  }
};



  const playAudioResponse = async (url) => {
    try {
      console.log('🔊 Playing audio response...');
      setIsPlayingAudio(true);
      
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      
      setSound(newSound);

      // Set up playback status listener
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlayingAudio(false);
        }
      });

    } catch (error) {
      console.error('❌ Error playing audio:', error);
      setIsPlayingAudio(false);
      Alert.alert('Error', 'Failed to play audio response');
    }
  };

  const stopRecording = async () => {
    try {
      console.log('🛑 Stopping recording...');
      await audioRecorder.stop();
      setIsRecording(false);
      console.log('📁 File saved at:', audioRecorder.uri);

      if (audioRecorder.uri) {
        setLoading(true);
        
        // First, transcribe the audio
        const result = await transcribeAudio(audioRecorder.uri, {
          language_code: 'en-IN', // Changed to snake_case
          format: 'wav',
          sampleRate: 44100,
        });
        
        console.log('📝 Transcription Result:', result);
        const transcriptText = result.transcript || 'No transcript received';
        setTranscript(transcriptText);

        // If transcription successful, call AI agent
        if (result.transcript && !result.error) {
          await callAIAgent(result.transcript);
        }
        
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Error stopping recording:', err);
      setIsRecording(false);
      setLoading(false);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const replayAudio = async () => {
    if (audioUrl) {
      await playAudioResponse(audioUrl);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Assistant</Text>
      
      <RecordingButton
        isRecording={isRecording}
        onPress={isRecording ? stopRecording : startRecording}
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {/* Transcript Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Your Message:</Text>
        <Text style={styles.transcriptText}>
          {transcript || 'Your message will appear here.'}
        </Text>
      </View>

      {/* AI Response Section */}
      {aiResponse && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI Response:</Text>
          <Text style={styles.responseText}>{aiResponse}</Text>
          
          {/* Audio Controls */}
          {audioUrl && (
            <TouchableOpacity 
              style={styles.audioButton} 
              onPress={replayAudio}
              disabled={isPlayingAudio}
            >
              <Text style={styles.audioButtonText}>
                {isPlayingAudio ? '🔊 Playing...' : '🔊 Replay Audio'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Status Indicators */}
      {(urgency || familyNotified || taskCreated) && (
        <View style={styles.statusContainer}>
          {urgency && <Text style={styles.urgentStatus}>⚠️ Urgent</Text>}
          {familyNotified && <Text style={styles.status}>👨‍👩‍👧‍👦 Family Notified</Text>}
          {taskCreated && <Text style={styles.status}>✅ Task Created</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: '#FFFDDD'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 30,
    color: '#333'
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20
  },
  loadingText: {
    marginTop: 10,
    color: '#007AFF',
    fontSize: 16
  },
  section: {
    width: '100%',
    marginVertical: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionLabel: { 
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#333'
  },
  transcriptText: { 
    fontSize: 16, 
    color: '#666',
    lineHeight: 22
  },
  responseText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10
  },
  audioButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  audioButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15
  },
  status: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: 8,
    borderRadius: 15,
    margin: 4,
    fontSize: 12,
    fontWeight: '600'
  },
  urgentStatus: {
    backgroundColor: '#FF5722',
    color: 'white',
    padding: 8,
    borderRadius: 15,
    margin: 4,
    fontSize: 12,
    fontWeight: '600'
  }
});

