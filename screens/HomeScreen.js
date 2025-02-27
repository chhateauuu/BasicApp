import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = `https://backend-yhta.onrender.com`; // Replace with your backend server IP

const HomeScreen = ({ navigation }) => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserPreferences = async () => {
    try {
      const sessionToken = await AsyncStorage.getItem("sessionToken");
      console.log("Session Token Sent:", sessionToken);

      const response = await axios.get(`${API_BASE_URL}/api/user-preferences`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      setPreferences(response.data.preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("sessionToken");
      Alert.alert("Logout Successful", "You have been logged out.");
      navigation.replace("Login");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: "" }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Your Personalized Categories:</Text>
        {preferences.length > 0 ? (
          <FlatList
            data={preferences}
            keyExtractor={(item) => item.category}
            renderItem={({ item }) => (
              <TouchableOpacity
              style={styles.randomQuestionsButton}
              onPress={() =>
                navigation.navigate('RandomQuestionsScreen', {
                  categories: preferences.map((pref) => pref.category),
                })
              }
              >
                <Text style={styles.categoryText}>{item.category} Quiz</Text>

              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.noPreferencesText}>
            No preferences found. Start exploring!
          </Text>
        )}
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate("Categories")}
        >
          <Text style={styles.exploreButtonText}>Explore More Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  categoryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  categoryText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  randomQuestionsButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  randomQuestionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  exploreButton: {
    marginTop: 20,
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#FF5722",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noPreferencesText: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
    textAlign: "center",
  },
});

export default HomeScreen;
