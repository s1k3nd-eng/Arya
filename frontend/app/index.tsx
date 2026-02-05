import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      let userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        // Generate new user ID
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('userId', userId);
      }
      
      // Navigate to main app
      setTimeout(() => {
        router.replace('/(tabs)/chat');
      }, 1000);
    } catch (error) {
      console.error('Init error:', error);
      setTimeout(() => {
        router.replace('/(tabs)/chat');
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00d4ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});