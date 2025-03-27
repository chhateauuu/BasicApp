import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  TouchableWithoutFeedback,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Menu from "./Menu"; // Import the Menu component
import { useFocusEffect } from "@react-navigation/native";

const API_BASE_URL = `https://dementia-backend-gamma.vercel.app`;
const { width, height } = Dimensions.get("window");

// Category emojis mapping
const categoryEmojis = {
  politics: "🗳️",
  geography: "🗺️",
  history: "📚",
  mythology: "🏛️",
  generalknowledge: "🧠",
  entertainment: "🎬",
  sports: "🏏",
  "current affairs": "📰",
  default: "📱",
};

// Menu icons (using emoji or text to avoid vector icon issues)
const MENU_ICON = "≡";
const CLOSE_ICON = "✕";
const PLUS_ICON = "➕";

const HomeScreen = ({ navigation }) => {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Animation values
  const menuAnimation = useRef(new Animated.Value(-width * 0.7)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Process preferences into grouped format
  const processPreferences = (prefsArray) => {
    const grouped = {};
    
    if (!prefsArray || prefsArray.length === 0) {
      return grouped;
    }
    
    console.log("Processing preferences array:", JSON.stringify(prefsArray));
    console.log("Current API_BASE_URL:", API_BASE_URL);
    
    prefsArray.forEach((pref, index) => {
      try {
        // Extract category and subDomain - support multiple formats
        let category = null;
        let subDomain = null;
        
        console.log(`Processing preference ${index}:`, JSON.stringify(pref));
        
        // Case 1: {category: "string", subDomain: "string"}
        if (pref && typeof pref.category === 'string') {
          category = pref.category;
          subDomain = pref.subDomain;
          console.log(`  Case 1: category=${category}, subDomain=${subDomain}`);
        } 
        // Case 2: {category: {category: "string"}, subDomain: "string"}
        else if (pref && typeof pref.category === 'object' && pref.category && pref.category.category) {
          category = pref.category.category;
          subDomain = pref.subDomain;
          console.log(`  Case 2: category=${category}, subDomain=${subDomain}`);
        }
        // Case 3: Direct string (fallback)
        else if (typeof pref === 'string') {
          category = pref;
          console.log(`  Case 3: category=${category}, no subDomain`);
        }
        // Case 4: Other possible structures
        else if (pref && typeof pref === 'object') {
          // Try to extract any recognizable category/subdomain data
          const keys = Object.keys(pref);
          console.log(`  Case 4: object with keys: ${keys.join(', ')}`);
          
          if (keys.includes('category')) {
            if (typeof pref.category === 'string') {
              category = pref.category;
            } else if (typeof pref.category === 'object' && pref.category) {
              // Try to extract from nested object
              category = pref.category.category || pref.category.name || Object.values(pref.category)[0];
            }
          }
          
          if (keys.includes('subDomain') || keys.includes('subdomain') || keys.includes('sub_domain')) {
            subDomain = pref.subDomain || pref.subdomain || pref.sub_domain;
          }
          
          console.log(`  After Case 4 extraction: category=${category}, subDomain=${subDomain}`);
        }
        
        // If we found a valid category, add it to our grouped preferences
        if (category) {
          if (!grouped[category]) {
            grouped[category] = [];
          }
          
          // Add subDomain if present (can be "General" or any other value)
          if (subDomain) {
            // Add the subdomain if not already present
            if (!grouped[category].includes(subDomain)) {
              grouped[category].push(subDomain);
              console.log(`  Added subdomain to category: ${category} → ${subDomain}`);
            }
          }
        }
      } catch (err) {
        console.warn("Error processing preference:", err.message, pref);
      }
    });
    
    console.log("Final grouped preferences:", JSON.stringify(grouped));
    return grouped;
  };
  
  // Get grouped preferences from current state
  const groupedPreferences = processPreferences(preferences);

  const fetchUserPreferences = async () => {
    setLoading(true);
    try {
      const sessionToken = await AsyncStorage.getItem("sessionToken");
      console.log("Fetching preferences with token:", sessionToken);
      
      const response = await axios.get(`${API_BASE_URL}/api/user-preferences`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      
      console.log("Raw API Response:", JSON.stringify(response.data));
      
      if (response.data && response.data.preferences) {
        const prefs = response.data.preferences;
        console.log("Preferences from API:", JSON.stringify(prefs));
        
        // Inspect all preferences in detail to help debug
        prefs.forEach((pref, i) => {
          console.log(`Preference ${i}:`, JSON.stringify(pref));
          console.log(`  Keys: ${Object.keys(pref).join(', ')}`);
          if (pref.category) {
            console.log(`  Category: ${typeof pref.category === 'string' ? 
              pref.category : JSON.stringify(pref.category)}`);
          }
          if (pref.subDomain) {
            console.log(`  SubDomain: ${pref.subDomain}`);
          }
        });
        
        // Accept ALL preferences from the API
        setPreferences(prefs);
        console.log("Set preferences from API, count:", prefs.length);
      } else {
        console.log("No preferences found in response");
        setPreferences([]);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      Alert.alert("Error", "Could not fetch your preferences. Please try again later.");
      setPreferences([]);
    }
    setLoading(false);
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

  const toggleMenu = () => {
    if (menuOpen) {
      // Close menu
      Animated.parallel([
        Animated.timing(menuAnimation, {
          toValue: -width * 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Open menu
      Animated.parallel([
        Animated.timing(menuAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(screenOpacity, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    setMenuOpen(!menuOpen);
  };

  // Replace useEffect with useFocusEffect to refresh whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log("HomeScreen focused - refreshing preferences");
      fetchUserPreferences();
      return () => {
        // Clean up if needed
      };
    }, [])
  );

  // Group preferences by category
  const renderCategorySections = () => {
    if (!preferences || preferences.length === 0) {
      console.log("No preferences available to render");
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={styles.emptyStateText}>
            No categories selected yet. Start exploring!
          </Text>
        </View>
      );
    }

    console.log("Rendering preferences:", JSON.stringify(preferences));
    
    // Log the structure of grouped preferences in a clearer format
    console.log("Grouped Preferences Structure at render time:");
    Object.entries(groupedPreferences).forEach(([category, subdomains]) => {
      console.log(`Category: ${category}`);
      console.log(`  Subdomains (${subdomains?.length || 0}): ${subdomains && subdomains.length ? subdomains.join(', ') : 'None'}`);
    });
    
    // If no categories found after processing, show empty state
    if (Object.keys(groupedPreferences).length === 0) {
      console.log("No categories found after processing");
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={styles.emptyStateText}>
            No valid categories found. Please add some categories!
          </Text>
        </View>
      );
    }

    console.log(`Rendering ${Object.keys(groupedPreferences).length} category sections`);
    
    // Render the categories
    return Object.entries(groupedPreferences).map(([category, subDomains]) => {
      const uniqueKey = `category-${category}`;
      console.log(`Rendering category: ${category} with ${subDomains?.length || 0} subdomains: ${subDomains?.join(', ') || 'none'}`);
      
      // Handle lowercase category names for emoji mapping
      const categoryLower = category.toLowerCase();
      const emoji = categoryEmojis[categoryLower] || categoryEmojis.default;
      
      return (
        <View key={uniqueKey} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryIconContainer}>
              <Text style={styles.categoryEmoji}>{emoji}</Text>
            </View>
            <Text style={styles.categoryTitle}>{category}</Text>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => {
                console.log(`Starting quiz for category: ${category}`);
                navigation.navigate("RandomQuestionsScreen", {
                  categories: [category],
                });
              }}
            >
              <Text style={styles.categoryButtonText}>Start Quiz</Text>
            </TouchableOpacity>
          </View>
          
          {/* Display subdomains if present */}
          {subDomains && subDomains.length > 0 ? (
            <View style={styles.subdomainContainer}>
              <Text style={styles.subdomainLabel}>Subdomains:</Text>
              <View style={styles.subdomainList}>
                {subDomains.map((subdomain, index) => (
                  <TouchableOpacity
                    key={`${category}-${subdomain}-${index}`}
                    style={styles.subdomainItem}
                    onPress={() => {
                      console.log(`Starting quiz for ${category} - ${subdomain}`);
                      navigation.navigate("RandomQuestionsScreen", {
                        categories: [category],
                        subDomain: subdomain
                      });
                    }}
                  >
                    <Text style={styles.subdomainText}>{subdomain}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.subdomainContainer}>
              <Text style={styles.noSubdomainsText}>No specific subdomains selected</Text>
            </View>
          )}
        </View>
      );
    });
  };

  const handleQuizAll = () => {
    // Check if there are any categories available
    if (Object.keys(groupedPreferences).length === 0) {
      Alert.alert("No Categories", "Please add some categories first.");
      return;
    }
    
    // Use the category names from grouped preferences
    const categories = Object.keys(groupedPreferences);
    console.log("Starting quiz with all categories:", categories);
    
    navigation.navigate("RandomQuestionsScreen", {
      categories: categories,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#A78BFA" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F5F3FF" barStyle="dark-content" />
      
      {/* Main Content */}
      <Animated.View style={[styles.mainContent, { opacity: screenOpacity }]}>
        {/* Header with Menu Icon */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <Text style={styles.menuIconText}>{MENU_ICON}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cognizen</Text>
          <View style={styles.emptyBox} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Explore Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={handleQuizAll}
            >
              <Text style={styles.viewAllText}>Quiz All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Categories Sections */}
          {renderCategorySections()}
          
          {/* Add More Categories Button */}
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={() => navigation.navigate("Categories")}
          >
            <Text style={styles.addMoreButtonIcon}>{PLUS_ICON}</Text>
            <Text style={styles.addMoreText}>Add More Categories</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Drawer Menu */}
      <Menu 
        navigation={navigation}
        isOpen={menuOpen}
        closeMenu={toggleMenu}
        menuAnimation={menuAnimation}
      />
      
      {menuOpen && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#F5F3FF",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4B5563",
  },
  menuButton: {
    padding: 8,
  },
  menuIconText: {
    fontSize: 26,
    color: "#4B5563",
  },
  emptyBox: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
  },
  viewAllButton: {
    backgroundColor: "#A78BFA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  addMoreButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: "#A78BFA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  addMoreButtonIcon: {
    fontSize: 20,
    marginRight: 10,
    color: "#A78BFA",
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#A78BFA",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 999,
  },
  // New styles for category sections
  categorySection: {
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#A78BFA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4B5563",
    textTransform: "capitalize",
  },
  subdomainsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  subdomainCard: {
    backgroundColor: "#A78BFA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 4,
    minWidth: "45%",
    alignItems: "center",
  },
  subdomainText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
  categoryButton: {
    backgroundColor: "#A78BFA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  subdomainContainer: {
    marginTop: 16,
  },
  subdomainLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  subdomainList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  subdomainItem: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    margin: 6,
    minWidth: "45%",
    borderWidth: 1,
    borderColor: "#D8B4FE",
    shadowColor: "#9061F9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  subdomainText: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  noSubdomainsText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 8,
  },
});

export default HomeScreen;
