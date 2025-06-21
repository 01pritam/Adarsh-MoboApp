import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ApiService from '../../utils/apiServices';
import { orderHistory } from '../../data/dummyData';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState(orderHistory.slice(0, 3));
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // ✅ Family Money Transfer State
  const [showFamilyTransferModal, setShowFamilyTransferModal] = useState(false);
  const [elderlyFamilyMembers, setElderlyFamilyMembers] = useState([]);
  const [selectedElderly, setSelectedElderly] = useState(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [loadingElderlyMembers, setLoadingElderlyMembers] = useState(false);

  // ✅ Add Money to Own Wallet State
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [addMoneyLoading, setAddMoneyLoading] = useState(false);

  // ✅ NEW: Medical Information State
  const [medicalInfo, setMedicalInfo] = useState({
    allergies: ['Penicillin', 'Shellfish', 'Peanuts'],
    chronicDiseases: ['Diabetes Type 2', 'Hypertension', 'Arthritis'],
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { name: 'Ibuprofen', dosage: '200mg', frequency: 'As needed' }
    ],
    bloodType: 'O+',
    emergencyContacts: [
      { name: 'Dr. Sarah Johnson', relation: 'Primary Doctor', phone: '+91 9876543210' },
      { name: 'Priya Sharma', relation: 'Daughter', phone: '+91 9876543211' },
      { name: 'Raj Patel', relation: 'Son', phone: '+91 9876543212' }
    ],
    insuranceInfo: {
      provider: 'Health Insurance Corp',
      policyNumber: 'HIC123456789',
      groupNumber: 'GRP001'
    },
    vitals: {
      lastCheckup: '2024-12-15',
      bloodPressure: '130/80',
      heartRate: '72 bpm',
      weight: '70 kg',
      height: '5\'8"'
    }
  });

  // ✅ NEW: Modal states for medical info
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);

  useEffect(() => {
    console.log('🚀 ProfileScreen mounted, loading data...');
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    console.log('🔄 Starting loadProfileData...');
    
    try {
      setLoading(true);
      setApiError(null);
      
      console.log('📋 Loading profile and wallet data...');
      
      const [profileResponse, walletResponse] = await Promise.all([
        ApiService.getProfile().catch(error => {
          console.error('📋 Profile API failed:', error);
          return { 
            success: false, 
            error: error.message,
            errorType: error.name
          };
        }),
        ApiService.getWallet().catch(error => {
          console.error('💳 Wallet API failed:', error);
          return { 
            success: false, 
            error: error.message,
            errorType: error.name
          };
        })
      ]);

      console.log('📋 Profile response received:', {
        success: profileResponse.success,
        hasData: !!profileResponse.data,
        error: profileResponse.error
      });
      
      console.log('💳 Wallet response received:', {
        success: walletResponse.success,
        hasData: !!walletResponse.data,
        error: walletResponse.error
      });

      if (profileResponse.success && profileResponse.data) {
        const apiUser = profileResponse.data.user;
        const apiProfile = profileResponse.data.profile;
        
        const mappedUser = {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          phone: apiUser.phoneNumber,
          role: apiUser.role,
          profilePicture: apiProfile.personalInfo?.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          wallet: {
            balance: apiProfile.wallet?.balance || 0,
            currency: apiProfile.wallet?.currency || 'INR'
          },
          address: {
            street: apiProfile.address?.street || 'Not provided',
            city: apiProfile.address?.city || 'Not provided',
            state: apiProfile.address?.state || 'Not provided'
          },
          preferences: {
            language: apiProfile.languagePreferences?.primary || 'English',
            fontSize: apiProfile.appPreferences?.accessibility?.fontSize || 'Medium',
            notifications: apiProfile.appPreferences?.notifications?.push || true
          }
        };
        
        setUser(mappedUser);
        console.log('✅ User data set successfully:', mappedUser.name, 'Role:', mappedUser.role);
      } else {
        console.warn('⚠️ Profile API failed, using fallback data');
        setApiError(`Profile load failed: ${profileResponse.error}`);
        
        const fallbackUser = {
          id: '685423370174485af6625655',
          name: 'Jhonny bhai',
          email: 'jhon111@example.com',
          phone: '+91 9876543210',
          role: 'elderly',
          profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          wallet: { balance: 0, currency: 'INR' },
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY'
          },
          preferences: {
            language: 'English',
            fontSize: 'Medium',
            notifications: true
          }
        };
        setUser(fallbackUser);
        console.log('🔄 Using fallback data for:', fallbackUser.name);
      }

      if (walletResponse.success && walletResponse.data) {
        setWalletData(walletResponse.data);
        console.log('✅ Wallet data set successfully');
      }

    } catch (error) {
      console.error('💥 Critical error in loadProfileData:', error);
      setApiError(`Critical error: ${error.message}`);
      
      const fallbackUser = {
        id: '685423370174485af6625655',
        name: 'Jhonny bhai',
        email: 'jhon111@example.com',
        phone: '+91 9876543210',
        role: 'elderly',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        wallet: { balance: 0, currency: 'INR' },
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY'
        },
        preferences: {
          language: 'English',
          fontSize: 'Medium',
          notifications: true
        }
      };
      setUser(fallbackUser);
      console.log('🆘 Using emergency fallback data');
    } finally {     
      setLoading(false);
      console.log('🏁 loadProfileData completed');
    }
  };

  // ✅ NEW: Medical Information Modal Component
  const renderMedicalInfoModal = () => (
    <Modal
      visible={showMedicalModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowMedicalModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">Medical Information</Text>
            <TouchableOpacity onPress={() => setShowMedicalModal(false)}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Blood Type */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-red-600 mb-2">🩸 Blood Type</Text>
              <View className="bg-red-50 p-4 rounded-xl">
                <Text className="text-red-800 text-xl font-bold">{medicalInfo.bloodType}</Text>
              </View>
            </View>

            {/* Allergies */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-orange-600 mb-2">⚠️ Allergies</Text>
              <View className="bg-orange-50 p-4 rounded-xl">
                {medicalInfo.allergies.map((allergy, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <Text className="text-orange-800 text-lg">• {allergy}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Chronic Diseases */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-purple-600 mb-2">🏥 Chronic Conditions</Text>
              <View className="bg-purple-50 p-4 rounded-xl">
                {medicalInfo.chronicDiseases.map((disease, index) => (
                  <View key={index} className="flex-row items-center mb-2">
                    <Text className="text-purple-800 text-lg">• {disease}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Current Medications */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-blue-600 mb-2">💊 Current Medications</Text>
              <View className="bg-blue-50 p-4 rounded-xl">
                {medicalInfo.medications.map((med, index) => (
                  <View key={index} className="mb-3 p-3 bg-white rounded-lg">
                    <Text className="text-blue-800 font-semibold text-lg">{med.name}</Text>
                    <Text className="text-blue-600">Dosage: {med.dosage}</Text>
                    <Text className="text-blue-600">Frequency: {med.frequency}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Insurance Information */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-green-600 mb-2">🛡️ Insurance Information</Text>
              <View className="bg-green-50 p-4 rounded-xl">
                <Text className="text-green-800 font-semibold">Provider: {medicalInfo.insuranceInfo.provider}</Text>
                <Text className="text-green-800">Policy: {medicalInfo.insuranceInfo.policyNumber}</Text>
                <Text className="text-green-800">Group: {medicalInfo.insuranceInfo.groupNumber}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ✅ NEW: Emergency Contacts Modal Component
  const renderEmergencyContactsModal = () => (
    <Modal
      visible={showEmergencyModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowEmergencyModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">Emergency Contacts</Text>
            <TouchableOpacity onPress={() => setShowEmergencyModal(false)}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {medicalInfo.emergencyContacts.map((contact, index) => (
              <View key={index} className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-red-800">{contact.name}</Text>
                    <Text className="text-red-600 font-semibold">{contact.relation}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => {
                      console.log('📞 Calling emergency contact:', contact.phone);
                      // Add actual calling functionality here
                      Alert.alert('Calling', `Calling ${contact.name} at ${contact.phone}`);
                    }}
                    className="bg-red-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold">📞 Call</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-red-700 text-lg font-mono">{contact.phone}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ✅ NEW: Vitals Information Modal Component
  const renderVitalsModal = () => (
    <Modal
      visible={showVitalsModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowVitalsModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">Health Vitals</Text>
            <TouchableOpacity onPress={() => setShowVitalsModal(false)}>
              <Text className="text-2xl text-gray-500">×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-4">
              <Text className="text-lg font-semibold text-blue-600 mb-3">📅 Last Checkup: {medicalInfo.vitals.lastCheckup}</Text>
            </View>

            {/* Vital Signs Grid */}
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[48%] mb-4 p-4 bg-blue-50 rounded-xl">
                <Text className="text-blue-800 font-semibold text-center">🩺 Blood Pressure</Text>
                <Text className="text-blue-900 text-xl font-bold text-center">{medicalInfo.vitals.bloodPressure}</Text>
              </View>
              
              <View className="w-[48%] mb-4 p-4 bg-red-50 rounded-xl">
                <Text className="text-red-800 font-semibold text-center">❤️ Heart Rate</Text>
                <Text className="text-red-900 text-xl font-bold text-center">{medicalInfo.vitals.heartRate}</Text>
              </View>
              
              <View className="w-[48%] mb-4 p-4 bg-green-50 rounded-xl">
                <Text className="text-green-800 font-semibold text-center">⚖️ Weight</Text>
                <Text className="text-green-900 text-xl font-bold text-center">{medicalInfo.vitals.weight}</Text>
              </View>
              
              <View className="w-[48%] mb-4 p-4 bg-purple-50 rounded-xl">
                <Text className="text-purple-800 font-semibold text-center">📏 Height</Text>
                <Text className="text-purple-900 text-xl font-bold text-center">{medicalInfo.vitals.height}</Text>
              </View>
            </View>

            <TouchableOpacity className="bg-blue-500 p-4 rounded-xl mt-4">
              <Text className="text-white text-center font-semibold">📊 View Detailed Health Report</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Keep all your existing functions (processAddMoney, processFamilyTransfer, etc.)
  const processAddMoney = async () => {
    console.log('💰 Processing add money to own wallet:', addMoneyAmount);
    
    if (!addMoneyAmount || isNaN(addMoneyAmount) || parseFloat(addMoneyAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    setAddMoneyLoading(true);
    
    try {
      const response = await ApiService.addMoney(
        parseFloat(addMoneyAmount),
        'bank_transfer'
      );
      
      console.log('📥 Add money response:', response);
      
      if (response && response.success) {
        console.log('✅ Money added to own wallet successfully:', response.data);
        
        setShowAddMoneyModal(false);
        setAddMoneyAmount('');
        
        setUser(prevUser => ({
          ...prevUser,
          wallet: {
            ...prevUser.wallet,
            balance: response.data.newBalance
          }
        }));
        
        Alert.alert(
          'Money Added Successfully!', 
          `₹${addMoneyAmount} has been added to your wallet.\n\nNew balance: ₹${response.data.newBalance}`,
          [{ text: 'OK' }]
        );
        
        loadProfileData();
        
      } else {
        console.error('❌ Add money failed:', response);
        Alert.alert('Error', response?.message || 'Failed to add money');
      }
    } catch (error) {
      console.error('💥 Add money error:', error);
      Alert.alert('Error', `Failed to add money: ${error.message}`);
    } finally {
      setAddMoneyLoading(false);
    }
  };

  const loadElderlyFamilyMembers = async () => {
    console.log('👴 Loading elderly family members...');
    setLoadingElderlyMembers(true);
    
    try {
      const response = await ApiService.getElderlyFamilyMembers();
      
      if (response.success && response.data?.elderlyMembers) {
        setElderlyFamilyMembers(response.data.elderlyMembers);
        console.log('✅ Elderly family members loaded:', response.data.elderlyMembers.length);
      } else {
        console.warn('⚠️ No elderly family members found');
        setElderlyFamilyMembers([]);
      }
    } catch (error) {
      console.error('💥 Error loading elderly family members:', error);
      Alert.alert('Error', 'Failed to load family members');
      setElderlyFamilyMembers([]);
    } finally {
      setLoadingElderlyMembers(false);
    }
  };

  const processFamilyTransfer = async () => {
    console.log('💸 Processing family transfer:', {
      selectedElderly: selectedElderly?.name,
      amount: transferAmount,
      note: transferNote,
      currentBalance: user.wallet.balance
    });
    
    if (!selectedElderly) {
      Alert.alert('Error', 'Please select a family member');
      return;
    }
    
    if (!transferAmount || isNaN(transferAmount) || parseFloat(transferAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const transferAmountNum = parseFloat(transferAmount);
    if (transferAmountNum > user.wallet.balance) {
      Alert.alert(
        'Insufficient Balance', 
        `You need ₹${transferAmountNum} but only have ₹${user.wallet.balance} in your wallet.\n\nPlease add money to your wallet first.`,
        [
          { text: 'Cancel' },
          { 
            text: 'Add Money', 
            onPress: () => {
              setShowFamilyTransferModal(false);
              setShowAddMoneyModal(true);
            }
          }
        ]
      );
      return;
    }
    
    setTransferLoading(true);
    
    try {
      const response = await ApiService.addMoneyToElderlyWallet(
        selectedElderly.id,
        transferAmountNum,
        'bank_transfer',
        transferNote
      );
      
      console.log('📥 Family transfer response:', response);
      
      if (response && response.success) {
        console.log('✅ Money transferred successfully:', response.data);
        
        setShowFamilyTransferModal(false);
        setSelectedElderly(null);
        setTransferAmount('');
        setTransferNote('');
        
        setUser(prevUser => ({
          ...prevUser,
          wallet: {
            ...prevUser.wallet,
            balance: prevUser.wallet.balance - transferAmountNum
          }
        }));
        
        Alert.alert(
          'Transfer Successful!', 
          `₹${transferAmount} has been transferred to ${selectedElderly.name}'s wallet.\n\nYour new balance: ₹${user.wallet.balance - transferAmountNum}\n${selectedElderly.name}'s new balance: ₹${response.data.recipient.newBalance}`,
          [{ text: 'OK' }]
        );
        
        loadProfileData();
        
      } else {
        console.error('❌ Family transfer failed:', response);
        Alert.alert('Error', response?.message || 'Failed to transfer money');
      }
    } catch (error) {
      console.error('💥 Family transfer error:', error);
      Alert.alert('Error', `Failed to transfer money: ${error.message}`);
    } finally {
      setTransferLoading(false);
    }
  };

  const onRefresh = async () => {
    console.log('🔄 Pull to refresh triggered');
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    console.log('📝 Edit Profile pressed for user:', user?.name);
    Alert.alert('Edit Profile', 'Edit Profile feature coming soon!');
  };

  const handleMoneyOperation = () => {
    console.log('💰 Money operation pressed, user role:', user?.role);
    
    if (user?.role === 'elderly') {
      Alert.alert(
        'Add Money Restricted', 
        'As an elderly user, only your family members can add money to your wallet for security reasons.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Wallet Operations',
        'What would you like to do?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Money to My Wallet', 
            onPress: () => setShowAddMoneyModal(true)
          },
          { 
            text: 'Send Money to Family', 
            onPress: () => {
              setShowFamilyTransferModal(true);
              loadElderlyFamilyMembers();
            }
          }
        ]
      );
    }
  };

  const handleViewAllOrders = () => {
    console.log('📦 View All Orders pressed');
    navigation.navigate('orders');
  };

  const handleWalletPress = () => {
    console.log('💳 Wallet pressed');
    Alert.alert('Wallet', 'Wallet details feature coming soon!');
  };

  const handleRetry = () => {
    console.log('🔄 Retry button pressed');
    setApiError(null);
    loadProfileData();
  };

  // Keep your existing modal render functions (renderAddMoneyModal, renderFamilyTransferModal)
  const renderAddMoneyModal = () => (
    <Modal
      visible={showAddMoneyModal}
      transparent
      animationType="slide"
      onRequestClose={() => {
        console.log('❌ Add money modal closed');
        setShowAddMoneyModal(false);
        setAddMoneyAmount('');
      }}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Add Money to Wallet
          </Text>
          
          <View className="bg-blue-50 p-4 rounded-xl mb-4">
            <Text className="text-blue-800 text-center">
              Current Balance: ₹{user?.wallet?.balance || 0}
            </Text>
          </View>
          
          <Text className="text-gray-700 font-semibold mb-2">Amount:</Text>
          <TextInput
            placeholder="₹ 0"
            value={addMoneyAmount}
            onChangeText={(text) => {
              console.log('📝 Add money amount changed:', text);
              setAddMoneyAmount(text);
            }}
            keyboardType="numeric"
            className="bg-gray-100 p-4 rounded-xl mb-6 text-lg border border-gray-200"
            editable={!addMoneyLoading}
          />
          
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => {
                console.log('❌ Cancel add money');
                setShowAddMoneyModal(false);
                setAddMoneyAmount('');
              }}
              className="flex-1 bg-gray-200 p-4 rounded-xl"
              disabled={addMoneyLoading}
            >
              <Text className="text-gray-800 text-center font-semibold">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={processAddMoney}
              className={`flex-1 p-4 rounded-xl ${
                addMoneyLoading || !addMoneyAmount 
                  ? 'bg-gray-400' 
                  : 'bg-blue-500'
              }`}
              disabled={addMoneyLoading || !addMoneyAmount}
            >
              {addMoneyLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  Add ₹{addMoneyAmount || '0'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderFamilyTransferModal = () => (
    <Modal
      visible={showFamilyTransferModal}
      transparent
      animationType="slide"
      onRequestClose={() => {
        console.log('❌ Family transfer modal closed');
        setShowFamilyTransferModal(false);
        setSelectedElderly(null);
        setTransferAmount('');
        setTransferNote('');
      }}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Send Money to Family
          </Text>
          
          <View className="bg-blue-50 p-4 rounded-xl mb-4">
            <Text className="text-blue-800 text-center">
              Your Wallet Balance: ₹{user?.wallet?.balance || 0}
            </Text>
          </View>
          
          <Text className="text-gray-700 font-semibold mb-3">Select Family Member:</Text>
          
          {loadingElderlyMembers ? (
            <View className="bg-gray-100 p-4 rounded-xl mb-4 items-center">
              <ActivityIndicator color="#3B82F6" />
              <Text className="text-gray-600 mt-2">Loading family members...</Text>
            </View>
          ) : elderlyFamilyMembers.length === 0 ? (
            <View className="bg-gray-100 p-4 rounded-xl mb-4">
              <Text className="text-gray-600 text-center">
                No elderly family members found in your groups
              </Text>
            </View>
          ) : (
            <ScrollView className="max-h-32 mb-4" showsVerticalScrollIndicator={false}>
              {elderlyFamilyMembers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => {
                    console.log('👤 Selected elderly member:', member.name);
                    setSelectedElderly(member);
                  }}
                  className={`p-4 rounded-xl mb-2 border-2 ${
                    selectedElderly?.id === member.id 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={`font-semibold ${
                    selectedElderly?.id === member.id ? 'text-blue-700' : 'text-gray-800'
                  }`}>
                    {member.name}
                  </Text>
                  <Text className="text-gray-600 text-sm">{member.email}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          
          <Text className="text-gray-700 font-semibold mb-2">Amount:</Text>
          <TextInput
            placeholder="₹ 0"
            value={transferAmount}
            onChangeText={(text) => {
              console.log('📝 Transfer amount changed:', text);
              setTransferAmount(text);
            }}
            keyboardType="numeric"
            className="bg-gray-100 p-4 rounded-xl mb-4 text-lg border border-gray-200"
            editable={!transferLoading}
          />
          
          {transferAmount && parseFloat(transferAmount) > (user?.wallet?.balance || 0) && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-800 text-center text-sm">
                ⚠️ Insufficient balance. You need ₹{parseFloat(transferAmount) - (user?.wallet?.balance || 0)} more.
              </Text>
            </View>
          )}
          
          <Text className="text-gray-700 font-semibold mb-2">Note (Optional):</Text>
          <TextInput
            placeholder="Add a personal message..."
            value={transferNote}
            onChangeText={setTransferNote}
            className="bg-gray-100 p-4 rounded-xl mb-6 border border-gray-200"
            multiline
            numberOfLines={3}
            editable={!transferLoading}
          />
          
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => {
                console.log('❌ Cancel family transfer');
                setShowFamilyTransferModal(false);
                setSelectedElderly(null);
                setTransferAmount('');
                setTransferNote('');
              }}
              className="flex-1 bg-gray-200 p-4 rounded-xl"
              disabled={transferLoading}
            >
              <Text className="text-gray-800 text-center font-semibold">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={processFamilyTransfer}
              className={`flex-1 p-4 rounded-xl ${
                transferLoading || !selectedElderly || !transferAmount || 
                parseFloat(transferAmount) > (user?.wallet?.balance || 0)
                  ? 'bg-gray-400' 
                  : 'bg-green-500'
              }`}
              disabled={
                transferLoading || !selectedElderly || !transferAmount ||
                parseFloat(transferAmount) > (user?.wallet?.balance || 0)
              }
            >
              {transferLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold">
                  Send ₹{transferAmount || '0'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Show loading state
  if (loading && !user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-lg mb-4">Loading profile...</Text>
        {apiError && (
          <Text className="text-red-600 text-center px-4 mb-4">{apiError}</Text>
        )}
      </SafeAreaView>
    );
  }

  // Show error state with retry option
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-4">
        <Text className="text-lg text-red-600 mb-4">Failed to load profile</Text>
        {apiError && (
          <Text className="text-gray-600 text-center mb-4">{apiError}</Text>
        )}
        <TouchableOpacity 
          onPress={handleRetry}
          className="bg-blue-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Show API error banner if there are issues */}
      {apiError && (
        <View className="bg-yellow-100 px-4 py-2">
          <Text className="text-yellow-800 text-center text-sm">
            ⚠️ Using offline data: {apiError}
          </Text>
        </View>
      )}
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-5 py-6 pt-10">
          <Text className="text-3xl font-bold text-gray-800 text-center">My Profile</Text>
          <Text className="text-center text-gray-600 mt-1 capitalize">
            {user.role} Account
          </Text>
        </View>

        {/* Profile Card */}
        <View className="bg-white mx-5 rounded-2xl p-5 shadow-lg mb-5">
          <View className="flex-row items-center">
            <View className="relative">
              <Image 
                source={{ uri: user.profilePicture }} 
                className="w-20 h-20 rounded-full"
              />
              <View className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </View>
            
            <View className="flex-1 ml-4">
              <Text className="text-xl font-bold text-gray-800">{user.name}</Text>
              <Text className="text-blue-600 font-semibold capitalize">{user.role}</Text>
              <Text className="text-gray-600">{user.phone}</Text>
            </View>
            
            <TouchableOpacity 
              onPress={handleEditProfile}
              className="bg-blue-500 px-4 py-2 rounded-xl"
            >
              <Text className="text-white font-semibold">Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallet Card - Role-based functionality */}
        <TouchableOpacity 
          onPress={handleWalletPress}
          className="bg-white mx-5 rounded-2xl p-5 shadow-lg mb-5"
        >
          <View className="flex-row items-center mb-5">
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
              <Text className="text-2xl">💳</Text>
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-gray-600 mb-1">Wallet Balance</Text>
              <Text className="text-2xl font-bold text-gray-800">
                ₹{walletData?.wallet?.balance ?? user.wallet.balance}
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={handleMoneyOperation}
              className={`px-4 py-2 rounded-xl ${
                user.role === 'elderly' 
                  ? 'bg-gray-400' 
                  : 'bg-green-500'
              }`}
            >
              <Text className="text-white font-semibold">
                {user.role === 'elderly' ? '🔒 Restricted' : '💰 Wallet'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {user.role === 'elderly' && (
            <View className="bg-blue-50 p-3 rounded-lg mb-4">
              <Text className="text-blue-800 text-sm text-center">
                💡 Your family members can add money to your wallet for security
              </Text>
            </View>
          )}
          
          {user.role !== 'elderly' && (
            <View className="bg-green-50 p-3 rounded-lg mb-4">
              <Text className="text-green-800 text-sm text-center">
                💡 Add money to your wallet, then send to family members
              </Text>
            </View>
          )}
          
          <View className="flex-row justify-around pt-5 border-t border-gray-100">
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-800">₹0</Text>
              <Text className="text-xs text-gray-500">This Month</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-800">{recentOrders.length}</Text>
              <Text className="text-xs text-gray-500">Orders</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-lg font-bold text-gray-800">₹0</Text>
              <Text className="text-xs text-gray-500">Avg Order</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ✅ NEW: Medical Information Cards */}
        <View className="mx-5 mb-5">
          <Text className="text-xl font-bold text-gray-800 mb-4">🏥 Health Information</Text>
          
          {/* Medical Info Summary Card */}
          <TouchableOpacity 
            onPress={() => setShowMedicalModal(true)}
            className="bg-white rounded-2xl p-5 shadow-lg mb-4"
          >
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
                <Text className="text-2xl">🩺</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold text-gray-800">Medical Information</Text>
                <Text className="text-gray-600">Blood type, allergies, medications</Text>
              </View>
              <Text className="text-2xl">→</Text>
            </View>
            
            <View className="flex-row justify-around pt-4 border-t border-gray-100">
              <View className="items-center">
                <Text className="text-lg font-bold text-red-600">{medicalInfo.bloodType}</Text>
                <Text className="text-xs text-gray-500">Blood Type</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center">
                <Text className="text-lg font-bold text-orange-600">{medicalInfo.allergies.length}</Text>
                <Text className="text-xs text-gray-500">Allergies</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center">
                <Text className="text-lg font-bold text-blue-600">{medicalInfo.medications.length}</Text>
                <Text className="text-xs text-gray-500">Medications</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Emergency Contacts Card */}
          <TouchableOpacity 
            onPress={() => setShowEmergencyModal(true)}
            className="bg-white rounded-2xl p-5 shadow-lg mb-4"
          >
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
                <Text className="text-2xl">🚨</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold text-gray-800">Emergency Contacts</Text>
                <Text className="text-gray-600">Quick access to emergency numbers</Text>
              </View>
              <Text className="text-2xl">→</Text>
            </View>
            
            <View className="bg-red-50 p-3 rounded-lg">
              <Text className="text-red-800 text-center font-semibold">
                📞 {medicalInfo.emergencyContacts.length} Emergency Contacts Available
              </Text>
            </View>
          </TouchableOpacity>

          {/* Health Vitals Card */}
          <TouchableOpacity 
            onPress={() => setShowVitalsModal(true)}
            className="bg-white rounded-2xl p-5 shadow-lg mb-4"
          >
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                <Text className="text-2xl">📊</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-bold text-gray-800">Health Vitals</Text>
                <Text className="text-gray-600">Latest checkup results</Text>
              </View>
              <Text className="text-2xl">→</Text>
            </View>
            
            <View className="flex-row justify-around pt-4 border-t border-gray-100">
              <View className="items-center">
                <Text className="text-lg font-bold text-blue-600">{medicalInfo.vitals.bloodPressure}</Text>
                <Text className="text-xs text-gray-500">Blood Pressure</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center">
                <Text className="text-lg font-bold text-red-600">{medicalInfo.vitals.heartRate}</Text>
                <Text className="text-xs text-gray-500">Heart Rate</Text>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="items-center">
                <Text className="text-lg font-bold text-green-600">{medicalInfo.vitals.weight}</Text>
                <Text className="text-xs text-gray-500">Weight</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Keep your existing Quick Actions and Recent Orders sections here */}
        
      </ScrollView>

      {/* Add Money Modal */}
      {renderAddMoneyModal()}
      
      {/* Family Transfer Modal */}
      {renderFamilyTransferModal()}

      {/* ✅ NEW: Medical Information Modals */}
      {renderMedicalInfoModal()}
      {renderEmergencyContactsModal()}
      {renderVitalsModal()}
    </SafeAreaView>
  );
};

export default ProfileScreen;
