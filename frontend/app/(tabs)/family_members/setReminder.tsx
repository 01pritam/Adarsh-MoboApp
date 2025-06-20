import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView, 
  ScrollView,
  StyleSheet,
  Switch,
  Text, 
  TextInput,
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
  const [userGroupId, setUserGroupId] = useState('');
  const [currentUserMemberRole, setCurrentUserMemberRole] = useState('');
  const [elderlyMembers, setElderlyMembers] = useState([]);
  const [selectedElderlyMember, setSelectedElderlyMember] = useState('');
  const [canCreateReminders, setCanCreateReminders] = useState(false);

  // Fetch group info and validate user permissions
  const fetchGroupInfoAndValidateUser = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const groupId = await AsyncStorage.getItem('groupId');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !groupId || !userId) {
        console.log('❌ Missing authentication data');
        return false;
      }

      console.log('🔍 Fetching group info and validating user...');
      console.log('👤 User ID:', userId);
      console.log('👥 Group ID:', groupId);

      setUserGroupId(groupId);

      // Fetch fresh group data
      const response = await fetch(
        `https://elderlybackend.onrender.com/api/group/info/${groupId}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch group info');
      }

      const group = data.group;
      console.log('📋 Group data received:', group.name);

      // Find current user's member role in the group
      const currentUserMember = group.members.find(
        (member: any) => member.userId._id === userId
      );

      if (!currentUserMember) {
        console.log('❌ Current user not found in group members');
        Alert.alert('Access Denied', 'You are not a member of this group.');
        return false;
      }

      console.log('👤 Current user MEMBER role:', currentUserMember.role);
      setCurrentUserMemberRole(currentUserMember.role);

      // Check if current user can create reminders (admin or member can create)
      const canCreate = ['admin', 'member'].includes(currentUserMember.role);
      setCanCreateReminders(canCreate);

      if (!canCreate) {
        console.log('❌ User cannot create reminders');
        Alert.alert(
          'Permission Denied', 
          `Your member role "${currentUserMember.role}" cannot create reminders. Only "admin" or "member" roles can create reminders.`
        );
        return false;
      }

      // Filter members with "elderly" role
      const elderlyMembersInGroup = group.members.filter(
        (member: any) => member.role === 'elderly'
      );

      console.log('👴 Found elderly members:', elderlyMembersInGroup.length);

      // Log elderly members details (as in your group code)
      console.log('\nElderly Members:');
      elderlyMembersInGroup.forEach((member: any, index: number) => {
        console.log(`  #${index + 1}`);
        console.log('    User ID:', member.userId._id);
        console.log('    Name:', member.userId.name);
        console.log('    Email:', member.userId.email);
        console.log('    Role:', member.role);
        console.log('    Added By:', member.addedBy);
        console.log('    Added At:', member.addedAt);
        console.log('    Entry ID:', member._id);
      });

      if (elderlyMembersInGroup.length === 0) {
        Alert.alert(
          'No Elderly Members', 
          'There are no members with "elderly" role in this group to send reminders to.'
        );
        return false;
      }

      // Store elderly members in AsyncStorage (matching your group code pattern)
      await AsyncStorage.setItem('elderlyMembers', JSON.stringify(elderlyMembersInGroup));
      console.log('Elderly members stored in AsyncStorage.');

      // Map the data structure for UI
      const mappedElderlyList = elderlyMembersInGroup.map((member: any) => ({
        id: member.userId._id,        // Access nested _id
        name: member.userId.name,     // Access nested name
        email: member.userId.email,   // Access nested email
        memberRole: member.role,      // This is the group member role
        addedAt: member.addedAt
      }));

      setElderlyMembers(mappedElderlyList);
      
      // Auto-select first elderly member if only one
      if (mappedElderlyList.length === 1) {
        setSelectedElderlyMember(mappedElderlyList[0].id);
      }

      console.log('✅ Group info fetched and user validated successfully');
      return true;

    } catch (error) {
      console.error('💥 Error fetching group info and validating user:', error);
      Alert.alert('Error', 'Failed to fetch group information');
      return false;
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        const groupId = await AsyncStorage.getItem('groupId');
        console.log('📋 Retrieved group ID from storage:', groupId);
        
        if (groupId) {
          await fetchGroupInfoAndValidateUser();
        } else {
          Alert.alert('No Group', 'Please create or join a group first.');
        }
      } catch (error) {
        console.error('❌ Error initializing data:', error);
      }
    };
    
    initializeData();
  }, []);

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'dismissed') {
      return;
    }
    
    if (selectedDate) {
      setDateTime(selectedDate);
    }
  };

  // Handle time change
  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (event.type === 'dismissed') {
      return;
    }
    
    if (selectedTime) {
      const newDateTime = new Date(dateTime);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setDateTime(newDateTime);
    }
  };

  // Handle end date change
  const onEndDateChange = (event: any, selectedDate?: Date) => {
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
    
    // Check if user can create reminders
    if (!canCreateReminders) {
      Alert.alert(
        'Permission Denied', 
        'You do not have permission to create reminders.'
      );
      return;
    }

    // Check if elderly member is selected
    if (!selectedElderlyMember) {
      Alert.alert('Selection Required', 'Please select an elderly member to send the reminder to.');
      return;
    }
    
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('accessToken');
      const groupId = await AsyncStorage.getItem('groupId');
      
      console.log('👤 Creator User ID:', userId);
      console.log('👴 Target Elderly Member ID:', selectedElderlyMember);
      console.log('🔑 Token exists:', !!token);
      console.log('👥 Group ID:', groupId);
      console.log('🎭 Creator Member Role:', currentUserMemberRole);
      
      if (!userId || !token) {
        Alert.alert('Authentication Error', 'Please log in again');
        return;
      }

      if (!groupId) {
        Alert.alert('Group Error', 'No group found. Please contact support.');
        return;
      }

      // Validation
      if (!title.trim() || !type) {
        Alert.alert('Validation Error', 'Title and Type are required');
        return;
      }

      const now = new Date();
      if (dateTime <= now) {
        Alert.alert('Validation Error', 'Date & Time must be in the future');
        return;
      }

      // Payload - targeting the selected elderly MEMBER
      const payload = {
        title: title.trim(),
        description: description.trim(),
        reminderType: type,
        elderlyUserId: selectedElderlyMember, // Target elderly member's user ID
        groupId: groupId,
        createdBy: userId, // The member/admin who created it
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

      const selectedElderlyName = elderlyMembers.find((member: any) => member.id === selectedElderlyMember)?.name || 'Selected member';
      
      Alert.alert('Success', `Reminder created successfully for ${selectedElderlyName}!`);
      
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Create Reminder</Text>
        
        {/* Status Info */}
        {userGroupId && (
          <View style={[styles.statusInfo, canCreateReminders ? styles.successInfo : styles.warningInfo]}>
            <Text style={styles.statusText}>Your Member Role: {currentUserMemberRole}</Text>
            <Text style={styles.statusText}>
              Status: {canCreateReminders ? '✅ Can create reminders' : '⚠️ Cannot create reminders'}
            </Text>
            <Text style={styles.statusText}>Elderly Members: {elderlyMembers.length}</Text>
          </View>
        )}

        {/* Elderly Member Selection */}
        {canCreateReminders && elderlyMembers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send Reminder To</Text>
            <Text style={styles.label}>Select Elderly Member *</Text>
            <View style={styles.row}>
              {elderlyMembers.map((member: any) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberChip, 
                    selectedElderlyMember === member.id && styles.memberChipSelected
                  ]}
                  onPress={() => setSelectedElderlyMember(member.id)}
                >
                  <Text style={selectedElderlyMember === member.id ? styles.memberChipTextSelected : styles.memberChipText}>
                    👴 {member.name}
                  </Text>
                  <Text style={[styles.roleText, selectedElderlyMember === member.id ? styles.roleTextSelected : styles.roleTextNormal]}>
                    ({member.memberRole})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Details</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Title *"
            value={title}
            onChangeText={setTitle}
            editable={canCreateReminders}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            editable={canCreateReminders}
          />
          
          <Text style={styles.label}>Reminder Type *</Text>
          <View style={styles.row}>
            {['medication', 'appointment', 'activity', 'exercise', 'meal'].map(t => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.chip, 
                  type === t && styles.chipSelected,
                  !canCreateReminders && styles.disabledChip
                ]}
                onPress={() => canCreateReminders && setType(t)}
                disabled={!canCreateReminders}
              >
                <Text style={type === t ? styles.chipTextSelected : styles.chipText}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.label}>Date & Time *</Text>
          
          {/* Date Selection */}
          <TouchableOpacity 
            style={[styles.pickerButton, !canCreateReminders && styles.disabledButton]} 
            onPress={() => canCreateReminders && setShowDatePicker(true)}
            disabled={!canCreateReminders}
          >
            <Text style={styles.pickerText}>
              📅 {dateTime.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          
          {/* Time Selection */}
          <TouchableOpacity 
            style={[styles.pickerButton, !canCreateReminders && styles.disabledButton]} 
            onPress={() => canCreateReminders && setShowTimePicker(true)}
            disabled={!canCreateReminders}
          >
            <Text style={styles.pickerText}>
              🕐 {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          {/* Date Picker */}
          {showDatePicker && canCreateReminders && (
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
          {showTimePicker && canCreateReminders && (
            <DateTimePicker
              testID="timePicker"
              value={dateTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Recurrence Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recurrence Settings</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.label}>Recurring Reminder</Text>
            <Switch 
              value={isRecurring} 
              onValueChange={setIsRecurring}
              disabled={!canCreateReminders}
            />
          </View>
          
          {isRecurring && canCreateReminders && (
            <>
              <Text style={styles.label}>Interval (days)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={String(interval)}
                onChangeText={t => setInterval(Number(t) || 1)}
                placeholder="Repeat every X days"
                editable={canCreateReminders}
              />
              
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowEndDatePicker(true)}
                disabled={!canCreateReminders}
              >
                <Text style={styles.pickerText}>
                  📅 {endDate.toLocaleDateString()}
                </Text>
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
        </View>

        {/* Additional Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Settings</Text>
          
          <Text style={styles.label}>Priority Level</Text>
          <View style={styles.row}>
            {[
              { level: 'low', emoji: '🟢' },
              { level: 'medium', emoji: '🟡' },
              { level: 'high', emoji: '🔴' }
            ].map(({ level, emoji }) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.chip, 
                  priority === level && styles.chipSelected,
                  !canCreateReminders && styles.disabledChip
                ]}
                onPress={() => canCreateReminders && setPriority(level)}
                disabled={!canCreateReminders}
              >
                <Text style={priority === level ? styles.chipTextSelected : styles.chipText}>
                  {emoji} {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.label}>Requires Confirmation</Text>
            <Switch 
              value={confirmRequired} 
              onValueChange={setConfirmRequired}
              disabled={!canCreateReminders}
            />
          </View>
        </View>
        
        {/* Create Button */}
        <TouchableOpacity 
          style={[styles.addButton, (!canCreateReminders || !selectedElderlyMember) && styles.disabledButton]} 
          onPress={handleAdd}
          disabled={!canCreateReminders || !selectedElderlyMember}
        >
          <Text style={styles.addButtonText}>
            {canCreateReminders 
              ? (selectedElderlyMember ? '➕ Create Reminder' : '⚠️ Select Elderly Member') 
              : `⚠️ Need "member" or "admin" role (Current: ${currentUserMemberRole})`
            }
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginVertical: 20,
    color: '#2c3e50'
  },
  statusInfo: {
    margin: 15,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1
  },
  successInfo: {
    backgroundColor: '#d4edda',
    borderColor: '#27ae60'
  },
  warningInfo: {
    backgroundColor: '#fff3cd',
    borderColor: '#f39c12'
  },
  statusText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 2
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 5
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fafafa'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  label: { 
    fontWeight: '600', 
    marginBottom: 8, 
    fontSize: 16,
    color: '#2c3e50'
  },
  pickerButton: { 
    padding: 15, 
    backgroundColor: '#ecf0f1', 
    borderRadius: 8, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#bdc3c7'
  },
  pickerText: { 
    fontSize: 16,
    color: '#2c3e50'
  },
  row: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 15 
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  chip: { 
    backgroundColor: '#ecf0f1', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 8, 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#bdc3c7'
  },
  chipSelected: { 
    backgroundColor: '#3498db',
    borderColor: '#2980b9'
  },
  disabledChip: {
    backgroundColor: '#f8f9fa',
    opacity: 0.6
  },
  chipText: { 
    color: '#2c3e50',
    fontWeight: '500'
  },
  chipTextSelected: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  memberChip: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#3498db',
    alignItems: 'center'
  },
  memberChipSelected: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9'
  },
  memberChipText: {
    color: '#2980b9',
    fontWeight: '600',
    fontSize: 14
  },
  memberChipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  roleText: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2
  },
  roleTextNormal: {
    color: '#7f8c8d'
  },
  roleTextSelected: {
    color: '#ecf0f1'
  },
  addButton: {
    backgroundColor: '#27ae60',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
    shadowOpacity: 0.1
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});
