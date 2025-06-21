import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
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

  // ✅ Critical: Prevent infinite loops and multiple requests
  const isRequestInProgress = useRef(false);
  const requestAbortController = useRef(null);
  const componentMounted = useRef(true);

  useEffect(() => {
    console.log('🔄 [COMPONENT] AdaptiveTextVoiceAssistant mounted');
    componentMounted.current = true;
    
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
    
    return () => {
      console.log('🔄 [COMPONENT] AdaptiveTextVoiceAssistant unmounting');
      componentMounted.current = false;
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (requestAbortController.current) {
        requestAbortController.current.abort();
      }
    };
  }, []);

  // ✅ REMOVED ALL ANIMATIONS - No more useEffect for animations

  // Dynamic font size calculation
  const getMainTextSize = useCallback((text) => {
    if (
      !text ||
      text === "Hi!\nHow can I help you?" ||
      text === "Processing..."
    ) {
      return 32;
    }
    const length = text.length;
    if (length < 50) return 28;
    if (length < 100) return 24;
    if (length < 200) return 20;
    if (length < 300) return 18;
    return 16;
  }, []);

  const getSubTextSize = useCallback((text) => {
    if (
      !text ||
      text === "Your smart assistant is ready" ||
      text === "Please wait..."
    ) {
      return 16;
    }
    const length = text.length;
    if (length < 30) return 16;
    if (length < 60) return 15;
    if (length < 120) return 14;
    if (length < 200) return 13;
    return 12;
  }, []);

  const handleMicPress = useCallback(() => {
    // ✅ REMOVED ALL ANIMATIONS - Simple state change only
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
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
  }, [audioRecorder]);

  const stopRecording = useCallback(async () => {
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
  }, [audioRecorder]);

  // ✅ CRITICAL FIX: Prevent infinite token refresh loop
  const callAIAgent = useCallback(async (transcriptText) => {
    if (!componentMounted.current || isRequestInProgress.current) {
      console.log('🔄 Request skipped - component unmounted or request in progress');
      return;
    }

    const debugId = `DEBUG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🔍 [${debugId}] ========== STARTING AI AGENT CALL ==========`);
    
    try {
      isRequestInProgress.current = true;

      const token = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');
      
      console.log(`🔍 [${debugId}] Credentials check:`);
      console.log(`- Token exists: ${!!token}`);
      console.log(`- Token length: ${token?.length || 0}`);
      console.log(`- UserId: ${userId || 'null'}`);
      console.log(`- Transcript: "${transcriptText}"`);
      
      if (!token) {
        console.error(`❌ [${debugId}] No token found`);
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }
      
      const requestBody = { 
        transcript: transcriptText.trim(),
        userId: userId 
      };
      
      const requestHeaders = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      };
      
      console.log(`🔍 [${debugId}] Request prepared:`);
      console.log(`- URL: https://elderlybackend.onrender.com/api/agent/ai`);
      console.log(`- Body:`, JSON.stringify(requestBody, null, 2));

      requestAbortController.current = new AbortController();
      
      const timeoutId = setTimeout(() => {
        console.log(`⏰ [${debugId}] Request timeout (10s) - aborting`);
        requestAbortController.current?.abort();
      }, 10000);

      console.log(`🔍 [${debugId}] Making network request...`);
      const requestStartTime = Date.now();

      // ✅ Promise.race to force timeout
      const fetchPromise = fetch(
        "https://elderlybackend.onrender.com/api/agent/ai",
        {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(requestBody),
          signal: requestAbortController.current.signal,
        }
      );

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout after 10 seconds'));
        }, 10000);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      clearTimeout(timeoutId);
      const requestDuration = Date.now() - requestStartTime;
      
      console.log(`📡 [${debugId}] Response received after ${requestDuration}ms`);
      console.log(`📡 [${debugId}] Status: ${response.status}`);
      console.log(`📡 [${debugId}] OK: ${response.ok}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [${debugId}] HTTP Error:`, errorText);
        
        if (response.status === 401) {
          Alert.alert('Authentication Error', 'Please log in again');
          return;
        }
        
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log(`📥 [${debugId}] Response parsed successfully`);
      console.log(`📥 [${debugId}] Success: ${responseData.success}`);

      if (responseData.success && responseData.data) {
        const data = responseData.data;
        
        console.log(`🔍 [${debugId}] Processing response data...`);
        
        setAiResponse(data.aiResponse || "Response received successfully");
        setAudioUrl(data.audioUrl || "");

        if (data.audioUrl) {
          console.log(`🎵 [${debugId}] Audio URL found: ${data.audioUrl}`);
          try {
            await playAudioResponse(data.audioUrl);
            console.log(`✅ [${debugId}] Audio playback started`);
          } catch (audioError) {
            console.error(`❌ [${debugId}] Audio playback failed:`, audioError);
          }
        }

        if (data.orderPlaced && data.orderDetails) {
          const orderInfo = data.orderDetails;
          console.log(`🎉 [${debugId}] Order placed successfully:`, orderInfo);
          
          Alert.alert(
            'Order Placed Successfully! 🎉', 
            `${orderInfo.productName} ordered for ₹${orderInfo.amount}\n\nOrder ID: ${orderInfo.orderId}\nEstimated Delivery: ${orderInfo.estimatedDelivery}\nRemaining Balance: ₹${orderInfo.newWalletBalance}`,
            [{ text: 'Great!', style: 'default' }]
          );
        }

        if (data.taskCreated) {
          console.log(`📋 [${debugId}] Task created for family assistance`);
          
          if (data.aiResponse && data.aiResponse.toLowerCase().includes('balance')) {
            Alert.alert(
              'Insufficient Balance 💳',
              'You don\'t have enough money in your wallet. Your family has been notified to help you add funds.',
              [{ text: 'OK', style: 'default' }]
            );
          } else if (data.aiResponse && data.aiResponse.toLowerCase().includes('find')) {
            Alert.alert(
              'Item Not Available 🔍',
              'The item you requested is not in our menu. Your family has been notified to help you order it manually.',
              [{ text: 'OK', style: 'default' }]
            );
          }
        }

        console.log(`✅ [${debugId}] ========== AI AGENT CALL COMPLETED ==========`);

      } else {
        const errorMessage = responseData.error || responseData.message || "AI request failed";
        console.error(`❌ [${debugId}] Invalid response:`, errorMessage);
        throw new Error(errorMessage);
      }
      
    } catch (error) {
      console.error(`❌ [${debugId}] ========== AI AGENT CALL FAILED ==========`);
      console.error(`❌ [${debugId}] Error:`, {
        name: error.name,
        message: error.message
      });
      
      setAiResponse("Sorry, I couldn't process your request right now. Please try again.");
      
      if (error.message.includes('timeout') || error.name === 'AbortError') {
        console.error(`❌ [${debugId}] Request timeout detected`);
        Alert.alert(
          'Request Timeout', 
          'The request is taking too long. Please try again.',
          [
            { 
              text: 'Retry', 
              onPress: () => {
                setTimeout(() => callAIAgent(transcriptText), 1000);
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else if (error.message.includes('Network')) {
        Alert.alert('Connection Error', 'Please check your internet connection.');
      } else {
        Alert.alert('Error', `Something went wrong: ${error.message}`);
      }
      
    } finally {
      isRequestInProgress.current = false;
      requestAbortController.current = null;
    }
  }, []); // ✅ Empty dependency array to prevent infinite loops

  const playAudioResponse = useCallback(async (url) => {
    try {
      setIsPlayingAudio(true);

      if (sound) {
        await sound.unloadAsync();
      }

      console.log('🎵 Playing audio from URL:', url);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlayingAudio(false);
          console.log('🎵 Audio playback finished');
        }
        if (status.error) {
          console.error('🎵 Audio playback error:', status.error);
          setIsPlayingAudio(false);
        }
      });
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlayingAudio(false);
      Alert.alert('Audio Error', 'Could not play audio response');
    }
  }, [sound]);

  const replayAudio = useCallback(async () => {
    if (audioUrl) {
      await playAudioResponse(audioUrl);
    }
  }, [audioUrl, playAudioResponse]);

  const clearResults = useCallback(() => {
    setTranscript("");
    setAiResponse("");
    setAudioUrl("");
    if (sound) {
      sound.unloadAsync();
    }
  }, [sound]);

  // Get current text content for sizing
  const currentMainText = loading
    ? "Processing..."
    : aiResponse
    ? aiResponse
    : "Hi!\nHow can I help you?";

  const currentSubText = loading
    ? "Please wait..."
    : transcript
    ? transcript
    : "Your smart assistant is ready";

  const mainFontSize = getMainTextSize(currentMainText);
  const subFontSize = getSubTextSize(currentSubText);

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: "#FFF3DD",
      }}
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 pt-12 pb-5">
          <View className="flex-1">
            <Text className="text-black text-xl font-bold">
              Aadarsh Intelligence(AI)
            </Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity className="w-10 h-10 bg-[#C15C2D] rounded-full items-center justify-center mr-3">
              <MaterialIcons name="person" size={20} color="#fff" />
            </TouchableOpacity>
            {(transcript || aiResponse) && (
              <TouchableOpacity
                onPress={clearResults}
                className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
              >
                <MaterialIcons name="refresh" size={20} color="#00d4aa" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-5">
          {/* Text Area */}
          <View style={{ height: height * 0.45 }} className="mb-5">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100%",
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Main Text */}
              <View className="mb-5 items-center px-3">
                <Text
                  className="text-black font-bold text-center"
                  style={{
                    fontSize: mainFontSize,
                    lineHeight: mainFontSize + 8,
                    maxWidth: width - 60,
                  }}
                >
                  {currentMainText}
                </Text>
              </View>

              {/* Sub Text */}
              <View className="mb-5 items-center px-3">
                <Text
                  className="text-[#C15C2D] text-center font-medium"
                  style={{
                    fontSize: subFontSize,
                    lineHeight: subFontSize + 4,
                    maxWidth: width - 80,
                  }}
                >
                  {currentSubText}
                </Text>
              </View>

              {/* Status */}
              {(isRecording || loading) && (
                <View className="bg-white/10 px-4 py-2 rounded-full">
                  <Text className="text-gray-600 text-sm font-medium">
                    {isRecording ? "Listening..." : "Processing..."}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Microphone Section */}
          <View
            className="items-center justify-center pb-10"
            style={{ height: 200 }}
          >
            <View className="relative items-center justify-center mb-5">
              {/* ✅ REMOVED ALL ANIMATED VIEWS - Simple static button */}
              <TouchableOpacity
                className="w-32 h-32 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isRecording ? "#00d4aa" : "#1e293b",
                  borderWidth: 3,
                  borderColor: isRecording ? "#00d4aa" : "#475569",
                  shadowColor: isRecording ? "#00d4aa" : "#000",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: isRecording ? 0.8 : 0.3,
                  shadowRadius: isRecording ? 20 : 10,
                  elevation: 10,
                }}
                onPress={handleMicPress}
                activeOpacity={0.8}
                disabled={loading || isRequestInProgress.current}
              >
                {loading ? (
                  <ActivityIndicator size={50} color="#00d4aa" />
                ) : (
                  <MaterialIcons
                    name={isRecording ? "stop" : "mic"}
                    size={60}
                    color={isRecording ? "#0f172a" : "#00d4aa"}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View className="flex-row items-center space-x-4">
              {/* Replay Button */}
              {audioUrl && !isRecording && !loading && (
                <TouchableOpacity
                  className="flex-row items-center bg-white/20 px-4 py-2 rounded-full mr-3"
                  onPress={replayAudio}
                  disabled={isPlayingAudio}
                >
                  <MaterialIcons
                    name={isPlayingAudio ? "volume-up" : "replay"}
                    size={18}
                    color="#00d4aa"
                  />
                  <Text className="text-teal-400 text-sm font-semibold ml-2">
                    {isPlayingAudio ? "Playing..." : "Replay"}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Status Indicator */}
              {loading && (
                <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full">
                  <ActivityIndicator size={16} color="#00d4aa" />
                  <Text className="text-teal-400 text-sm font-semibold ml-2">
                    Processing...
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}