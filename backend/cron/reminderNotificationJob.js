// const cron = require('node-cron');
// const axios = require('axios');
// const Reminder = require('../models/reminder');

// // ✅ Hardcoded Expo push token for testing
// const hardcodedPushToken = 'ExponentPushToken[8ROVvqN01l50SXXAWdq5Ty]'; // Replace with real token

// // Schedule cron job to run every minute
// cron.schedule('* * * * *', async () => {
//   console.log('⏰ Running reminder notification job at', new Date());

//   try {
//     const dueReminders = await Reminder.findDueReminders();
//     console.log(`🔔 Found ${dueReminders.length} due reminder(s)`);

//     for (const reminder of dueReminders) {
//       const payload = {
//         to: hardcodedPushToken,
//         sound: 'default',
//         title: `🔔 Reminder: ${reminder.title}`,
//         body: reminder.description || 'You have a scheduled reminder!',
//         data: {
//           reminderId: reminder._id.toString(),
//           scheduledDateTime: reminder.scheduledDateTime,
//         },
//       };

//       try {
//         const response = await axios.post(
//           'https://exp.host/--/api/v2/push/send',
//           payload,
//           {
//             headers: {
//               'Accept': 'application/json',
//               'Accept-encoding': 'gzip, deflate',
//               'Content-Type': 'application/json',
//             },
//           }
//         );

//         console.log(`✅ Notification sent:`, response.data);

//         // Mark reminder as notified
//         reminder.notificationSent = true;
//         reminder.lastTriggered = new Date();
//         await reminder.save();

//       } catch (notificationError) {
//         console.error(`❌ Failed to send notification:`, notificationError.response?.data || notificationError.message);
//       }
//     }

//   } catch (error) {
//     console.error('❌ Error in cron job:', error.message);
//   }
// });



const cron = require('node-cron');
const axios = require('axios');
const Reminder = require('../models/reminder');

// Hardcoded Expo push token (for now)
const hardcodedPushToken = 'ExponentPushToken[8ROVvqN01l50SXXAWdq5Ty]';
const startReminderCronJob = () => {
  cron.schedule('* * * * *', async () => {
    console.log('⏰ Running reminder notification job at', new Date());

    try {
      const dueReminders = await Reminder.findDueReminders();
      console.log(`🔔 Found ${dueReminders.length} due reminder(s)`);

      for (const reminder of dueReminders) {
        const payload = {
          to: hardcodedPushToken,
          sound: 'default',
          title: `🔔 Reminder: ${reminder.title}`,
          body: reminder.description || 'You have a scheduled reminder!',
          data: {
            reminderId: reminder._id.toString(),
            scheduledDateTime: reminder.scheduledDateTime,
          },
        };

        try {
          const response = await axios.post(
            'https://exp.host/--/api/v2/push/send',
            payload,
            {
              headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
              },
            }
          );

          console.log(`✅ Notification sent:`, response.data);

          reminder.notificationSent = true;
          reminder.lastTriggered = new Date();
          await reminder.save();

        } catch (notificationError) {
          console.error(`❌ Failed to send notification:`, notificationError.response?.data || notificationError.message);
        }
      }

    } catch (error) {
      console.error('❌ Error in cron job:', error.message);
    }
  });
};

module.exports = startReminderCronJob;
