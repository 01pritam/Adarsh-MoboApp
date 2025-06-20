import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Tabs from './(tabs)/_layout';
import LoginScreen from '../components/LoginScreen';
import SignupScreen from '../components/SignupScreen';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const clearAllAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All AsyncStorage data cleared!');
    // Optionally, show a user alert
    // Alert.alert('Storage Cleared', 'All local data has been removed.');
  } catch (e) {
    console.error('Error clearing AsyncStorage:', e);
  }
};
clearAllAsyncStorage();
export default function AuthLoader() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('accessToken')
      .then(token => setAuthenticated(!!token))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF"/></View>;
  }

  if (authenticated) {
    return <Tabs />;
  }

  return showSignup 
    ? <SignupScreen onSignup={() => setAuthenticated(true)} /> 
    : <LoginScreen 
        onLogin={() => setAuthenticated(true)} 
        onSwitch={() => setShowSignup(true)} 
      />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
