import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SvgUri } from 'react-native-svg';

export default function LoginScreen({
  onLogin,
  onSwitch
}: { onLogin: () => void; onSwitch: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('https://elderlybackend.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const resJson = await response.json();

      const { accessToken, refreshToken, user } = resJson.data;

      // Defensive: handle missing groups
      const groupId = Array.isArray(user.groups) && user.groups.length > 0 ? user.groups[0] : null;

      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
        ['userId', user.id],
        ['userName', user.name],
        ['userEmail', user.email],
        ['userRole', user.role],
        ['userPhone', user.phoneNumber],
        ['groupId', groupId ?? '']
      ]);

      console.log('Saving to AsyncStorage:');
console.log('accessToken:', accessToken);
console.log('refreshToken:', refreshToken);
console.log('userId:', user.id);
console.log('userName:', user.name);
console.log('userEmail:', user.email);
console.log('userRole:', user.role);
console.log('userPhone:', user.phoneNumber);
console.log('groupId:', groupId ?? '');
      console.log("Data stored successfully!");
      onLogin();
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Image 
              source={require('../assets/images/elderly_care.png')} 
              style={styles.headerImage} 
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome to Aadarsh</Text>
            <Text style={styles.subtitle}>Your trusted companion for care and support</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your email" 
                value={email}
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Enter your password" 
                value={password}
                onChangeText={setPassword} 
                secureTextEntry 
              />
            </View>
            
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={onSwitch}>
              <Text style={styles.switchText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
   backgroundColor: '#FFFDDD',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFDDD',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerImage: {
    width: 200,
    height: 160,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2A5C8F',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#5D7A9A',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2A5C8F',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#BFD1E5',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    height: 60,
    color: '#2A5C8F',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#2A5C8F',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#5D7A9A',
    marginRight: 5,
  },
  switchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2A5C8F',
    textDecorationLine: 'underline',
  },
});
