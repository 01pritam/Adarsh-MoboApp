import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import IndexScreen from "./index";
import AddReminderScreen from "./family_members/setReminder";
import FamilyTaskScreen from "./family_members/familytask";
import CreateGroupScreen from "./family_members/CreateGroup";
import LocationTrackerScreen from "./family_members/LocationTrackerScreen";
import CaregiverPage from "./family_members/CaregiverPage";

const Tab = createBottomTabNavigator();

export default function FamilyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            index: "home",
            setReminder: "add-alarm",
            familyTask: "assignment-ind",
            groups: "group",
            location: "location-on",
            caregiver: "medical-services",
          };
          return (
            <MaterialIcons
              name={icons[route.name] || "help-outline"}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: "white",
          height: 60,
          paddingBottom: 5,
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="index"
        component={IndexScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="setReminder"
        component={AddReminderScreen}
        options={{ tabBarLabel: "Reminders" }}
      />
      <Tab.Screen
        name="familyTask"
        component={FamilyTaskScreen}
        options={{ tabBarLabel: "Tasks" }}
      />
      <Tab.Screen
        name="groups"
        component={CreateGroupScreen}
        options={{ tabBarLabel: "Groups" }}
      />
      <Tab.Screen
        name="location"
        component={LocationTrackerScreen}
        options={{ tabBarLabel: "Location" }}
      />
      <Tab.Screen
        name="caregiver"
        component={CaregiverPage}
        options={{ tabBarLabel: "Caregivers" }}
      />
    </Tab.Navigator>
  );
}
