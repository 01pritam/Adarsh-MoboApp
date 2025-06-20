import Voice from '@react-native-voice/voice';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

class VoiceHandler {
  private isListening: boolean = false;
  private transcript: string = '';
  private onResultCallback?: (result: string) => void;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (error: any) => void;

  constructor() {
    try {
      if (!Voice) {
        console.warn('Voice module is not available.');
        return;
      }

      Voice.onSpeechStart = this.onSpeechStart;
      Voice.onSpeechEnd = this.onSpeechEnd;
      Voice.onSpeechResults = this.onSpeechResults;
      Voice.onSpeechError = this.onSpeechError;
    } catch (error) {
      console.error('Error initializing VoiceHandler:', error);
    }
  }

  private onSpeechStart = () => {
    this.isListening = true;
    this.onStartCallback?.();
  };

  private onSpeechEnd = () => {
    this.isListening = false;
    this.onEndCallback?.();
  };

  private onSpeechResults = (e: any) => {
    if (e.value?.length > 0) {
      this.transcript = e.value[0];
      this.onResultCallback?.(this.transcript);
    }
  };

  private onSpeechError = (e: any) => {
    console.error('Speech recognition error:', e);
    this.onErrorCallback?.(e);
  };

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record audio.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true;
  }

  async checkPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    }
    return true;
  }

  async startListening(): Promise<void> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          Alert.alert('Permission Required', 'Microphone permission is required to use voice input.');
          return;
        }
      }

      if (!Voice || typeof Voice.start !== 'function') {
        console.error('Voice module not available or improperly linked');
        Alert.alert('Voice Error', 'Voice recognition is not available. Check native linking.');
        return;
      }

      await Voice.start('en-US');
    } catch (e) {
      console.error('Error starting voice recognition:', e);
      this.onErrorCallback?.(e);
    }
  }

  async stopListening(): Promise<void> {
    try {
      if (Voice && typeof Voice.stop === 'function') {
        await Voice.stop();
      }
    } catch (e) {
      console.error('Error stopping voice recognition:', e);
    }
  }

  setCallbacks(callbacks: {
    onResult?: (result: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
  }) {
    this.onResultCallback = callbacks.onResult;
    this.onStartCallback = callbacks.onStart;
    this.onEndCallback = callbacks.onEnd;
    this.onErrorCallback = callbacks.onError;
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  destroy() {
    try {
      if (Voice && typeof Voice.destroy === 'function') {
        Voice.destroy().then(() => {
          if (typeof Voice.removeAllListeners === 'function') {
            Voice.removeAllListeners();
          }
        });
      }
    } catch (e) {
      console.error('Error destroying voice resources:', e);
    }
  }
}

export default new VoiceHandler();