// SignupScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleDropdown from './CustomDropdown';

export default function SignupScreen({ onSignup, onSwitch }: { onSignup: () => void, onSwitch?: () => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('family_member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const roleOptions = [
    { label: 'Elderly', value: 'elderly' },
    { label: 'Family Member', value: 'family_member' },
    { label: 'Caretaker', value: 'caretaker' }
  ];

  const handleSignup = async () => {
    try {
      const response = await fetch('https://elderlybackend.onrender.com/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, email, password, phoneNumber }),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const resJson = await response.json();
      const { accessToken, refreshToken, user } = resJson.data;

      console.log("Access Token:", accessToken);
      await AsyncStorage.setItem('accessToken', accessToken);
      onSignup();
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <Image 
                source={require('../assets/images/elderly_care.png')} 
                style={styles.headerImage} 
                resizeMode="contain"
              />
              <Text style={styles.title}>Create Your Account</Text>
              <Text style={styles.subtitle}>Join our community of care and support</Text>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter your name" 
                  value={name} 
                  onChangeText={setName} 
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Role</Text>
                <SimpleDropdown
                  data={roleOptions}
                  value={role}
                  onSelect={(value) => setRole(value)}
                />
              </View>
              
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
                  placeholder="Create a password" 
                  value={password}
                  onChangeText={setPassword} 
                  secureTextEntry 
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter your phone number" 
                  value={phoneNumber}
                  onChangeText={setPhoneNumber} 
                  keyboardType="phone-pad" 
                />
              </View>
              
              <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
            
            {onSwitch && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={onSwitch}>
                  <Text style={styles.switchText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDDD', // Cream background color
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFDDD', // Cream background color
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerImage: {
    width: 180,
    height: 140,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2A5C8F',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5D7A9A',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
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
    fontSize: 16,
    height: 56,
    color: '#2A5C8F',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
