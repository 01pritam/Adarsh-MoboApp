import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://elderlybackend.onrender.com';

class ApiService {
  // Get auth headers
  async getAuthHeaders() {
    console.log('🔑 Getting auth headers...');
    const token = await AsyncStorage.getItem('accessToken');
    console.log('🔑 Token found:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    if (!token) {
      console.error('❌ No auth token found');
      throw new Error('No auth token');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Test connection method
  async testConnection() {
    console.log('🔍 Testing API connection...');
    try {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}/health`, {
        method: 'GET',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log('🔍 Connection test response:', {
        status: response.status,
        ok: response.ok,
        responseTime: `${responseTime}ms`,
        url: `${BASE_URL}/health`
      });
      
      if (response.ok) {
        const data = await response.json().catch(() => ({ message: 'Health check OK' }));
        return {
          success: true,
          status: response.status,
          responseTime,
          message: 'API connection successful',
          data
        };
      } else {
        return {
          success: false,
          status: response.status,
          responseTime,
          message: `API returned ${response.status}`,
          error: response.statusText
        };
      }
    } catch (error) {
      console.error('🔍 Connection test failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'API connection failed',
        details: {
          name: error.name,
          code: error.code,
          timeout: error.name === 'AbortError' || error.message.includes('timeout')
        }
      };
    }
  }

  // ✅ Profile API - Properly handles your API response format
  async getProfile() {
    console.log('📋 Starting getProfile API call...');
    const debugInfo = {
      timestamp: new Date().toISOString(),
      method: 'GET',
      endpoint: '/profile'
    };
    
    try {
      const headers = await this.getAuthHeaders();
      console.log("🔑 Auth headers prepared:", {
        hasAuth: !!headers.Authorization,
        contentType: headers['Content-Type']
      });
      
      const url = `${BASE_URL}/profile`;
      
      console.log('🌐 Making request to:', url);
      console.log('🔑 Request headers:', {
        hasAuth: headers.Authorization ? 'YES' : 'NO',
        contentType: headers['Content-Type']
      });
      
      const startTime = Date.now();
      const response = await fetch(url, { 
        method: 'GET',
        headers 
      });
      const endTime = Date.now();
      
      // ✅ DETAILED RESPONSE DEBUGGING
      console.log('📥 Raw Response Properties:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        type: response.type,
        bodyUsed: response.bodyUsed,
        hasDataProperty: 'data' in response, // This will be false
        responseKeys: Object.keys(response)
      });
      
      debugInfo.responseTime = `${endTime - startTime}ms`;
      debugInfo.status = response.status;
      debugInfo.ok = response.ok;
      
      console.log('📥 Response timing info:', debugInfo);
      
      if (!response.ok) {
        console.log('❌ Response not OK, getting error text...');
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        debugInfo.errorBody = errorText;
        
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      // ✅ EXTRACT JSON DATA - This is where your actual data comes from
      console.log('🔄 Response OK, extracting JSON data...');
      const jsonData = await response.json();
      
      // ✅ LOG YOUR ACTUAL API RESPONSE STRUCTURE
      console.log('📥 Complete API Response:', {
        success: jsonData.success,
        message: jsonData.message,
        hasData: !!jsonData.data,
        userData: jsonData.data?.user ? {
          id: jsonData.data.user.id,
          name: jsonData.data.user.name,
          email: jsonData.data.user.email,
          role: jsonData.data.user.role
        } : null,
        profileData: jsonData.data?.profile ? {
          hasPersonalInfo: !!jsonData.data.profile.personalInfo,
          hasWallet: !!jsonData.data.profile.wallet,
          walletBalance: jsonData.data.profile.wallet?.balance,
          hasAddress: !!jsonData.data.profile.address
        } : null,
        recentTransactions: jsonData.data?.recentTransactions?.length || 0
      });
      
      console.log('✅ Profile API success:', {
        success: jsonData.success,
        hasUser: !!jsonData.data?.user,
        userName: jsonData.data?.user?.name,
        hasProfile: !!jsonData.data?.profile,
        walletBalance: jsonData.data?.profile?.wallet?.balance
      });
      
      return jsonData;
    } catch (error) {
      console.error('💥 Profile API Error:', {
        ...debugInfo,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3)
        }
      });
      throw error;
    }
  }

  // ✅ Wallet API - Properly handles your API response format
  async getWallet() {
    console.log('💳 Starting getWallet API call...');
    const debugInfo = {
      timestamp: new Date().toISOString(),
      method: 'GET',
      endpoint: '/wallet'
    };
    
    try {
      const headers = await this.getAuthHeaders();
      const url = `${BASE_URL}/wallet`;
      
      console.log('🌐 Making wallet request to:', url);
      
      const startTime = Date.now();
      const response = await fetch(url, { 
        method: 'GET',
        headers 
      });
      const endTime = Date.now();
      
      debugInfo.responseTime = `${endTime - startTime}ms`;
      debugInfo.status = response.status;
      debugInfo.ok = response.ok;
      
      console.log('📥 Wallet response received:', debugInfo);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Wallet error response:', errorText);
        debugInfo.errorBody = errorText;
        
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      // ✅ EXTRACT JSON DATA PROPERLY
      const jsonData = await response.json();
      
      console.log('📥 Wallet JSON Response:', {
        success: jsonData.success,
        message: jsonData.message,
        hasWalletData: !!jsonData.data?.wallet,
        walletBalance: jsonData.data?.wallet?.balance,
        walletCurrency: jsonData.data?.wallet?.currency,
        fullWalletData: jsonData.data?.wallet
      });
      
      console.log('✅ Wallet API success:', {
        success: jsonData.success,
        hasWallet: !!jsonData.data?.wallet,
        balance: jsonData.data?.wallet?.balance
      });
      
      return jsonData;
    } catch (error) {
      console.error('💥 Wallet API Error:', {
        ...debugInfo,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n')[0]
        }
      });
      throw error;
    }
  }

  // Update profile
  async updateProfile(profileData) {
    console.log('📝 Updating profile with data:', Object.keys(profileData));
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData)
      });
      
      console.log('📝 Update profile response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update profile error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Profile updated successfully');
      return result;
    } catch (error) {
      console.error('💥 Update profile error:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getWalletBalance() {
    console.log('💰 Getting wallet balance...');
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/wallet/balance`, {
        method: 'GET',
        headers 
      });
      
      console.log('💰 Balance response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Balance error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Balance retrieved:', result.data?.balance);
      return result;
    } catch (error) {
      console.error('💥 Balance error:', error);
      throw error;
    }
  }

