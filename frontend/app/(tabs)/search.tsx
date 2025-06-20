// import React from 'react';
// import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

// export default function SearchScreen() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         <Text style={styles.title}>Search</Text>
//         <Text style={styles.subtitle}>Search functionality coming soon</Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8F9FA',
//   },
//   content: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#1C1C1E',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#6C6C70',
//     textAlign: 'center',
//   },
// });
// src/screens/AddReminderScreen.tsx



// import React, { useState } from 'react';
// import {
//   SafeAreaView, ScrollView, View, Text, TextInput,
//   TouchableOpacity, Switch, Button, Alert, StyleSheet
// } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function AddReminderScreen() {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [type, setType] = useState('medication');
//   const [dateTime, setDateTime] = useState(new Date());
//   const [showPicker, setShowPicker] = useState(false);
//   const [isRecurring, setIsRecurring] = useState(false);
//   const [interval, setInterval] = useState(1);
//   const [endDate, setEndDate] = useState(new Date());
//   const [showEnd, setShowEnd] = useState(false);
//   const [priority, setPriority] = useState('high');
//   const [confirmRequired, setConfirmRequired] = useState(true);

//   // Hardcoded IDs for demonstration
//   const GROUP_ID = '684fbf712814507a051209cd';

//   const handleAdd = async () => {
//     const userId = await AsyncStorage.getItem('userId');
//     const token  = await AsyncStorage.getItem('accessToken');
//     if (!userId || !token) {
//       Alert.alert('Authentication Error', 'Please log in again'); return;
//     }
//     // Validation
//     if (!title.trim() || !type || !GROUP_ID) {
//       Alert.alert('Validation Error', 'Title, Type, and Group are required'); return;
//     }
//     if (dateTime <= new Date()) {
//       Alert.alert('Validation Error', 'Date & Time must be in the future'); return;
//     }
//     // Payload
//     const payload = {
//       title,
//       description,
//       reminderType: type,
//       elderlyUserId: userId,
//       groupId: GROUP_ID,
//       scheduledDateTime: dateTime.toISOString(),
//       isRecurring,
//       recurrencePattern: isRecurring
//         ? { type: 'daily', interval, endDate: endDate.toISOString() }
//         : undefined,
//       alarmSettings: {
//         soundType: 'gentle',
//         volume: 7,
//         vibrate: true,
//         snoozeEnabled: true,
//         snoozeDuration: 10
//       },
//       priority,
//       requiresConfirmation: confirmRequired
//     };
//     console.log('Payload:', payload);
//     try {
//       const res = await fetch('https://elderlybackend.onrender.com/api/reminders', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(payload)
//       });
//       const data = await res.json();
//       console.log('Response:', data);
//       if (!res.ok) throw new Error(data.message || `Status ${res.status}`);
//       Alert.alert('Success', 'Reminder added successfully');
//       // Reset form
//       setTitle(''); setDescription(''); setDateTime(new Date());
//       setIsRecurring(false); setInterval(1); setEndDate(new Date());
//       setPriority('high'); setConfirmRequired(true);
//     } catch (err: any) {
//       Alert.alert('Error', err.message);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView>
//         <Text style={styles.heading}>New Reminder</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Title *"
//           value={title}
//           onChangeText={setTitle}
//         />
//         <TextInput
//           style={[styles.input, styles.textArea]}
//           placeholder="Description"
//           value={description}
//           onChangeText={setDescription}
//           multiline
//         />
//         <Text style={styles.label}>Type *</Text>
//         <View style={styles.row}>
//           {['medication','appointment','activity'].map(t => (
//             <TouchableOpacity
//               key={t}
//               style={[styles.chip, type===t && styles.chipSel]}
//               onPress={()=>setType(t)}
//             >
//               <Text style={type===t?styles.chipTextSel:styles.chipText}>
//                 {t.charAt(0).toUpperCase()+t.slice(1)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <Text style={styles.label}>Date & Time *</Text>
//         <TouchableOpacity style={styles.dateBtn} onPress={()=>setShowPicker(true)}>
//           <Text>{dateTime.toLocaleString()}</Text>
//         </TouchableOpacity>
//         {showPicker && (
//           <DateTimePicker
//             value={dateTime}
//             mode="datetime"
//             display="default"
//             onChange={(_,d)=>{setShowPicker(false); d && setDateTime(d);}}
//             minimumDate={new Date()}
//           />
//         )}
//         <View style={styles.row}>
//           <Text>Recurring</Text>
//           <Switch value={isRecurring} onValueChange={setIsRecurring} />
//         </View>
//         {isRecurring && (
//           <>
//             <Text style={styles.label}>Interval (days)</Text>
//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               value={String(interval)}
//               onChangeText={t=>setInterval(Number(t)||1)}
//             />
//             <Text style={styles.label}>End Date</Text>
//             <TouchableOpacity style={styles.dateBtn} onPress={()=>setShowEnd(true)}>
//               <Text>{endDate.toLocaleDateString()}</Text>
//             </TouchableOpacity>
//             {showEnd && (
//               <DateTimePicker
//                 value={endDate}
//                 mode="date"
//                 display="default"
//                 onChange={(_,d)=>{setShowEnd(false); d && setEndDate(d);}}
//                 minimumDate={dateTime}
//               />
//             )}
//           </>
//         )}
//         <Text style={styles.label}>Priority</Text>
//         <View style={styles.row}>
//           {['low','medium','high'].map(p => (
//             <TouchableOpacity
//               key={p}
//               style={[styles.chip, priority===p && styles.chipSel]}
//               onPress={()=>setPriority(p)}
//             >
//               <Text style={priority===p?styles.chipTextSel:styles.chipText}>{p}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <View style={styles.row}>
//           <Text>Requires Confirmation</Text>
//           <Switch value={confirmRequired} onValueChange={setConfirmRequired} />
//         </View>
//         <Button title="Add Reminder" onPress={handleAdd} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container:{flex:1,backgroundColor:'#F8F9FA',padding:16},
//   heading:{fontSize:24,fontWeight:'bold',marginBottom:16},
//   input:{borderWidth:1,borderColor:'#ccc',borderRadius:8,padding:12,marginBottom:12},
//   textArea:{height:80,textAlignVertical:'top'},
//   label:{fontWeight:'600',marginBottom:8},
//   row:{flexDirection:'row',flexWrap:'wrap',marginBottom:12},
//   chip:{padding:8,borderWidth:1,borderColor:'#ccc',borderRadius:20,marginRight:8,marginBottom:8},
//   chipSel:{backgroundColor:'#3498db',borderColor:'#2980b9'},
//   chipText:{color:'#333'},chipTextSel:{color:'#fff',fontWeight:'bold'},
//   dateBtn:{padding:12,backgroundColor:'#eee',borderRadius:8,marginBottom:12},
//   switchRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}
// });





