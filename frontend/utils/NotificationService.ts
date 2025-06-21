// // AlarmService.ts
// import AlarmNotification from 'react-native-alarm-notification';
// import { Vibration } from 'react-native';
// import SoundPlayer from 'react-native-sound-player';

// export class AlarmService {
//   static async scheduleTaskAlarm(
//     taskId: string,
//     taskTitle: string,
//     alarmTime: Date
//   ): Promise<string | null> {
//     const alarmNotificationData = {
//       alarm_id: taskId,
//       alarm_time: alarmTime.toTimeString().slice(0, 8), // HH:mm:ss format
//       alarm_title: '⏰ Task Reminder',
//       alarm_text: `Time for: ${taskTitle}`,
//       alarm_sound: 'default',
//       alarm_vibration: true,
//       alarm_sound_loop: false,
//       alarm_noti_removable: true,
//       alarm_activate: true,
//     };

//     return new Promise((resolve, reject) => {
//       AlarmNotification.schedule(
//         alarmNotificationData,
//         (success) => {
//           console.log('Alarm scheduled successfully:', success);
//           resolve(taskId);
//         },
//         (fail) => {
//           console.error('Failed to schedule alarm:', fail);
//           reject(fail);
//         }
//       );
//     });
//   }

//   static async cancelAlarm(alarmId: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//       AlarmNotification.cancel(
//         alarmId,
//         (success) => {
//           console.log('Alarm cancelled:', success);
//           resolve();
//         },
//         (fail) => {
//           console.error('Failed to cancel alarm:', fail);
//           reject(fail);
//         }
//       );
//     });
//   }

//   static playAlarmSound(): void {
//     try {
//       SoundPlayer.playSoundFile('alarm_tone', 'mp3');
//       Vibration.vibrate([0, 500, 200, 500]);
//     } catch (error) {
//       console.error('Failed to play alarm sound:', error);
//     }
//   }
// }