  // ✅ Add money to own wallet (for non-elderly users)
  async addMoney(amount, paymentMethod = 'bank_transfer') {
    console.log('🏦 ApiService.addMoney called');
    console.log('🏦 Input amount:', amount);
    console.log('🏦 Input paymentMethod:', paymentMethod);
    console.log('🏦 Amount type:', typeof amount);
    
    try {
      console.log('🔑 Getting auth headers...');
      const headers = await this.getAuthHeaders();
      console.log('🔑 Auth headers obtained:', Object.keys(headers));
      
      const url = `${BASE_URL}/transactions/add-money`;
      console.log('🌐 API URL:', url);
      console.log('🌐 BASE_URL:', BASE_URL);
      
      const payload = {
        amount,
        paymentMethod,
        gatewayTransactionId: `TXN_${Date.now()}`,
        description: `Wallet top-up of ₹${amount}`
      };
      console.log('📤 Request payload:', payload);
      
      console.log('🚀 Making fetch request...');
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Response received');
      console.log('📥 Response status:', response.status);
      console.log('📥 Response statusText:', response.statusText);
      console.log('📥 Response ok:', response.ok);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error('❌ Response not OK');
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log('📄 Parsing response as JSON...');
      const jsonData = await response.json();
      console.log('✅ JSON parsed successfully:', jsonData);
      
      return jsonData;
    } catch (error) {
      console.error('💥 ApiService.addMoney error:');
      console.error('💥 Error name:', error.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      console.error('💥 Full error:', error);
      throw error;
    }
  }

  // ✅ NEW: Family member adds money to elderly wallet
  async addMoneyToElderlyWallet(elderlyUserId, amount, paymentMethod = 'bank_transfer', senderNote = '') {
    console.log('💰 Family adding money to elderly wallet:', { elderlyUserId, amount, senderNote });
    console.log('💰 Amount type:', typeof amount);
    console.log('💰 Payment method:', paymentMethod);
    
    try {
      console.log('🔑 Getting auth headers for family transfer...');
      const headers = await this.getAuthHeaders();
      console.log('🔑 Auth headers obtained for family transfer');
      
      const url = `${BASE_URL}/transactions/add-money-to-elderly`;
      console.log('🌐 Family transfer URL:', url);
      
      const payload = {
        elderlyUserId,
        amount: parseFloat(amount), // Ensure it's a number
        paymentMethod,
        gatewayTransactionId: `FAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: `Family support - ₹${amount}`,
        senderNote: senderNote || `Money transfer from family member`
      };
      
      console.log('💰 Family transfer payload:', {
        ...payload,
        gatewayTransactionId: payload.gatewayTransactionId.substring(0, 20) + '...'
      });
      
      console.log('🚀 Making family transfer request...');
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Family transfer response received');
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('❌ Family transfer response not OK');
        const errorText = await response.text();
        console.error('❌ Family transfer error body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      console.log('📄 Parsing family transfer response...');
      const result = await response.json();
      console.log('✅ Family transfer successful:', {
        success: result.success,
        recipientName: result.data?.recipient?.name,
        newBalance: result.data?.recipient?.newBalance,
        senderName: result.data?.sender?.name
      });
      
      return result;
    } catch (error) {
      console.error('💥 Family transfer error:');
      console.error('💥 Error name:', error.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack?.split('\n').slice(0, 3));
      throw error;
    }
  }

  // ✅ NEW: Get elderly family members for money transfer
  async getElderlyFamilyMembers() {
    console.log('👴 Getting elderly family members...');
    try {
      console.log('🔑 Getting auth headers for elderly members...');
      const headers = await this.getAuthHeaders();
      
      const url = `${BASE_URL}/transactions/elderly-family-members`;
      console.log('🌐 Elderly members URL:', url);
      
      console.log('🚀 Making elderly members request...');
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      console.log('📥 Elderly members response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Elderly members error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Elderly family members retrieved:', {
        success: result.success,
        count: result.data?.elderlyMembers?.length || 0,
        members: result.data?.elderlyMembers?.map(m => m.name) || []
      });
      
      return result;
    } catch (error) {
      console.error('💥 Elderly family members error:', error);
      throw error;
    }
  }

  // Get transactions
  async getTransactions(page = 1, limit = 20) {
    console.log('📊 Getting transactions:', { page, limit });
    try {
      const headers = await this.getAuthHeaders();
      const url = `${BASE_URL}/transactions?page=${page}&limit=${limit}`;
      
      console.log('📊 Transactions URL:', url);
      
      const response = await fetch(url, { method: 'GET', headers });
      
      console.log('📊 Transactions response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Transactions error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Transactions retrieved:', result.data?.transactions?.length || 0);
      return result;
    } catch (error) {
      console.error('💥 Transactions error:', error);
      throw error;
    }
  }

  // Send money between users
  async sendMoney(recipientId, amount, description) {
    console.log('💰 Sending money:', { recipientId, amount, description });
    try {
      const headers = await this.getAuthHeaders();
      const payload = {
        recipientId,
        amount,
        description,
        category: 'family_transfer'
      };
      
      console.log('💰 Send money payload:', payload);
      
      const response = await fetch(`${BASE_URL}/transactions/send-money`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      console.log('💰 Send money response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Send money error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Money sent successfully');
      return result;
    } catch (error) {
      console.error('💥 Send money error:', error);
      throw error;
    }
  }

  // ✅ NEW: Get transaction statistics
  async getTransactionStats() {
    console.log('📈 Getting transaction stats...');
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/transactions/stats`, {
        method: 'GET',
        headers
      });
      
      console.log('📈 Transaction stats response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Transaction stats error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Transaction stats retrieved');
      return result;
    } catch (error) {
      console.error('💥 Transaction stats error:', error);
      throw error;
    }
  }

  // ✅ NEW: Get family members for transactions
  async getFamilyMembers() {
    console.log('👨‍👩‍👧‍👦 Getting family members...');
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/transactions/family-members`, {
        method: 'GET',
        headers
      });
      
      console.log('👨‍👩‍👧‍👦 Family members response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Family members error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Family members retrieved:', result.data?.familyMembers?.length || 0);
      return result;
    } catch (error) {
      console.error('💥 Family members error:', error);
      throw error;
    }
  }

  // Order APIs (Mock for now)
  async placeOrder(orderData) {
    console.log('🛒 Placing order:', orderData);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const order = {
        success: true,
        message: 'Order placed successfully',
        data: {
          orderId: `ORD${Date.now()}`,
          ...orderData,
          status: 'confirmed',
          estimatedDelivery: '30-45 mins'
        }
      };
      
      console.log('✅ Order placed:', order.data.orderId);
      return order;
    } catch (error) {
      console.error('💥 Order placement error:', error);
      throw error;
    }
  }

  async getOrders(page = 1, limit = 10) {
    console.log('📦 Getting orders:', { page, limit });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { orderHistory } = require('../data/dummyData');
      const result = {
        success: true,
        data: {
          orders: orderHistory,
          pagination: {
            currentPage: page,
            totalPages: 1,
            totalOrders: orderHistory.length
          }
        }
      };
      
      console.log('✅ Orders retrieved:', result.data.orders.length);
      return result;
    } catch (error) {
      console.error('💥 Get orders error:', error);
      throw error;
    }
  }

  // ✅ NEW: Emergency contact APIs
  async getEmergencyContacts() {
    console.log('🚨 Getting emergency contacts...');
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/profile/emergency-contacts`, {
        method: 'GET',
        headers
      });
      
      console.log('🚨 Emergency contacts response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Emergency contacts error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Emergency contacts retrieved');
      return result;
    } catch (error) {
      console.error('💥 Emergency contacts error:', error);
      throw error;
    }
  }

  async updateEmergencyContact(contactData) {
    console.log('🚨 Updating emergency contact:', contactData);
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/profile/emergency-contacts`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(contactData)
      });
      
      console.log('🚨 Update emergency contact response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update emergency contact error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Emergency contact updated successfully');
      return result;
    } catch (error) {
      console.error('💥 Update emergency contact error:', error);
      throw error;
    }
  }

  // ✅ NEW: Health info APIs
  async getHealthInfo() {
    console.log('🏥 Getting health info...');
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/profile/health`, {
        method: 'GET',
        headers
      });
      
      console.log('🏥 Health info response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Health info error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Health info retrieved');
      return result;
    } catch (error) {
      console.error('💥 Health info error:', error);
      throw error;
    }
  }

  async updateHealthInfo(healthData) {
    console.log('🏥 Updating health info:', Object.keys(healthData));
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/profile/health`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(healthData)
      });
      
      console.log('🏥 Update health info response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update health info error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Health info updated successfully');
      return result;
    } catch (error) {
      console.error('💥 Update health info error:', error);
      throw error;
    }
  }

  // ✅ NEW: Preferences APIs
  async updatePreferences(preferences) {
    console.log('⚙️ Updating preferences:', Object.keys(preferences));
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/profile/preferences`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(preferences)
      });
      
      console.log('⚙️ Update preferences response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update preferences error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Preferences updated successfully');
      return result;
    } catch (error) {
      console.error('💥 Update preferences error:', error);
      throw error;
    }
  }

  // ✅ NEW: Group/Family APIs
  async getUserGroups() {
    console.log('👥 Getting user groups...');
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/profile/groups`, {
        method: 'GET',
        headers
      });
      
      console.log('👥 User groups response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ User groups error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ User groups retrieved:', result.data?.groups?.length || 0);
      return result;
    } catch (error) {
      console.error('💥 User groups error:', error);
      throw error;
    }
  }

  // ✅ NEW: Wallet settings APIs
  async updateWalletSettings(settings) {
    console.log('💳 Updating wallet settings:', Object.keys(settings));
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/wallet/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings)
      });
      
      console.log('💳 Update wallet settings response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update wallet settings error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Wallet settings updated successfully');
      return result;
    } catch (error) {
      console.error('💥 Update wallet settings error:', error);
      throw error;
    }
  }

  async verifyBankAccount(bankDetails) {
    console.log('🏦 Verifying bank account...');
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BASE_URL}/wallet/verify-bank`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bankDetails)
      });
      
      console.log('🏦 Verify bank account response:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Verify bank account error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Bank account verification completed');
      return result;
    } catch (error) {
      console.error('💥 Bank account verification error:', error);
      throw error;
    }
  }
}

export default new ApiService();