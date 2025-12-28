import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../utils/colors";
import { ROLES } from "../utils/constants";

import AuthNavigator from "./AuthNavigator";
import EmployeeTabNavigator from "./EmployeeTabNavigator";
import ManagerTabNavigator from "./ManagerTabNavigator";
import AdminTabNavigator from "./AdminTabNavigator";

export default function AppNavigator() {
  const { user, userProfile, loading } = useAuth();

  // Loading screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Choisir le navigator selon le rôle
  const getNavigatorByRole = () => {
    if (!user || !userProfile) {
      return <AuthNavigator />;
    }

    switch (userProfile.role) {
      case ROLES.ADMIN:
        return <AdminTabNavigator />;
      case ROLES.MANAGER:
        return <ManagerTabNavigator />;
      case ROLES.EMPLOYEE:
      default:
        return <EmployeeTabNavigator />;
    }
  };

  return <NavigationContainer>{getNavigatorByRole()}</NavigationContainer>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
