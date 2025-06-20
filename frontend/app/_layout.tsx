// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthLoader from './AuthLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import "./globals.css"
 
  /* Your App */
// const clearAllAsyncStorage = async () => {
//   try {
//     await AsyncStorage.clear();
//     console.log('All AsyncStorage data cleared!');
//     // Optionally, show a user alert
//     // Alert.alert('Storage Cleared', 'All local data has been removed.');
//   } catch (e) {
//     console.error('Error clearing AsyncStorage:', e);
//   }
// };
// clearAllAsyncStorage();
export default function App() {
  return (
      <AuthLoader />
  );
}
