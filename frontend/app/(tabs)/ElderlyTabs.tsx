// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import React from 'react';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// import ElderlyTaskScreen from './elderly/earlyTaskScreen';
// import ReminderListScreen from './elderly/displayReminder';
// import GuideScreen from './elderly/GuideScreen'; // Implement this screen
// import MicScreen from './elderly/mic';
// import IndexScreen from './elderly/index';
// import JoinGroupScreen from './elderly/JoinGroup';

// const Tab = createBottomTabNavigator();

// export default function ElderlyTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ color, size }) => {
//           const icons: Record<string, string> = {
//             index: 'home',
//             remind: 'alarm',
//             mic: 'mic',
//             guide: 'menu-book',
//             task: 'assignment',
//             groups: 'more-horiz',
//           };
//           return <MaterialIcons name={icons[route.name] || 'help-outline'} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#007AFF',
//         tabBarInactiveTintColor: 'gray',
//         tabBarStyle: { backgroundColor: 'white', height: 60, paddingBottom: 5 },
//         headerShown: false,
//       })}
//     >
//       <Tab.Screen name="index" component={IndexScreen} options={{ tabBarLabel: 'Home' }} />
//       <Tab.Screen name="remind" component={ReminderListScreen} options={{ tabBarLabel: 'Reminders' }} />
//       <Tab.Screen name="mic" component={MicScreen} options={{ tabBarLabel: 'Record' }} />
//       <Tab.Screen name="guide" component={GuideScreen} options={{ tabBarLabel: 'Guide' }} />
//       <Tab.Screen name="task" component={ElderlyTaskScreen} options={{ tabBarLabel: 'Tasks' }} />
//       <Tab.Screen name="groups" component={JoinGroupScreen} options={{ tabBarLabel: 'Groups' }} />
//     </Tab.Navigator>
//   );
// }



import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
// Import your screens
import ElderlyTaskScreen from "./elderly/earlyTaskScreen";
import IndexScreen from "./elderly/index";
import ModernGroupChat from "./elderly/JoinGroup";
import MicScreen from "./elderly/mic";
import ReminderListScreen from "./elderly/displayReminder"
const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

