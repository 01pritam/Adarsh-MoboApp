
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const FamilyTaskCard = ({ task, onPress, onAccept, onDone }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'in_progress': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'medium': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  return (
    <TouchableOpacity style={styles.familyCard} onPress={() => onPress(task)}>
      <View style={styles.cardHeader}>
        <Text style={styles.familyTitle}>{task.title}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
          <Text style={styles.priorityText}>{task.priority?.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.familyDescription}>{task.description}</Text>
      
      <View style={styles.requestInfo}>
        <Text style={styles.requesterName}>👤 Requested by: {task.createdByName}</Text>
        <Text style={styles.groupName}>📁 {task.groupName}</Text>
      </View>
      
      <View style={styles.assignmentStatus}>
        {task.assignedToName ? (
          <Text style={styles.assignedText}>✅ Assigned to: {task.assignedToName}</Text>
        ) : (
          <Text style={styles.unassignedText}>❓ Nobody assigned yet</Text>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={styles.statusText}>{task.status?.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.familyButtonContainer}>
        {task.status === 'pending' && !task.assignedToName && (
          <TouchableOpacity 
            style={styles.acceptButton} 
            onPress={(e) => {
              e.stopPropagation();
              onAccept(task.id);
            }}
          >
            <Text style={styles.buttonText}>✅ I'll Help</Text>
          </TouchableOpacity>
        )}
        
        {(task.status === 'in_progress' || (task.status === 'pending' && task.assignedToName)) && (
          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={(e) => {
              e.stopPropagation();
              onDone(task.id);
            }}
          >
            <Text style={styles.buttonText}>✔️ Mark Done</Text>
          </TouchableOpacity>
        )}
        
        {task.status === 'completed' && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>🎉 Completed</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.familyTimestamp}>
        Requested: {new Date(task.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

const FamilyTaskDetailModal = ({ task, visible, onClose, groupMembers, membershipError }) => {
  if (!task) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.familyModalHeader}>
          <Text style={styles.familyModalTitle}>Help Request Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.familyDetailSection}>
            <Text style={styles.familyDetailLabel}>What they need:</Text>
            <Text style={styles.familyDetailValue}>{task.title}</Text>
          </View>
          
          <View style={styles.familyDetailSection}>
            <Text style={styles.familyDetailLabel}>Details:</Text>
            <Text style={styles.familyDetailValue}>{task.description}</Text>
          </View>
          
          <View style={styles.familyDetailSection}>
            <Text style={styles.familyDetailLabel}>Requested by:</Text>
            <Text style={styles.familyDetailValue}>👤 {task.createdByName}</Text>
          </View>
          
          <View style={styles.familyDetailSection}>
            <Text style={styles.familyDetailLabel}>Current Status:</Text>
            <Text style={[styles.familyDetailValue, { 
              color: task.status === 'completed' ? '#4caf50' : 
                     task.status === 'in_progress' ? '#2196f3' : '#ff9800',
              fontWeight: 'bold'
            }]}>
              {task.status === 'pending' ? '⏳ Waiting for help' :
               task.status === 'in_progress' ? '🔄 Being handled' :
               task.status === 'completed' ? '✅ Completed' : task.status}
            </Text>
          </View>
          
          <View style={styles.familyDetailSection}>
            <Text style={styles.familyDetailLabel}>Assignment:</Text>
            {task.assignedToName ? (
              <Text style={styles.familyDetailValue}>✅ {task.assignedToName} is helping</Text>
            ) : (
              <Text style={[styles.familyDetailValue, { color: '#ff9800' }]}>❓ Nobody assigned yet</Text>
            )}
          </View>
          
          <View style={styles.familyDetailSection}>
            <Text style={styles.familyDetailLabel}>Priority Level:</Text>
            <Text style={[styles.familyDetailValue, { 
              color: task.priority === 'urgent' ? '#f44336' : 
                     task.priority === 'high' ? '#ff9800' : '#2196f3',
              fontWeight: 'bold'
            }]}>
              {task.priority?.toUpperCase()}
            </Text>
          </View>
          
          {/* Enhanced group members section with error handling */}
          <View style={styles.familyDetailSection}>
            <Text style={styles.familyDetailLabel}>Family Group Members:</Text>
            {membershipError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {membershipError}</Text>
                <Text style={styles.errorSubtext}>
                  You may not be a member of this group or don't have permission to view members.
                </Text>
              </View>
            ) : groupMembers && groupMembers.length > 0 ? (
              groupMembers.map((member, index) => (
                <View key={index} style={styles.familyMemberCard}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>👤 {member.name}</Text>
                    {member.email && (
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    )}
                    {member.phoneNumber && (
                      <Text style={styles.memberPhone}>{member.phoneNumber}</Text>
                    )}
                  </View>
                  <View style={styles.memberRoles}>
                    <Text style={styles.memberRole}>({member.role})</Text>
                    {member.userRole && (
                      <Text style={styles.memberUserRole}>{member.userRole}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noMembersText}>Loading family members...</Text>
            )}
          </View>
          
          <View style={styles.familyDetailSection}>
            <Text style={styles.familyDetailLabel}>Requested on:</Text>
            <Text style={styles.familyDetailValue}>
              {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString()}
            </Text>
          </View>
          
          {task.completedAt && (
            <View style={styles.familyDetailSection}>
              <Text style={styles.familyDetailLabel}>Completed on:</Text>
              <Text style={styles.familyDetailValue}>
                {new Date(task.completedAt).toLocaleDateString()} at {new Date(task.completedAt).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const FamilyTaskScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [membershipError, setMembershipError] = useState(null);

  const API_BASE_URL = 'https://elderlybackend.onrender.com/api';
  
  // 🔒 Hardcoded token for development
  const HARDCODED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODRmYzE2ZjY2MDUzM2E3MTdmZjE4MmMiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZTEuY29tIiwicm9sZSI6ImZhbWlseV9tZW1iZXIiLCJpYXQiOjE3NTAwOTA5NTUsImV4cCI6MTc1MDY5NTc1NX0.Sn8qPU4N-ApoQCEMKS_OdhZU4ERMNHvH3J50A6m4KuU';
  const HARDCODED_USER_ID = '684fb4d25f0d8a5cdf61f781';

  const getToken = async () => {
    try {
      console.log('🔑 Getting hardcoded token...');
      return HARDCODED_TOKEN;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const fetchTasks = async () => {
    console.log('🚀 === STARTING FETCH FAMILY TASKS ===');
    setLoading(true);
    
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      console.log('🌐 Fetching tasks from:', `${API_BASE_URL}/task`);
      
      // ✅ FIXED: Use /task endpoint (not /tasks)
      const response = await fetch(`${API_BASE_URL}/task`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        
        if (response.status === 404) {
          Alert.alert('Error', 'Tasks endpoint not found. Please check your backend.');
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('✅ Raw response:', responseText.substring(0, 200) + '...');

      let json;
      try {
        json = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        Alert.alert('Error', 'Invalid response from server');
        return;
      }

      console.log('✅ Parsed response success:', json.success);

      if (json.success) {
        if (!json.data || !json.data.tasks || !Array.isArray(json.data.tasks)) {
          console.log('❌ Invalid data structure:', json.data);
          Alert.alert('Error', 'Invalid data structure from server');
          return;
        }

        const mappedTasks = json.data.tasks.map(task => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          taskType: task.taskType,
          groupName: task.groupId?.name || 'Unknown Group',
          groupId: task.groupId?._id,
          assignedToName: task.assignedTo?.name || null,
          assignedToId: task.assignedTo?._id || null,
          createdByName: task.userId?.name || 'Unknown',
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          completedAt: task.completedAt
        }));

        console.log('✅ Mapped family tasks count:', mappedTasks.length);
        setTasks(mappedTasks);
      } else {
        console.log('❌ API returned success: false:', json.message);
        Alert.alert('Error', json.message || 'Failed to load family requests');
      }
    } catch (error) {
      console.error('❌ Fetch family tasks error:', error);
      Alert.alert('Error', 'Failed to fetch family requests. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    console.log('👥 === FETCHING GROUP MEMBERS (FAMILY) ===');
    console.log('👥 Group ID:', groupId);
    
    try {
      const token = await getToken();
      if (!token) {
        console.log('❌ No token available for group members request');
        return;
      }

      const url = `${API_BASE_URL}/groups/${groupId}/members`;
      console.log('👥 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('👥 Response status:', response.status);
      console.log('👥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('👥 Error response:', errorText);
        
        if (response.status === 403) {
          console.log('👥 Access denied - user not a group member');
          setMembershipError('Only group members can view member list');
          return;
        } else if (response.status === 404) {
          console.log('👥 Group not found');
          setMembershipError('Group not found');
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('👥 Raw response body:', responseText);

      let json;
      try {
        json = JSON.parse(responseText);
      } catch (parseError) {
        console.log('👥 JSON parse error:', parseError);
        setMembershipError('Invalid response from server');
        return;
      }

      console.log('👥 Parsed response:', json);
      
      if (json.success) {
        console.log('👥 Group members fetched successfully');
        setMembershipError(null); // Clear any previous errors
        
        if (json.data && json.data.group && json.data.group.members) {
          const members = json.data.group.members.map((member) => ({
            id: member.userId._id,
            name: member.userId.name,
            email: member.userId.email,
            role: member.role, // Group role (admin, member, etc.)
            userRole: member.userId.role, // System role (elderly, caregiver, etc.)
            phoneNumber: member.userId.phoneNumber,
            joinedAt: member.joinedAt,
            addedBy: member.addedBy?.name || 'Unknown'
          }));
          
          console.log('👥 Mapped members:', members);
          setGroupMembers(members);
        } else {
          console.log('👥 No members found in response');
          setGroupMembers([]);
        }
      } else {
        console.log('👥 Failed to fetch group members:', json.message);
        setMembershipError(json.message || 'Failed to fetch group members');
        setGroupMembers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching group members:', error);
      setMembershipError('Network error while fetching members');
      setGroupMembers([]);
    }
  };

  const handleTaskPress = async (task) => {
    console.log('📱 Family task pressed:', task.title);
    setSelectedTask(task);
    setMembershipError(null); // Reset error state
    if (task.groupId) {
      await fetchGroupMembers(task.groupId);
    }
    setModalVisible(true);
  };

  // ✅ FIXED: Updated endpoint and removed body with assignedTo
  const handleAccept = async (taskId) => {
    console.log('✅ Accepting task:', taskId);
    
    try {
      const token = await getToken();
      
      // ✅ FIXED: Changed from /tasks/${taskId}/assign to /task/${taskId}/assign
      // ✅ FIXED: Removed body with assignedTo - JWT extracts user automatically
      const response = await fetch(`${API_BASE_URL}/task/${taskId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
        // ✅ No body needed - user ID extracted from JWT token
      });

      console.log('✅ Accept response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Accept error response:', errorText);
        
        // Parse error response for better user feedback
        let errorMessage = 'Failed to accept task';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          // Use default message if JSON parsing fails
        }
        
        Alert.alert('Error', errorMessage);
        return;
      }
      
      const json = await response.json();
      console.log('✅ Accept response:', json);
      
      if (json.success) {
        Alert.alert('Great!', 'You are now assigned to help with this request');
        fetchTasks(); // Refresh the task list
      } else {
        Alert.alert('Error', json.message || 'Failed to accept task');
      }
    } catch (error) {
      console.error('❌ Accept task error:', error);
      Alert.alert('Error', 'Failed to accept task. Please check your connection.');
    }
  };

  // ✅ FIXED: Updated endpoint path
  const handleDone = async (taskId) => {
    Alert.alert(
      'Mark as Completed',
      'Are you sure this help request has been completed?',
      [
        { text: 'Not Yet', style: 'cancel' },
        { 
          text: 'Yes, Done!', 
          onPress: async () => {
            console.log('✔️ Marking task as done:', taskId);
            
            try {
              const token = await getToken();
              
              // ✅ FIXED: Changed from /tasks/${taskId}/status to /task/${taskId}/status
              const response = await fetch(`${API_BASE_URL}/task/${taskId}/status`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'completed' })
              });

              console.log('✔️ Done response status:', response.status);
              
              if (!response.ok) {
                const errorText = await response.text();
                console.log('❌ Done error response:', errorText);
                
                // Parse error response for better user feedback
                let errorMessage = 'Failed to update status';
                try {
                  const errorJson = JSON.parse(errorText);
                  errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                  // Use default message if JSON parsing fails
                }
                
                Alert.alert('Error', errorMessage);
                return;
              }
              
              const json = await response.json();
              console.log('✔️ Done response:', json);
              
              if (json.success) {
                Alert.alert('Excellent!', 'Request marked as completed');
                fetchTasks(); // Refresh the task list
              } else {
                Alert.alert('Error', json.message || 'Failed to update status');
              }
            } catch (error) {
              console.error('❌ Mark done error:', error);
              Alert.alert('Error', 'Failed to update status. Please check your connection.');
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    console.log('🔄 Refreshing family tasks...');
    setRefreshing(true);
    fetchTasks();
  };

  useEffect(() => {
    console.log('🎯 Family component mounted, fetching initial tasks...');
    fetchTasks();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.familyLoadingText}>Loading family requests...</Text>
      </View>
    );
  }




  return (
    <View style={styles.container}>
      <View style={styles.familyHeader}>
        <Text style={styles.familyHeaderTitle}>Family Help Requests</Text>
        <Text style={styles.familyTaskCount}>{tasks.length} requests</Text>
      </View>
      
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <FamilyTaskCard 
            task={item} 
            onPress={handleTaskPress}
            onAccept={handleAccept} 
            onDone={handleDone} 
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.familyEmptyContainer}>
            <Text style={styles.familyEmptyText}>📋 No help requests</Text>
            <Text style={styles.familyEmptySubtext}>Your family members haven't requested help yet</Text>
          </View>
        )}
      />
      
      <FamilyTaskDetailModal
        task={selectedTask}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        groupMembers={groupMembers}
        membershipError={membershipError}
      />
      

    </View>
  );
};

const familyStyles = StyleSheet.create({
  familyHeader: {
    backgroundColor: '#2196f3',
    padding: 25,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  familyHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center'
  },
  familyTaskCount: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9
  },
  familyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3'
  },
  familyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10
  },
  familyDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    lineHeight: 24
  },
  requestInfo: {
    marginBottom: 15
  },
  requesterName: {
    fontSize: 14,
    color: '#2196f3',
    fontWeight: 'bold',
    marginBottom: 5
  },
  assignmentStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  assignedText: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
    flex: 1
  },
  unassignedText: {
    fontSize: 14,
    color: '#ff9800',
    fontWeight: 'bold',
    flex: 1
  },
  familyButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10
  },
  acceptButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 10
  },
  doneButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  familyTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right'
  },
  familyLoadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#666'
  },
  familyEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  familyEmptyText: {
    fontSize: 22,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center'
  },
  familyEmptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40
  },
  familyModalHeader: {
    backgroundColor: '#2196f3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    paddingTop: 60
  },
  familyModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white'
  },
  familyDetailSection: {
    marginBottom: 25
  },
  familyDetailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3',
    marginBottom: 8
  },
  familyDetailValue: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26
  },
  familyMemberCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

// Merge styles
const styles = { ...familyStyles, ...StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  listContainer: {
    padding: 20,
    paddingBottom: 30
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    minWidth: 70
  },
  priorityText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  completedContainer: {
    backgroundColor: '#e8f5e8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  completedText: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 14
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold'
  },
  modalContent: {
    flex: 1,
    padding: 25
  },
  memberInfo: {
    flex: 1
  },
  memberName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  memberEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  memberPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  memberRoles: {
    alignItems: 'flex-end'
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize'
  },
  memberUserRole: {
    fontSize: 12,
    color: '#2196f3',
    textTransform: 'capitalize',
    marginTop: 2
  },
  groupName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  noMembersText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic'
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336'
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: 'bold',
    marginBottom: 5
  },
  errorSubtext: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18
  }
})};

export default FamilyTaskScreen;

