import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import IndexScreen from './index';
import AddReminderScreen from './family_members/setReminder'; // Implement this screen
import FamilyTaskScreen from './family_members/familytask';   // Implement this screen
import CreateGroupScreen from './family_members/CreateGroup';                // Implement this screen
import LocationTrackerScreen from './family_members/LocationTrackerScreen';
const Tab = createBottomTabNavigator();

export default function FamilyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            index: 'home',
            setReminder: 'add-alarm',
            familyTask: 'assignment-ind',
            groups: 'more-horiz',
          };
          return <MaterialIcons name={icons[route.name] || 'help-outline'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: 'white', height: 60, paddingBottom: 5 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="index" component={IndexScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="setReminder" component={AddReminderScreen} options={{ tabBarLabel: 'Set Reminder' }} />
      <Tab.Screen name="familyTask" component={FamilyTaskScreen} options={{ tabBarLabel: 'Family Tasks' }} />
      <Tab.Screen name="groups" component={CreateGroupScreen} options={{ tabBarLabel: 'Groups' }} />
      <Tab.Screen name="location" component={LocationTrackerScreen} options={{ tabBarLabel: 'Location' }} />
      {/* <Tab.Screen name="etc" component={EtcScreen} options={{ tabBarLabel: 'More' }} /> */}
    </Tab.Navigator>
  );
}
