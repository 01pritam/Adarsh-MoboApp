// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { SvgUri } from 'react-native-svg';

// export default function LoginScreen({
//   onLogin,
//   onSwitch
// }: { onLogin: () => void; onSwitch: () => void }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = async () => {
//     try {
//       const response = await fetch('https://elderlybackend.onrender.com/api/users/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });
//       if (!response.ok) throw new Error(`Status ${response.status}`);
//       const resJson = await response.json();

//       const { accessToken, refreshToken, user } = resJson.data;

//       // Defensive: handle missing groups
//       const groupId = Array.isArray(user.groups) && user.groups.length > 0 ? user.groups[0] : null;

//       await AsyncStorage.multiSet([
//         ['accessToken', accessToken],
//         ['refreshToken', refreshToken],
//         ['userId', user.id],
//         ['userName', user.name],
//         ['userEmail', user.email],
//         ['userRole', user.role],
//         ['userPhone', user.phoneNumber],
//         ['groupId', groupId ?? '']
//       ]);

//       console.log('Saving to AsyncStorage:');
// console.log('accessToken:', accessToken);
// console.log('refreshToken:', refreshToken);
// console.log('userId:', user.id);
// console.log('userName:', user.name);
// console.log('userEmail:', user.email);
// console.log('userRole:', user.role);
// console.log('userPhone:', user.phoneNumber);
// console.log('groupId:', groupId ?? '');
//       console.log("Data stored successfully!");
//       onLogin();
//     } catch (error: any) {
//       Alert.alert('Login Failed', error.message);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.keyboardAvoid}
//       >
//         <View style={styles.container}>
//           <View style={styles.headerContainer}>
//             <Image 
//               source={require('../assets/images/elderly_care.png')} 
//               style={styles.headerImage} 
//               resizeMode="contain"
//             />
//             <Text style={styles.title}>Welcome to Aadarsh</Text>
//             <Text style={styles.subtitle}>Your trusted companion for care and support</Text>
//           </View>
          
//           <View style={styles.formContainer}>
//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Email Address</Text>
//               <TextInput 
//                 style={styles.input} 
//                 placeholder="Enter your email" 
//                 value={email}
//                 onChangeText={setEmail} 
//                 keyboardType="email-address" 
//                 autoCapitalize="none" 
//               />
//             </View>
            
//             <View style={styles.inputContainer}>
//               <Text style={styles.inputLabel}>Password</Text>
//               <TextInput 
//                 style={styles.input} 
//                 placeholder="Enter your password" 
//                 value={password}
//                 onChangeText={setPassword} 
//                 secureTextEntry 
//               />
//             </View>
            
