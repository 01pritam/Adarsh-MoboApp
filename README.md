# Adarsh-MoboApp Eldercare Safety Monitoring App

Overview
This is a comprehensive React Native mobile application designed for eldercare safety monitoring. The app provides real-time location tracking, AI-powered fall detection analysis, emergency alerting, and group communication features to ensure the safety and well-being of elderly users and their families.
🌟 Features
🔍 Real-time Location Tracking
GPS-based location monitoring with safe zone visualization
Interactive map display with markers and geofence circles
Safe zone breach detection with visual status indicators
Automatic location updates every 10 seconds
🤖 AI-Powered Fall Detection
Simulated machine learning-based fall detection analysis
Confidence scoring and risk assessment
Detailed analysis reports with recommendations
Multiple alert levels (low, medium, high)
🚨 Emergency Features
One-tap SOS button for emergency alerts
Direct emergency calling functionality
Automatic alert messaging to family members
Location sharing during emergencies
👥 Group Management
Create family or caregiver groups
Join existing groups with group ID
Role-based permissions (admin, family, caregiver, elderly)
Real-time group messaging with reactions and replies
📱 User-Friendly Interface
Clean, modern design optimized for elderly users
Large buttons and clear typography
Intuitive navigation with tab-based structure
Accessibility features and voice support
🚀 Installation
Prerequisites
Node.js (v16 or higher)
React Native development environment
Expo CLI
Android Studio / Xcode for device testing
Setup Steps
Clone the repository
bash
git clone <repository-url>
cd eldercare-safety-app
Install dependencies
bash
npm install
Install required native modules
bash
npm install react-native-maps react-native-geolocation-service
npx expo install expo-video expo-linear-gradient
npm install @react-native-async-storage/async-storage
npm install react-native-vector-icons
iOS Setup (if targeting iOS)
bash
cd ios && pod install && cd ..
Configure API endpoints
Update the base URL in the code to point to your backend server
Ensure your backend is running on https://elderlybackend.onrender.com
Run the application
bash
npx expo start
📖 Usage
Getting Started
Launch the app and grant location permissions
View the dashboard with real-time location tracking
Monitor safe zone status on the interactive map
Perform fall detection analysis using the analyze button
Access emergency features via the SOS button
Group Management
Create a group by tapping "Create Group" and filling in details
Join a group using a group ID provided by family members
Send messages and communicate with group members
Manage roles and permissions within the group
Emergency Procedures
SOS Alert: Tap the red SOS button for immediate emergency alert
Emergency Call: Use the emergency call button for direct contact
Location Sharing: Current location is automatically shared during emergencies