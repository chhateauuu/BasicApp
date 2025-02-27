import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_BASE_URL = `https://backend-yhta.onrender.com`; // Update with your actual backend URL

const CategoriesScreen = () => {
  const navigation = useNavigation();
  const [scaleValue] = useState(new Animated.Value(1));
  const [userId, setUserId] = useState(null);

  const categories = [
    {
      name: 'politics',
      subDomains: ['National', 'North Indian', 'South Indian'],
      icon: 'newspaper-outline',
      colorStart: '#1e3c72',
      colorEnd: '#2a5298',
    },
    {
      name: 'geography',
      subDomains: ['States and Capitals', 'Rivers and Mountains', 'National Parks', 'Libraries and Statues'],
      icon: 'map-outline',
      colorStart: '#56ab2f',
      colorEnd: '#a8e063',
    },
    {
      name: 'history',
      subDomains: ['Ancient India', 'Medieval India', 'Modern India','Freedom Movement'],
      icon: 'book-outline',
      colorStart: '#ff7e5f',
      colorEnd: '#feb47b',
    },
    {
      name: 'mythology',
      subDomains: ['Hindu', 'Other Mythologies'],
      icon: 'accessibility-outline',
      colorStart: '#614385',
      colorEnd: '#516395',
    },
    {
      name: 'generalKnowledge',
      subDomains: ['Economy', 'Festivals','Literature','Indian Literature','Science and Technology in India'],
      icon: 'accessibility-outline',
      colorStart: '#614385',
      colorEnd: '#516395',
    },
    {
      name: 'entertainment',
      subDomains: ['Bollywood Movies', 'Bollywood Actors', 'Bollywood Songs','Indian TV Shows'],
      icon: 'tv-outline',
      colorStart: '#ff4e50',
      colorEnd: '#f9d423',
    },
    {
      name: 'sports',
      subDomains: ['Cricket'],
      icon: 'tv-outline',
      colorStart: '#ff4e50',
      colorEnd: '#f9d423',
    },
    {
      name: 'current affairs',
      subDomains: ['Economic Affairs','Infrastructure','International Relations','Health and Environment'],
      icon: 'tv-outline',
      colorStart: '#ff4e50',
      colorEnd: '#f9d423',
    },
  ];

  // Fetch User ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const sessionToken = await AsyncStorage.getItem('sessionToken'); // Retrieve the token from AsyncStorage
        if (!sessionToken) {
          throw new Error('Session token not found');
        }
    
        const response = await axios.get(`${API_BASE_URL}/api/auth/get-user-id`, {
          headers: {
            Authorization: `Bearer ${sessionToken}`, // Use the retrieved token
          },
          withCredentials: true, // Ensure cookies are sent if needed
        });
    
        setUserId(response.data.userId); // Save the user ID in state
      } catch (error) {
        console.error('Error fetching user ID:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to retrieve user information. Please log in again.');
        navigation.replace('Login'); // Redirect to login if session is invalid
      }
    };
    fetchUserId();
  }, [navigation]);

  // Log Activity
 // Log Activity
const logActivity = async (category, subDomain) => {
  try {
    const sessionToken = await AsyncStorage.getItem('sessionToken'); // Retrieve session token from storage

    if (!sessionToken) {
      console.error('No session token found');
      Alert.alert('Error', 'User is not logged in.');
      return;
    }

    // Make the request with Authorization header
    await axios.post(
      `${API_BASE_URL}/api/log-activity`,
      { category, subDomain },
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`, // Add session token to the header
        },
      }
    );
    console.log('Activity logged successfully');
  } catch (error) {
    console.error('Error logging activity:', error.response?.data || error.message);
    Alert.alert('Error', 'Failed to log activity.');
  }
};


  // Handle Category Selection
  const handleCategorySelect = async (category, subDomain) => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please log in again.');
      navigation.replace('Login');
      return;
    }
    await logActivity(category, subDomain);
    navigation.navigate('Trivia', { category, subDomain });
  };

  // Button Animation
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Select a Category</Text>
      {categories.map((category) => (
        <View key={category.name} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          {category.subDomains.map((subDomain) => (
            <TouchableOpacity
              key={subDomain}
              style={styles.categoryButton}
              onPress={() => {
                animateButtonPress();
                handleCategorySelect(category.name, subDomain);
              }}
            >
              <Text style={styles.subDomainText}>{subDomain}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2c3e50',
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#34495e',
  },
  categoryButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  subDomainText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});

export default CategoriesScreen;