// Custom tab bar component with dynamic positioning and modern design
function ModernTabBar({ state, descriptors, navigation }: any) {
  // Animation values
  const micTextAnimation = useRef(new Animated.Value(0)).current;
  const centerButtonScale = useRef(new Animated.Value(1)).current;
  const tabBarPosition = useRef(new Animated.Value(0)).current; // 0 = floating, 1 = bottom
  const tabBarRadius = useRef(new Animated.Value(35)).current; // 35 = rounded, 0 = no radius
  const tabBarMargin = useRef(new Animated.Value(20)).current; // 20 = margin, 0 = no margin

  // Track if Groups tab is active
  const [isGroupsActive, setIsGroupsActive] = useState(false);

  // Update animations when focused tab changes
  useEffect(() => {
    const micIndex = state.routes.findIndex(
      (route: any) => route.name === "mic"
    );
    const groupsIndex = state.routes.findIndex(
      (route: any) => route.name === "groups"
    );
    const isMicActive = state.index === micIndex;
    const isGroupsCurrentlyActive = state.index === groupsIndex;

    // Update Groups active state
    setIsGroupsActive(isGroupsCurrentlyActive);

    // Animate mic text
    Animated.timing(micTextAnimation, {
      toValue: isMicActive ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animate tab bar position and styling for Groups
    Animated.parallel([
      Animated.timing(tabBarPosition, {
        toValue: isGroupsCurrentlyActive ? 1 : 0,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(tabBarRadius, {
        toValue: isGroupsCurrentlyActive ? 0 : 35,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(tabBarMargin, {
        toValue: isGroupsCurrentlyActive ? 0 : 20,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, [
    state.index,
    micTextAnimation,
    tabBarPosition,
    tabBarRadius,
    tabBarMargin,
  ]);

  // Handle tab press with animation
  const onTabPress = (route: any, isFocused: boolean, index: number) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);

      // Special animation for center button
      if (route.name === "mic") {
        Animated.sequence([
          Animated.timing(centerButtonScale, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(centerButtonScale, {
            toValue: 1.1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(centerButtonScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  // Icons mapping with modern icons
  const icons: { [key: string]: string } = {
    index: "home",
    remind: "notifications-active",
    mic: "mic",
    task: "assignment",
    groups: "groups",
  };

  // Labels mapping
  const labels: { [key: string]: string } = {
    index: "Home",
    remind: "Remind",
    mic: "Record",
    task: "Tasks",
    groups: "Groups",
  };

  // Calculate dynamic bottom position and styling
  const animatedBottom = tabBarPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [Platform.OS === "ios" ? 30 : 20, 0], // Float vs bottom
  });

  const animatedLeft = tabBarMargin;
  const animatedRight = tabBarMargin;

  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        {
          bottom: animatedBottom,
          left: animatedLeft,
          right: animatedRight,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.tabBar,
          {
            borderRadius: tabBarRadius,
            overflow: "hidden", // KEY FIX: This ensures rounded corners work
          },
          isGroupsActive && styles.tabBarGroupsActive,
        ]}
      >
        <LinearGradient
          colors={["white", "white"]}
          style={[
            styles.tabBarGradient,
            {
              borderRadius: 35, // KEY FIX: Match the border radius here too
            },
          ]}
        >
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const isMicTab = route.name === "mic";

            if (isMicTab) {
              // Special rendering for center mic button
              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={() => onTabPress(route, isFocused, index)}
                  style={styles.centerTabContainer}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.centerButton,
                      {
                        transform: [{ scale: centerButtonScale }],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={["#FF5100", "#FF5100"]}
                      style={styles.centerButtonGradient}
                    >
                      <MaterialIcons
                        name={icons[route.name]}
                        size={28}
                        color="white"
                      />
                    </LinearGradient>
                  </Animated.View>

                  {isFocused && (
                    <Animated.View
                      style={[
                        styles.micTextContainer,
                        {
                          opacity: micTextAnimation,
                          transform: [
                            {
                              translateY: micTextAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [10, 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.centerTabText}>
                        {labels[route.name]}
                      </Text>
                    </Animated.View>
                  )}
                </TouchableOpacity>
              );
            }

            // Regular tab rendering with modern design
            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => onTabPress(route, isFocused, index)}
                style={styles.tabContainer}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  {isFocused ? (
                    <View style={[styles.activeIconContainer]}>
                      <LinearGradient
                        colors={["#009951", "#009951"]}
                        style={styles.activeIconGradient}
                      >
                        <MaterialIcons
                          name={icons[route.name]}
                          size={24}
                          color="white"
                        />
                      </LinearGradient>
                    </View>
                  ) : (
                    <MaterialIcons
                      name={icons[route.name]}
                      size={24}
                      color="#C15C2D"
                    />
                  )}
                </View>

                <View style={styles.regularTextContainer}>
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isFocused ? "#009951" : "black",
                      },
                    ]}
                  >
                    {labels[route.name]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

// Enhanced ModernGroupChat wrapper to handle proper spacing
function ModernGroupChatWrapper() {
  return (
    <View style={styles.groupScreenContainer}>
      <ModernGroupChat />
    </View>
  );
}

export default function ModernElderlyTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <ModernTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="mic"
    >
      <Tab.Screen name="index" component={IndexScreen} />
      <Tab.Screen name="remind" component={ReminderListScreen} />
      <Tab.Screen name="mic" component={MicScreen} />
      <Tab.Screen name="task" component={ElderlyTaskScreen} />
      <Tab.Screen name="groups" component={ModernGroupChatWrapper} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    height: 80,
    alignItems: "center",
    zIndex: 1000,
  },
  tabBar: {
    height: 80,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    backgroundColor: "white", // KEY FIX: Set background color here too
  },
  tabBarGradient: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  tabBarGroupsActive: {
    elevation: 20,
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  // Group screen container with proper spacing
  groupScreenContainer: {
    flex: 1,
    paddingBottom: 0, // No extra padding needed since input is positioned absolutely
  },
  // Regular tab container
  tabContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  activeIconContainer: {
    shadowColor: "#009951",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  activeIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  // Regular text container
  regularTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: -2,
  },
  // Center mic button styles
  centerTabContainer: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  centerButton: {
    marginBottom: 4,
  },
  centerButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#FF5100",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  // Mic text container
  micTextContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  centerTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FF5100",
  },
});
