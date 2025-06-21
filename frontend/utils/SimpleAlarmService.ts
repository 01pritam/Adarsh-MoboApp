// SimpleAlarmService.ts
import { Alert, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SimpleAlarmService {
  private static timers: Map<string, NodeJS.Timeout> = new Map();

  static async scheduleAlarm(
    taskId: string,
    taskTitle: string,
    alarmTime: Date
  ): Promise<string> {
    const now = new Date();
    const timeUntilAlarm = alarmTime.getTime() - now.getTime();

    if (timeUntilAlarm <= 0) {
      throw new Error('Cannot schedule alarm for past time');
    }

    // Clear existing timer if any
    this.cancelAlarm(taskId);

    const timerId = setTimeout(() => {
      this.triggerAlarm(taskTitle);
      this.timers.delete(taskId);
    }, timeUntilAlarm);

    this.timers.set(taskId, timerId);
    
    // Store alarm data for persistence
    await AsyncStorage.setItem(
      `alarm_${taskId}`,
      JSON.stringify({
        taskId,
        taskTitle,
        alarmTime: alarmTime.toISOString(),
      })
    );

    return taskId;
  }

  static cancelAlarm(taskId: string): void {
    const timerId = this.timers.get(taskId);
    if (timerId) {
      clearTimeout(timerId);
      this.timers.delete(taskId);
    }
    AsyncStorage.removeItem(`alarm_${taskId}`);
  }

  private static triggerAlarm(taskTitle: string): void {
    Vibration.vibrate([0, 1000, 500, 1000]);
    
    Alert.alert(
      '⏰ Alarm!',
      `Time for: ${taskTitle}`,
      [
        {
          text: 'Snooze (5 min)',
          onPress: () => {
            // Implement snooze functionality
            setTimeout(() => this.triggerAlarm(taskTitle), 5 * 60 * 1000);
          },
        },
        { text: 'Dismiss', onPress: () => {} },
      ],
      { cancelable: false }
    );
  }

  static async restoreAlarms(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const alarmKeys = keys.filter(key => key.startsWith('alarm_'));
      
      for (const key of alarmKeys) {
        const alarmData = await AsyncStorage.getItem(key);
        if (alarmData) {
          const { taskId, taskTitle, alarmTime } = JSON.parse(alarmData);
          const alarmDate = new Date(alarmTime);
          
          if (alarmDate > new Date()) {
            await this.scheduleAlarm(taskId, taskTitle, alarmDate);
          } else {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore alarms:', error);
    }
  }
}
