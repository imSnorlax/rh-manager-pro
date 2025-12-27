import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/colors';

import AuthNavigator from './AuthNavigator';
import DashboardEmployee from '../screens/employee/DashboardEmployee';

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // Loading screen pendant vérification auth
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        // User connecté → Dashboard
        <DashboardEmployee />
      ) : (
        // User pas connecté → Auth screens
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});