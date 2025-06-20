import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  Vibration,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NotificationService } from '../../../utils/NotificationService';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  taskType: string;
  groupName: string;
  groupId: string;
  assignedToName?: string;
  assignedToId?: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  alarmTime?: Date;
  notificationId?: string;
}

interface ElderlyTaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onTaskUpdate: (task: Task) => void;
}

const ElderlyTaskCard: React.FC<ElderlyTaskCardProps> = ({ 
  task, 
  onPress, 
  onTaskUpdate 
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSetAlarm = async () => {
    try {
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please enable notifications to set alarms');
        return;
      }

      setShowTimePicker(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permissions');
    }
  };

  const handleTimeSelect = async (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    
    if (selectedDate) {
      try {
        Vibration.vibrate(100);

        const notificationId = await NotificationService.scheduleTaskAlarm(
          task.id,
          task.title,
          selectedDate
        );

        if (notificationId) {
          const updatedTask = {
            ...task,
            alarmTime: selectedDate,
            notificationId,
          };
          
          onTaskUpdate(updatedTask);
          
          Alert.alert(
            'Alarm Set! ⏰',
            `Reminder set for ${selectedDate.toLocaleTimeString()}`,
            [{ text: 'OK', onPress: () => Vibration.vibrate(50) }]
          );
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to schedule alarm');
      }
    }
  };

  const handleCancelAlarm = async () => {
    if (task.notificationId) {
      try {
        await NotificationService.cancelAlarm(task.notificationId);
        
        const updatedTask = {
          ...task,
          alarmTime: undefined,
          notificationId: undefined,
        };
        
        onTaskUpdate(updatedTask);
        Vibration.vibrate(100);
        
        Alert.alert('Alarm Cancelled', 'Your reminder has been removed');
      } catch (error) {
        Alert.alert('Error', 'Failed to cancel alarm');
      }
    }
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl p-5 mb-4 shadow-lg border-l-4 border-green-500"
      onPress={() => onPress(task)}
    >
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-xl font-bold text-gray-800 flex-1 mr-3">
          {task.title}
        </Text>
        <View className={`px-3 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
          <Text className="text-white text-xs font-bold uppercase">
            {task.priority}
          </Text>
        </View>
      </View>

      <Text className="text-base text-gray-600 mb-4 leading-6">
        {task.description}
      </Text>

      <View className="flex-row justify-between items-center mb-4">
        <View className={`px-3 py-2 rounded-lg ${getStatusColor(task.status)}`}>
          <Text className="text-white text-xs font-bold uppercase">
            {task.status?.replace('_', ' ')}
          </Text>
        </View>
        {task.assignedToName && (
          <Text className="text-green-600 font-semibold flex-1 text-right">
            {task.assignedToName} is helping
          </Text>
        )}
      </View>

      <View className="border-t border-gray-200 pt-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            {task.alarmTime ? (
              <View>
                <Text className="text-sm text-gray-600">Alarm set for:</Text>
                <Text className="text-base font-semibold text-green-600">
                  {task.alarmTime.toLocaleTimeString()}
                </Text>
              </View>
            ) : (
              <Text className="text-sm text-gray-500">No alarm set</Text>
            )}
          </View>
          
          <View className="flex-row space-x-2">
            {!task.alarmTime ? (
              <TouchableOpacity
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={handleSetAlarm}
              >
                <Text className="text-white font-semibold">⏰ Set Alarm</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="bg-red-500 px-4 py-2 rounded-lg"
                onPress={handleCancelAlarm}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-4">
        <Text className="text-sm text-gray-600 font-medium">
          {task.groupName}
        </Text>
        <Text className="text-xs text-gray-400">
          {new Date(task.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeSelect}
        />
      )}
    </TouchableOpacity>
  );
};

export default ElderlyTaskCard;
