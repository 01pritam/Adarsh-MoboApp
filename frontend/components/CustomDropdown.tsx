// CustomDropdown.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const SimpleDropdown = ({ data, value, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const selectedLabel = data.find(item => item.value === value)?.label || 'Select an option';
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dropdown} 
        onPress={toggleDropdown}
      >
        <Text style={styles.dropdownText}>{selectedLabel}</Text>
        <Text style={styles.dropdownIcon}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.dropdownMenu}>
          {data.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.dropdownItem,
                value === item.value && styles.selectedItem
              ]} 
              onPress={() => {
                onSelect(item.value);
                setIsOpen(false);
              }}
            >
              <Text 
                style={[
                  styles.dropdownItemText,
                  value === item.value && styles.selectedItemText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#555',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  selectedItemText: {
    fontWeight: 'bold',
    color: '#2A5C8F',
  },
});

export default SimpleDropdown;
