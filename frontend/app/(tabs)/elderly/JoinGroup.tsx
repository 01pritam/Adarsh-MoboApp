import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function JoinGroupScreen() {
  const [storedGroupId, setStoredGroupId] = useState<string | null>(null);
  const [groupIdInput, setGroupIdInput] = useState('');
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load stored groupId on mount
  useEffect(() => {
    AsyncStorage.getItem('groupId')
      .then(id => {
        console.log('Stored groupId:', id);
        setStoredGroupId(id);
      })
      .catch(e => console.error('AsyncStorage error:', e));
  }, []);

  // Fetch group info automatically if storedGroupId exists
  useEffect(() => {
    if (storedGroupId) fetchGroupInfo(storedGroupId);
  }, [storedGroupId]);

  // Fetch group details by ID
  const fetchGroupInfo = async (id: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(
        `https://elderlybackend.onrender.com/api/group/info/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setGroup(data.group);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch group info');
    } finally {
      setLoading(false);
    }
  };

  // Join group by entered ID
  const joinGroup = async () => {
    if (!groupIdInput.trim()) {
      Alert.alert('Validation Error', 'Group ID is required');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(
        'https://elderlybackend.onrender.com/api/group/join',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ groupId: groupIdInput.trim() })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await AsyncStorage.setItem('groupId', groupIdInput.trim());
      setStoredGroupId(groupIdInput.trim());
      setGroupIdInput('');
      Alert.alert('Success', 'Joined group successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Join failed');
    } finally {
      setLoading(false);
    }
  };

  // Render a single member item
  const renderMember = ({ item }: { item: any }) => (
    <View style={styles.memberCard}>
      <View>
        <Text style={styles.memberName}>{item.userId.name}</Text>
        <Text style={styles.memberRole}>{item.role}</Text>
      </View>
      <Text style={styles.memberEmail}>{item.userId.email}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If group data exists, display group info and members
  if (group) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.groupTitle}>{group.name}</Text>
        <Text style={styles.groupDesc}>{group.description}</Text>
        <View style={styles.settingsBox}>
          <Text style={styles.settingsTitle}>Group Settings:</Text>
          <Text>Allow Member Invite: {group.settings?.allowMemberInvite ? 'Yes' : 'No'}</Text>
          <Text>Require Approval: {group.settings?.requireApproval ? 'Yes' : 'No'}</Text>
          <Text>Max Members: {group.settings?.maxMembers ?? 'N/A'}</Text>
        </View>
        <Text style={styles.section}>Members ({group.members.length})</Text>
        <FlatList
          data={group.members}
          keyExtractor={item => item._id}
          renderItem={renderMember}
        />
      </SafeAreaView>
    );
  }

  // Otherwise, show the join form
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Join a Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Group ID"
        value={groupIdInput}
        onChangeText={setGroupIdInput}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={joinGroup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Join Group</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'FFFDDD'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 16
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  groupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4
  },
  groupDesc: {
    fontSize: 14,
    color: '#6C6C70',
    textAlign: 'center',
    marginBottom: 12
  },
  settingsBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 1
  },
  settingsTitle: {
    fontWeight: 'bold',
    marginBottom: 4
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2
  },
  memberName: {
    fontSize: 16
  },
  memberRole: {
    fontSize: 14,
    color: '#666'
  },
  memberEmail: {
    fontSize: 12,
    color: '#888'
  }
});
