import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import ElderlyTaskScreen from './elderly/earlyTaskScreen';
import ReminderListScreen from './elderly/displayReminder';
import GuideScreen from './elderly/GuideScreen'; // Implement this screen
import MicScreen from './elderly/mic';
import IndexScreen from './elderly/index';
import JoinGroupScreen from './elderly/JoinGroup';

const Tab = createBottomTabNavigator();

export default function ElderlyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            index: 'home',
            remind: 'alarm',
            mic: 'mic',
            guide: 'menu-book',
            task: 'assignment',
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
      <Tab.Screen name="remind" component={ReminderListScreen} options={{ tabBarLabel: 'Reminders' }} />
      <Tab.Screen name="mic" component={MicScreen} options={{ tabBarLabel: 'Record' }} />
      <Tab.Screen name="guide" component={GuideScreen} options={{ tabBarLabel: 'Guide' }} />
      <Tab.Screen name="task" component={ElderlyTaskScreen} options={{ tabBarLabel: 'Tasks' }} />
      <Tab.Screen name="groups" component={JoinGroupScreen} options={{ tabBarLabel: 'Groups' }} />
    </Tab.Navigator>
  );
}
