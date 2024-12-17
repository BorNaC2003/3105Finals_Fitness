import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from './screens/ProfileScreen';
import CalorieTrackerScreen from './screens/CalorieTrackerScreen';
import ExerciseTrackerScreen from './screens/ExerciseTrackerScreen';
import WorkoutPlansScreen from './screens/WorkoutPlansScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import axios from 'axios';
import api from './services/api'; // Import the Axios instance
import AsyncStorage from '@react-native-async-storage/async-storage';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BACKEND_URL = 'http://your-express-backend.com/api'; // Replace with your backend's URL

const MainTabs = ({ handleLogout, token }) => (
  <Tab.Navigator>
    <Tab.Screen
      name="Profile"
      children={({ navigation }) => (
        <ProfileScreen
          navigation={navigation}
          onLogout={handleLogout}
          token={token}
        />
      )}
    />
    <Tab.Screen name="Calorie Tracker" component={CalorieTrackerScreen} />
    <Tab.Screen name="Exercise Tracker" component={ExerciseTrackerScreen} />
    <Tab.Screen name="Workout Plans">
      {({ navigation }) => (
        <WorkoutPlansScreen navigation={navigation} token={token} />
      )}
    </Tab.Screen>
  </Tab.Navigator>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);


  const handleLogin = async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      const token = response?.data?.token;
  
      if (!token) {
        throw new Error('No token received.');
      }
  
      await AsyncStorage.setItem('token', token);
      setToken(token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert('Error', 'Invalid credentials. Please try again.');
    }
  };
  
  

  const handleRegister = async (userData) => {
    try {
        await api.post('/users/register', userData);
        Alert.alert('Success', 'Registration successful. Please log in.');
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        Alert.alert('Error', 'Registration failed. Please try again.');
    }
};


const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setIsLoggedIn(false);
  } catch (error) {
    console.error('Logout error:', error.message);
  }
};


  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        if (savedToken) {
          setToken(savedToken);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Failed to load token:', error.message);
      }
    };
    loadToken();
  }, []);
  

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => <RegisterScreen {...props} onRegister={handleRegister} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="MainTabs">
            {(props) => <MainTabs {...props} handleLogout={handleLogout} token={token} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
