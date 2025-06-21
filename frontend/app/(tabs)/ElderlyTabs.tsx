// ModernElderlyTabs.tsx - Clean Version
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

// Import screens
import ElderlyTaskScreen from "./elderly/earlyTaskScreen";
import IndexScreen from "./elderly/index";
import ModernGroupChat from "./elderly/JoinGroup";
import MicScreen from "./elderly/mic";
import ProfileScreen from "./profileScreen";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

function ModernTabBar({ state, descriptors, navigation }: any) {
  const micTextAnimation = useRef(new Animated.Value(0)).current;
  const centerButtonScale = useRef(new Animated.Value(1)).current;
  const tabBarPosition = useRef(new Animated.Value(0)).current;
  const tabBarRadius = useRef(new Animated.Value(35)).current;
  const tabBarMargin = useRef(new Animated.Value(20)).current;
  const [isGroupsActive, setIsGroupsActive] = useState(false);

  useEffect(() => {
    const micIndex = state.routes.findIndex((route: any) => route.name === "mic");
    const groupsIndex = state.routes.findIndex((route: any) => route.name === "groups");
    
    const isMicActive = state.index === micIndex;
    const isGroupsCurrentlyActive = state.index === groupsIndex;

    if (isGroupsCurrentlyActive !== isGroupsActive) {
      setIsGroupsActive(isGroupsCurrentlyActive);
    }

    Animated.timing(micTextAnimation, {
      toValue: isMicActive ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

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
  }, [state.index]);

  const onTabPress = (route: any, isFocused: boolean) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);

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

  const icons: { [key: string]: string } = {
    index: "home",
    task: "assignment",
    mic: "mic",
    groups: "groups",
    profile: "person",
  };

  const labels: { [key: string]: string } = {
    index: "Home",
    task: "Tasks",
    mic: "Record",
    groups: "Groups",
    profile: "Profile",
  };

  const animatedBottom = tabBarPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [Platform.OS === "ios" ? 30 : 20, 0],
  });

  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        {
          bottom: animatedBottom,
          left: tabBarMargin,
          right: tabBarMargin,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.tabBar,
          {
            borderRadius: tabBarRadius,
            overflow: "hidden",
          },
          isGroupsActive && styles.tabBarGroupsActive,
        ]}
      >
        <LinearGradient
          colors={["white", "white"]}
          style={[styles.tabBarGradient, { borderRadius: 35 }]}
        >
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const isMicTab = route.name === "mic";

            if (isMicTab) {
              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={() => onTabPress(route, isFocused)}
                  style={styles.centerTabContainer}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.centerButton,
                      { transform: [{ scale: centerButtonScale }] },
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

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => onTabPress(route, isFocused)}
                style={styles.tabContainer}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  {isFocused ? (
                    <View style={styles.activeIconContainer}>
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
                      { color: isFocused ? "#009951" : "black" },
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
      screenOptions={{ headerShown: false }}
      initialRouteName="mic"
    >
      <Tab.Screen name="index" component={IndexScreen} />
      <Tab.Screen name="task" component={ElderlyTaskScreen} />
      <Tab.Screen name="mic" component={MicScreen} />
      <Tab.Screen name="groups" component={ModernGroupChatWrapper} />
      <Tab.Screen name="profile" component={ProfileScreen} />
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
    backgroundColor: "white",
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
  groupScreenContainer: {
    flex: 1,
    paddingBottom: 0,
  },
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
  regularTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: -2,
  },
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