//             <TouchableOpacity style={styles.forgotPassword}>
//               <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity style={styles.button} onPress={handleLogin}>
//               <Text style={styles.buttonText}>Sign In</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.footer}>
//             <Text style={styles.footerText}>Don't have an account?</Text>
//             <TouchableOpacity onPress={onSwitch}>
//               <Text style={styles.switchText}>Sign Up</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//    backgroundColor: '#FFFDDD',
//   },
//   keyboardAvoid: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 24,
//     backgroundColor: '#FFFDDD',
//   },
//   headerContainer: {
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   headerImage: {
//     width: 200,
//     height: 160,
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: '#2A5C8F',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 18,
//     color: '#5D7A9A',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   formContainer: {
//     width: '100%',
//     marginBottom: 30,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#2A5C8F',
//     marginBottom: 8,
//   },
//   input: {
//     backgroundColor: 'white',
//     borderWidth: 1,
//     borderColor: '#BFD1E5',
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 18,
//     height: 60,
//     color: '#2A5C8F',
//   },
//   forgotPassword: {
//     alignSelf: 'flex-end',
//     marginBottom: 24,
//   },
//   forgotPasswordText: {
//     color: '#2A5C8F',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   button: {
//     backgroundColor: '#4CAF50',
//     borderRadius: 12,
//     padding: 18,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerText: {
//     fontSize: 16,
//     color: '#5D7A9A',
//     marginRight: 5,
//   },
//   switchText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2A5C8F',
//     textDecorationLine: 'underline',
//   },
// });



import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function LoginScreen({
  onLogin,
  onSwitch,
}: {
  onLogin: () => void;
  onSwitch: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const validateInputs = () => {
    if (!email.trim()) {
      setLoginError("Email is required");
      return false;
    }

    if (!email.includes("@")) {
      setLoginError("Please enter a valid email address");
      return false;
    }

    if (!password.trim()) {
      setLoginError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setLoginError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setLoginError(null);
    setLoginStatus(null);

    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setLoginStatus("Connecting to server...");

    try {
      // Step 1: Connecting to server
      console.log("🔄 Attempting login for:", email);

      const response = await fetch(
        "https://elderlybackend.onrender.com/api/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      setLoginStatus("Verifying credentials...");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Invalid credentials or network issue."
        );
      }

      // Step 2: Processing response
      setLoginStatus("Processing login data...");
      const resJson = await response.json();
      const { accessToken, refreshToken, user } = resJson.data;

      if (!accessToken || !user) {
        throw new Error("Invalid response from server");
      }

      // Step 3: Storing user data
      setLoginStatus("Saving user data...");

      const groupId =
        Array.isArray(user.groups) && user.groups.length > 0
          ? user.groups[0]
          : null;

      await AsyncStorage.multiSet([
        ["accessToken", accessToken],
        ["refreshToken", refreshToken],
        ["userId", user.id],
        ["userName", user.name],
        ["userEmail", user.email],
        ["userRole", user.role],
        ["userPhone", user.phoneNumber || ""],
        ["groupId", groupId ?? ""],
      ]);

      // Step 4: Success
      setLoginStatus("Login successful! Redirecting...");
      console.log("✅ Login successful for:", user.name);

      // Small delay to show success message
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
      }, 1000);
    } catch (error: any) {
      console.error("💥 Login error:", error);
      setIsLoading(false);
      setLoginStatus(null);
      setLoginError(error.message || "Login failed. Please try again.");

      // Show alert for critical errors
      if (
        error.message.includes("network") ||
        error.message.includes("server")
      ) {
        Alert.alert(
          "Connection Error",
          "Unable to connect to server. Please check your internet connection and try again.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const clearError = () => {
    setLoginError(null);
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
              source={require("../assets/images/elderly_care.png")}
              style={styles.headerImage}
              resizeMode="contain"
            />
            <Text style={styles.title}>Welcome to Aadarsh</Text>
            <Text style={styles.subtitle}>
              Your trusted companion for care and support
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Error Display */}
            {loginError && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={20} color="#FF5100" />
                <Text style={styles.errorText}>{loginError}</Text>
                <TouchableOpacity
                  onPress={clearError}
                  style={styles.errorClose}
                >
                  <MaterialIcons name="close" size={16} color="#FF5100" />
                </TouchableOpacity>
              </View>
            )}

            {/* Status Display */}
            {loginStatus && (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="small" color="#009951" />
                <Text style={styles.statusText}>{loginStatus}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  loginError &&
                    loginError.toLowerCase().includes("email") &&
                    styles.inputError,
                ]}
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (loginError) clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#5D7A9A"
                editable={!isLoading}
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    loginError &&
                      loginError.toLowerCase().includes("password") &&
                      styles.inputError,
                  ]}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (loginError) clearError();
                  }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#5D7A9A"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButtonAbsolute}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility-off" : "visibility"}
                    size={24}
                    color={isLoading ? "#BFD1E5" : "#2A5C8F"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.forgotPasswordText,
                  isLoading && styles.disabledText,
                ]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.buttonLoading}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.buttonText}>Signing In...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, isLoading && styles.disabledText]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={onSwitch} disabled={isLoading}>
              <Text
                style={[styles.switchText, isLoading && styles.disabledText]}
              >
                Sign Up
              </Text>
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
    backgroundColor: "#FFF3DD", // Updated to match your color palette
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFF3DD", // Updated to match your color palette
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerImage: {
    width: 200,
    height: 160,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#009951", // Updated to match your color palette
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "black", // Updated for better contrast
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    width: "100%",
    marginBottom: 30,
  },
  // Error Container
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3DD",
    borderWidth: 1,
    borderColor: "#FF5100",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#FF5100",
    fontWeight: "500",
  },
  errorClose: {
    padding: 4,
  },
  // Status Container
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3DD",
    borderWidth: 1,
    borderColor: "#009951",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#009951",
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#009951", // Updated to match your color palette
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#FF8C00", // Updated to match your color palette
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    height: 60,
    color: "black", // Updated for better contrast
  },
  inputError: {
    borderColor: "#FF5100",
    borderWidth: 2,
  },
  inputWrapper: {
    position: "relative",
  },
  eyeButtonAbsolute: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#009951", // Updated to match your color palette
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#009951", // Updated to match your color palette
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#C15C2D", // Disabled state color
    opacity: 0.7,
  },
  buttonLoading: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    color: "black", // Updated for better contrast
    marginRight: 5,
  },
  switchText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#009951", // Updated to match your color palette
    textDecorationLine: "underline",
  },
  disabledText: {
    opacity: 0.5,
  },
});
