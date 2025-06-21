import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { caregivers } from "./caregiverData";

const CaregiverDetailModal = ({ visible, caregiverId, onClose }) => {
  const [caregiver, setCaregiver] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (caregiverId) {
      const foundCaregiver = caregivers.find((c) => c.id === caregiverId);
      setCaregiver(foundCaregiver);
      // Initialize selections with first available options
      if (foundCaregiver) {
        setSelectedDate(foundCaregiver.availableDates?.[0]?.date || null);
        setSelectedTime(
          foundCaregiver.timeSlots?.find((slot) => slot.available)?.time || null
        );
        setSelectedService(foundCaregiver.servicePackages?.[0]?.name || null);
      }
    } else {
      setCaregiver(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedService(null);
    }
  }, [caregiverId]);

  if (!caregiver) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Hero Image Section */}
      <View className="relative h-80">
        <Image
          source={{ uri: caregiver.image }}
          className="w-full h-full"
          style={{ resizeMode: "cover" }}
        />

        {/* Gradient Overlay */}
        <View className="absolute inset-0 bg-black/40" />

        {/* Header Controls */}
        <View className="absolute top-12 left-6 right-6 flex-row justify-between items-center z-10">
          <TouchableOpacity
            onPress={onClose}
            className="w-12 h-12 bg-black/30 rounded-full items-center justify-center backdrop-blur-sm"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>

          <View className="flex-row space-x-3">
            <TouchableOpacity className="w-12 h-12 bg-black/30 rounded-full items-center justify-center backdrop-blur-sm">
              <Ionicons name="heart-outline" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="w-12 h-12 bg-black/30 rounded-full items-center justify-center backdrop-blur-sm">
              <Ionicons name="share-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Rating Badge */}
        <View className="absolute top-20 right-6 bg-white/95 px-3 py-2 rounded-full flex-row items-center backdrop-blur-sm">
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text className="ml-1 font-bold text-gray-900">
            {caregiver.rating}
          </Text>
          <Text className="text-gray-600 text-sm">({caregiver.reviews})</Text>
        </View>

        {/* Online Status */}
        <View className="absolute bottom-6 left-6 bg-green-500 px-4 py-2 rounded-full flex-row items-center">
          <View className="w-2 h-2 bg-white rounded-full mr-2" />
          <Text className="text-white font-medium text-sm">
            {caregiver.available ? "Available Now" : "Currently Unavailable"}
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View className="flex-1 bg-white rounded-t-3xl -mt-6 relative z-10">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Handle Bar */}
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-6" />

          {/* Service Title & Verification */}
          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-2xl font-bold text-gray-900 flex-1">
                {caregiver.service}
              </Text>
              {caregiver.verified && (
                <View className="bg-blue-50 px-3 py-1 rounded-full flex-row items-center">
                  <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
                  <Text className="ml-1 text-blue-600 font-medium text-sm">
                    Verified
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-gray-600 leading-6 mb-4">
              {caregiver.description}
            </Text>

            {/* Quick Stats */}
            <View className="flex-row justify-between bg-gray-50 rounded-2xl p-4">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-gray-900">
                  {caregiver.experience}
                </Text>
                <Text className="text-gray-600 text-sm">Experience</Text>
              </View>
              <View className="w-px bg-gray-200 mx-4" />
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-gray-900">150+</Text>
                <Text className="text-gray-600 text-sm">Jobs Done</Text>
              </View>
              <View className="w-px bg-gray-200 mx-4" />
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-gray-900">
                  {caregiver.responseTime}
                </Text>
                <Text className="text-gray-600 text-sm">Response</Text>
              </View>
            </View>
          </View>

          {/* Pricing Section */}
          <View className="px-6 mb-8">
            <View className="bg-orange-50 rounded-2xl p-5">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-3xl font-bold text-gray-900">
                    {caregiver.price}
                  </Text>
                  <Text className="text-orange-600 font-medium">
                    save up to 20%
                  </Text>
                </View>
                <View className="flex-row space-x-2">
                  <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center">
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#EA580C"
                    />
                  </View>
                  <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center">
                    <Ionicons name="time-outline" size={18} color="#EA580C" />
                  </View>
                </View>
              </View>

              {/* Service Options */}
              <Text className="font-bold text-gray-900 mb-3">
                Service Packages
              </Text>
              <View className="space-y-2">
                {caregiver.servicePackages?.map((pkg, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedService(pkg.name)}
                    className={`p-3 rounded-xl border ${
                      selectedService === pkg.name
                        ? "bg-orange-100 border-orange-300"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="font-medium text-gray-900">
                          {pkg.name}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {pkg.description}
                        </Text>
                      </View>
                      <Text className="font-bold text-gray-900">
                        {pkg.price}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Specializations */}
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Specializations
            </Text>
            <View className="flex-row flex-wrap">
              {caregiver.specialties?.map((spec, index) => (
                <View
                  key={index}
                  className="bg-blue-50 px-4 py-2 rounded-full mr-2 mb-2 flex-row items-center"
                >
                  <Ionicons name="medical-outline" size={14} color="#3B82F6" />
                  <Text className="ml-2 text-blue-700 font-medium text-sm">
                    {spec}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Languages */}
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Languages Spoken
            </Text>
            <View className="flex-row flex-wrap">
              {caregiver.languages?.map((lang, index) => (
                <View
                  key={index}
                  className="bg-green-50 px-4 py-2 rounded-full mr-2 mb-2 flex-row items-center"
                >
                  <Ionicons name="globe-outline" size={14} color="#10B981" />
                  <Text className="ml-2 text-green-700 font-medium text-sm">
                    {lang}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Certifications */}
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Certifications & Licenses
            </Text>
            <View className="space-y-3">
              {caregiver.certifications?.map((cert, index) => (
                <View
                  key={index}
                  className="bg-purple-50 p-4 rounded-xl flex-row items-center"
                >
                  <View className="w-12 h-12 bg-purple-100 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="ribbon-outline" size={20} color="#8B5CF6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      {cert.name}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {cert.issuer} • {cert.year}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
              ))}
            </View>
          </View>

          {/* Choose Date */}
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Choose Date
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {caregiver.availableDates?.map((date, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedDate(date.date)}
                  className={`mr-3 px-4 py-4 rounded-xl border min-w-[100px] items-center ${
                    selectedDate === date.date
                      ? "bg-orange-500 border-orange-500"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text
                    className={`font-medium text-sm ${
                      selectedDate === date.date
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {date.day}
                  </Text>
                  <Text
                    className={`font-bold ${
                      selectedDate === date.date
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {date.dayNum}
                  </Text>
                  <Text
                    className={`text-xs ${
                      selectedDate === date.date
                        ? "text-orange-100"
                        : "text-gray-500"
                    }`}
                  >
                    {date.month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Choose Time */}
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Available Time Slots
            </Text>
            <View className="flex-row flex-wrap">
              {caregiver.timeSlots?.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedTime(time.time)}
                  className={`mr-3 mb-3 px-4 py-3 rounded-xl border ${
                    selectedTime === time.time
                      ? "bg-orange-500 border-orange-500"
                      : time.available
                      ? "bg-gray-50 border-gray-200"
                      : "bg-gray-100 border-gray-300"
                  }`}
                  disabled={!time.available}
                >
                  <Text
                    className={`font-medium ${
                      selectedTime === time.time
                        ? "text-white"
                        : time.available
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                  >
                    {time.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Customer Reviews */}
          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">
                Customer Reviews
              </Text>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-orange-500 font-medium mr-1">
                  View All
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#F97316" />
              </TouchableOpacity>
            </View>

            {/* Individual Reviews */}
            <View className="space-y-4">
              {caregiver.reviewsData?.map((review, index) => (
                <View key={index} className="bg-gray-50 rounded-2xl p-4">
                  <View className="flex-row items-center mb-3">
                    <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Text className="font-bold text-blue-600">
                        {review.name.charAt(0)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900">
                        {review.name}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {review.date}
                      </Text>
                    </View>
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name="star"
                          size={14}
                          color={star <= review.rating ? "#F59E0B" : "#E5E7EB"}
                        />
                      ))}
                    </View>
                  </View>
                  <Text className="text-gray-600 leading-5 mb-3">
                    {review.comment}
                  </Text>
                  {review.serviceType && (
                    <View className="bg-white px-3 py-1 rounded-full self-start">
                      <Text className="text-gray-600 text-xs">
                        {review.serviceType}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Contact Information */}
          <View className="px-6 mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Contact Information
            </Text>
            <View className="bg-blue-50 rounded-2xl p-5">
              <View className="flex-row items-center mb-4">
                <View className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center mr-4">
                  <Ionicons name="person" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-lg">
                    {caregiver.name}
                  </Text>
                  <Text className="text-gray-600">{caregiver.service}</Text>
                  <Text className="text-gray-600 text-sm">
                    {caregiver.experience} experience
                  </Text>
                </View>
              </View>

              <View className="flex-row space-x-3">
                <TouchableOpacity className="flex-1 bg-white rounded-xl py-4 flex-row items-center justify-center shadow-sm">
                  <Ionicons name="call" size={20} color="#3B82F6" />
                  <Text className="ml-2 font-medium text-blue-500">Call</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-white rounded-xl py-4 flex-row items-center justify-center shadow-sm">
                  <Ionicons name="chatbubble" size={20} color="#3B82F6" />
                  <Text className="ml-2 font-medium text-blue-500">
                    Message
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-white rounded-xl py-4 flex-row items-center justify-center shadow-sm">
                  <Ionicons name="videocam" size={20} color="#3B82F6" />
                  <Text className="ml-2 font-medium text-blue-500">Video</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Booking Section */}
        <View className="px-6 py-4 bg-white border-t border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-gray-600 text-sm">Total Cost</Text>
              <Text className="text-2xl font-bold text-gray-900">₹3,200</Text>
            </View>
            <View className="flex-row space-x-3">
              <TouchableOpacity className="bg-gray-100 px-6 py-3 rounded-xl">
                <Text className="font-medium text-gray-700">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-orange-500 px-8 py-3 rounded-xl">
                <Text className="text-white font-bold text-lg">Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CaregiverDetailModal;
