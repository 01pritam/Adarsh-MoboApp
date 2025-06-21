import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { caregivers, categories } from './caregiverData';
import CaregiverDetailModal from './CaregiverDetailModal';

const CaregiverPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaregiverId, setSelectedCaregiverId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredCaregivers = caregivers.filter(caregiver => {
    const matchesCategory = selectedCategory === 'all' || caregiver.category === selectedCategory;
    const matchesSearch = caregiver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         caregiver.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCaregiverPress = (caregiverId) => {
    setSelectedCaregiverId(caregiverId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCaregiverId(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1 mx-4">
            <Text className="text-xl font-bold text-gray-900 text-center">Find Caregivers</Text>
            <Text className="text-gray-600 text-sm text-center">Professional care for your loved ones</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
            <Ionicons name="notifications-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search doctors, nurses, therapists..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-gray-700"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity className="ml-2">
            <Ionicons name="options-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              className={`mr-3 px-4 py-3 rounded-xl flex-row items-center ${
                selectedCategory === category.id 
                  ? 'bg-blue-500' 
                  : 'bg-gray-100'
              }`}
            >
              <Ionicons 
                name={category.icon as any} 
                size={16} 
                color={selectedCategory === category.id ? 'white' : category.color} 
              />
              <Text className={`ml-2 font-medium text-sm ${
                selectedCategory === category.id 
                  ? 'text-white' 
                  : 'text-gray-700'
              }`}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Filters */}
      <View className="bg-white px-6 py-3 border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity className="mr-3 px-3 py-2 bg-green-50 rounded-full flex-row items-center">
            <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
            <Text className="text-green-700 text-sm font-medium">Available Now</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mr-3 px-3 py-2 bg-yellow-50 rounded-full flex-row items-center">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text className="text-yellow-700 text-sm font-medium ml-1">Top Rated</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mr-3 px-3 py-2 bg-purple-50 rounded-full flex-row items-center">
            <Ionicons name="location" size={12} color="#8B5CF6" />
            <Text className="text-purple-700 text-sm font-medium ml-1">Nearby</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mr-3 px-3 py-2 bg-blue-50 rounded-full flex-row items-center">
            <Ionicons name="shield-checkmark" size={12} color="#3B82F6" />
            <Text className="text-blue-700 text-sm font-medium ml-1">Verified</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Results Count */}
      <View className="px-6 py-3">
        <Text className="text-gray-600 text-sm">
          {filteredCaregivers.length} caregivers found • Sorted by relevance
        </Text>
      </View>

      {/* Caregivers List */}
      <ScrollView className="flex-1 px-6">
        {filteredCaregivers.map((caregiver) => (
          <TouchableOpacity
            key={caregiver.id}
            onPress={() => handleCaregiverPress(caregiver.id)}
            className="bg-white rounded-2xl mb-4 overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 4,
            }}
            activeOpacity={0.7}
          >
            <View className="p-5">
              {/* Header Row */}
              <View className="flex-row items-start mb-4">
                {/* Profile Image */}
                <View className="relative">
                  <Image 
                    source={{ uri: caregiver.image }}
                    className="w-18 h-18 rounded-2xl"
                  />
                  {caregiver.verified && (
                    <View className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                      <Ionicons name="checkmark" size={10} color="white" />
                    </View>
                  )}
                  <View className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    caregiver.available ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                </View>

                {/* Details */}
                <View className="flex-1 ml-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-lg font-bold text-gray-900 flex-1">{caregiver.name}</Text>
                    <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg">
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text className="ml-1 text-xs font-semibold text-yellow-700">{caregiver.rating}</Text>
                    </View>
                  </View>
                  
                  <Text className="text-blue-600 font-medium text-sm mb-2">{caregiver.service}</Text>
                  
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                    <Text className="text-gray-500 text-xs ml-1">{caregiver.location}</Text>
                    <Text className="text-gray-300 mx-2">•</Text>
                    <Text className="text-gray-500 text-xs">{caregiver.distance}</Text>
                    <Text className="text-gray-300 mx-2">•</Text>
                    <Text className="text-gray-500 text-xs">{caregiver.experience}</Text>
                  </View>

                  {/* Quick Info Tags */}
                  <View className="flex-row items-center">
                    <View className="bg-green-50 px-2 py-1 rounded-full mr-2">
                      <Text className="text-green-700 text-xs font-medium">{caregiver.responseTime}</Text>
                    </View>
                    <View className="bg-blue-50 px-2 py-1 rounded-full">
                      <Text className="text-blue-700 text-xs font-medium">150+ jobs</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Specialties */}
              <View className="mb-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {caregiver.specialties?.slice(0, 3).map((specialty, index) => (
                    <View key={index} className="bg-gray-50 px-3 py-1 rounded-full mr-2">
                      <Text className="text-xs text-gray-600">{specialty}</Text>
                    </View>
                  ))}
                  {caregiver.specialties?.length > 3 && (
                    <View className="bg-gray-50 px-3 py-1 rounded-full">
                      <Text className="text-xs text-gray-600">+{caregiver.specialties.length - 3} more</Text>
                    </View>
                  )}
                </ScrollView>
              </View>

              {/* Bottom Info */}
              <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {caregiver.price}<Text className="text-sm font-normal text-gray-500">{caregiver.priceUnit}</Text>
                  </Text>
                  <Text className="text-xs text-gray-500">{caregiver.reviews} reviews</Text>
                </View>
                
                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity className="bg-gray-100 w-10 h-10 rounded-xl items-center justify-center">
                    <Ionicons name="heart-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-gray-100 w-10 h-10 rounded-xl items-center justify-center">
                    <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-blue-500 px-6 py-3 rounded-xl">
                    <Text className="text-white font-semibold text-sm">View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Availability Status */}
              <View className="mt-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-2 ${
                    caregiver.available ? 'bg-green-400' : 'bg-orange-400'
                  }`} />
                  <Text className="text-xs text-gray-600">
                    {caregiver.available ? `Available ${caregiver.nextAvailable}` : caregiver.nextAvailable}
                  </Text>
                </View>
                <Text className="text-xs text-gray-500">Tap for full details</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Load More Button */}
        <TouchableOpacity className="bg-white rounded-2xl p-4 mb-4 items-center border border-gray-200">
          <Text className="text-blue-500 font-medium">Load More Caregivers</Text>
        </TouchableOpacity>

        {/* Emergency Section */}
        <TouchableOpacity className="bg-red-500 rounded-2xl p-6 mb-8">
          <View className="flex-row items-center justify-center">
            <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
              <Ionicons name="call" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">Emergency Care</Text>
              <Text className="text-red-100 text-sm">24/7 immediate assistance available</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal for Caregiver Details */}
      <CaregiverDetailModal
        visible={modalVisible}
        caregiverId={selectedCaregiverId}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
};

export default CaregiverPage;
