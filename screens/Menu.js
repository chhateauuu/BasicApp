import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = `https://dementia-backend-gamma.vercel.app`;
const { width } = Dimensions.get('window');

// Menu icons
const CLOSE_ICON = '✕';

const Menu = ({ navigation, isOpen, closeMenu, menuAnimation, isLoggedIn, handleLogout }) => {
  
  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      // Show confirmation dialog first
      Alert.alert(
        "Delete Account", 
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete", 
            style: "destructive",
            onPress: async () => {
              try {
                const sessionToken = await AsyncStorage.getItem("sessionToken");
                
                if (!sessionToken) {
                  Alert.alert("Error", "You must be logged in to delete your account.");
                  return;
                }
                
                // Call the delete account endpoint
                await axios.delete(`${API_BASE_URL}/api/auth/delete-account`, {
                  headers: {
                    Authorization: `Bearer ${sessionToken}`,
                  },
                });
                
                // Clear session token
                await AsyncStorage.removeItem("sessionToken");
                
                // Show success message
                Alert.alert(
                  "Account Deleted", 
                  "Your account has been successfully deleted.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        closeMenu();
                        navigation.replace("Home");
                      }
                    }
                  ]
                );
              } catch (error) {
                console.error("Error deleting account:", error);
                Alert.alert(
                  "Error", 
                  "Failed to delete account. Please try again later."
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Delete Account Error:", error);
      Alert.alert("Error", "Failed to process your request. Please try again.");
    }
  };
  
  return (
    <>
      <Animated.View style={[styles.menu, { transform: [{ translateX: menuAnimation }] }]}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Menu</Text>
          <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
            <Text style={styles.closeIconText}>{CLOSE_ICON}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.menuItemsContainer}>
          {/* Home */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              // Navigate first, then close menu
              navigation.navigate("Home");
              closeMenu();
            }}
          >
            <Text style={styles.menuItemIcon}>🏠</Text>
            <Text style={styles.menuItemText}>Home</Text>
          </TouchableOpacity>
          
          {/* Categories - only shown for logged in users */}
          {isLoggedIn && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                // Navigate first, then close menu
                navigation.navigate("Categories");
                closeMenu();
              }}
            >
              <Text style={styles.menuItemIcon}>📂</Text>
              <Text style={styles.menuItemText}>Categories</Text>
            </TouchableOpacity>
          )}
          
          {/* Login - only shown for anonymous users */}
          {!isLoggedIn && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                navigation.navigate("Login");
                closeMenu();
              }}
            >
              <Text style={styles.menuItemIcon}>🔑</Text>
              <Text style={styles.menuItemText}>Log In</Text>
            </TouchableOpacity>
          )}
          
          {/* Sign Up - only shown for anonymous users */}
          {!isLoggedIn && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                navigation.navigate("SignUp");
                closeMenu();
              }}
            >
              <Text style={styles.menuItemIcon}>📝</Text>
              <Text style={styles.menuItemText}>Sign Up</Text>
            </TouchableOpacity>
          )}
          
          {/* History (Coming Soon) */}
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              // Show alert first, then close menu
              Alert.alert("Coming Soon", "History feature will be available in the next update!");
              closeMenu();
            }}
          >
            <Text style={styles.menuItemIcon}>🕒</Text>
            <Text style={styles.menuItemText}>History</Text>
          </TouchableOpacity>
        </View>
        
        {/* Account actions for logged in users */}
        {isLoggedIn && (
          <View style={styles.logoutContainer}>
            <View style={styles.menuDivider} />
            
            {/* Logout option */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                // Use the handleLogout prop if available, otherwise fallback to old implementation
                if (handleLogout) {
                  handleLogout();
                } else {
                  try {
                    AsyncStorage.removeItem("sessionToken");
                    Alert.alert("Logout Successful", "You have been logged out.");
                    navigation.replace("Login");
                  } catch (error) {
                    console.error("Logout Error:", error);
                    Alert.alert("Error", "Failed to log out. Please try again.");
                  }
                }
                closeMenu();
              }}
            >
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
            
            {/* Delete Account option */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                handleDeleteAccount();
              }}
            >
              <Text style={styles.menuItemIcon}>🗑️</Text>
              <Text style={[styles.menuItemText, styles.deleteAccountText]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
      
      {/* Overlay to close menu when clicking outside */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width * 0.7,
    height: "100%",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    paddingTop: StatusBar.currentHeight || 0,
    zIndex: 1000,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4B5563",
  },
  closeButton: {
    padding: 4,
  },
  closeIconText: {
    fontSize: 22,
    color: "#6B7280",
  },
  menuItemsContainer: {
    padding: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  menuItemIcon: {
    fontSize: 22,
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#4B5563",
  },
  logoutContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    padding: 12,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  logoutText: {
    color: "#EF4444",
  },
  deleteAccountText: {
    color: "#EF4444",
    fontWeight: "600",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 999,
  },
});

export default Menu; 