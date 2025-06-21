// In ElderlyTaskCard.tsx

// or
import { SimpleAlarmService } from "../../../utils/SimpleAlarmService"

const handleTimeSelect = async (event: any, selectedDate?: Date) => {
  setShowTimePicker(false);
  
  if (selectedDate) {
    try {
      Vibration.vibrate(100);

      // Using AlarmService
      const alarmId = await AlarmService.scheduleTaskAlarm(
        task.id,
        task.title,
        selectedDate
      );

      // Or using SimpleAlarmService
      // const alarmId = await SimpleAlarmService.scheduleAlarm(
      //   task.id,
      //   task.title,
      //   selectedDate
      // );

      if (alarmId) {
        const updatedTask = {
          ...task,
          alarmTime: selectedDate,
          notificationId: alarmId,
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