import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Platform,
  SafeAreaView, ScrollView,
  StyleSheet,
  Switch,
  Text, TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function AddReminderScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('medication');
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [interval, setInterval] = useState(1);
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [priority, setPriority] = useState('high');
  const [confirmRequired, setConfirmRequired] = useState(true);

  // Hardcoded IDs for demonstration
  const GROUP_ID = '684fbf712814507a051209cd';

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date picker event:', event);
    console.log('Selected date:', selectedDate);
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'dismissed') {
      console.log('Date picker dismissed');
      return;
    }
    
    if (selectedDate) {
      console.log('Setting new date:', selectedDate);
      setDateTime(selectedDate);
    }
  };

  // Handle time change
  const onTimeChange = (event: any, selectedTime?: Date) => {
    console.log('Time picker event:', event);
    console.log('Selected time:', selectedTime);
    
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (event.type === 'dismissed') {
      console.log('Time picker dismissed');
      return;
    }
    
    if (selectedTime) {
      console.log('Setting new time:', selectedTime);
      // Combine current date with new time
      const newDateTime = new Date(dateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setDateTime(newDateTime);
    }
  };

  // Handle end date change
  const onEndDateChange = (event: any, selectedDate?: Date) => {
    console.log('End date picker event:', event);
    
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    
    if (event.type === 'dismissed') {
      return;
    }
    
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleAdd = async () => {
    console.log('🚀 Starting reminder creation...');
    
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('accessToken');
      
      console.log('👤 User ID:', userId);
      console.log('🔑 Token exists:', !!token);
      
      if (!userId || !token) {
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }

      // Validation
      if (!title.trim() || !type || !GROUP_ID) {
        Alert.alert('Validation Error', 'Title, Type, and Group are required');
        return;
      }

      const now = new Date();
      if (dateTime <= now) {
        Alert.alert('Validation Error', 'Date & Time must be in the future');
        return;
      }

      // Payload
      const payload = {
        title: title.trim(),
        description: description.trim(),
        reminderType: type,
        elderlyUserId: userId,
        groupId: GROUP_ID,
        scheduledDateTime: dateTime.toISOString(),
        isRecurring,
        recurrencePattern: isRecurring
          ? { 
              type: 'daily', 
              interval, 
              endDate: endDate.toISOString() 
            }
          : undefined,
        alarmSettings: {
          soundType: 'gentle',
          volume: 7,
          vibrate: true,
          snoozeEnabled: true,
          snoozeDuration: 10
        },
        priority,
        requiresConfirmation: confirmRequired
      };

      console.log('📤 Payload:', JSON.stringify(payload, null, 2));

      const res = await fetch('https://elderlybackend.onrender.com/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', res.status);
      console.log('📋 Response headers:', Object.fromEntries(res.headers.entries()));

      const responseText = await res.text();
      console.log('📄 Raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed response:', data);
      } catch (parseError) {
        console.log('❌ Failed to parse response:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (!res.ok) {
        console.log('❌ Request failed:', data);
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      Alert.alert('Success', 'Reminder added successfully');
      
      // Reset form
      setTitle('');
      setDescription('');
      setDateTime(new Date());
      setIsRecurring(false);
      setInterval(1);
      setEndDate(new Date());
      setPriority('high');
      setConfirmRequired(true);

    } catch (err: any) {
      console.log('💥 Error adding reminder:', err);
      Alert.alert('Error', err.message || 'Failed to add reminder');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.heading}>New Reminder</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Title *"
          value={title}
          onChangeText={setTitle}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        
        <Text style={styles.label}>Type *</Text>
        <View style={styles.row}>
          {['medication', 'appointment', 'activity'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, type === t && styles.chipSel]}
              onPress={() => setType(t)}
            >
              <Text style={type === t ? styles.chipTextSel : styles.chipText}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Date & Time *</Text>
        
        {/* Date Selection */}
        <TouchableOpacity 
          style={styles.dateBtn} 
          onPress={() => {
            console.log('Opening date picker...');
            setShowDatePicker(true);
          }}
        >
          <Text>📅 {dateTime.toLocaleDateString()}</Text>
        </TouchableOpacity>
        
        {/* Time Selection */}
        <TouchableOpacity 
          style={styles.dateBtn} 
          onPress={() => {
            console.log('Opening time picker...');
            setShowTimePicker(true);
          }}
        >
          <Text>🕐 {dateTime.toLocaleTimeString()}</Text>
        </TouchableOpacity>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={dateTime}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={dateTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
        )}
        
        <View style={styles.switchRow}>
          <Text>Recurring</Text>
          <Switch value={isRecurring} onValueChange={setIsRecurring} />
        </View>
        
        {isRecurring && (
          <>
            <Text style={styles.label}>Interval (days)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(interval)}
              onChangeText={t => setInterval(Number(t) || 1)}
            />
            
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity 
              style={styles.dateBtn} 
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text>📅 {endDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            
            {showEndDatePicker && (
              <DateTimePicker
                testID="endDatePicker"
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onEndDateChange}
                minimumDate={dateTime}
              />
            )}
          </>
        )}
        
        <Text style={styles.label}>Priority</Text>
        <View style={styles.row}>
          {['low', 'medium', 'high'].map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, priority === p && styles.chipSel]}
              onPress={() => setPriority(p)}
            >
              <Text style={priority === p ? styles.chipTextSel : styles.chipText}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.switchRow}>
          <Text>Requires Confirmation</Text>
          <Switch value={confirmRequired} onValueChange={setConfirmRequired} />
        </View>
        
        <Button title="Add Reminder" onPress={handleAdd} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 16 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  textArea: { height: 80, textAlignVertical: 'top' },
  label: { fontWeight: '600', marginBottom: 8, fontSize: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, marginRight: 8, marginBottom: 8 },
  chipSel: { backgroundColor: '#3498db', borderColor: '#2980b9' },
  chipText: { color: '#333' },
  chipTextSel: { color: '#fff', fontWeight: 'bold' },
  dateBtn: { padding: 12, backgroundColor: '#eee', borderRadius: 8, marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }
});

