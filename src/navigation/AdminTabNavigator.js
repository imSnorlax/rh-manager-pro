import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { COLORS } from "../utils/colors";

// Screens Admin
import DashboardAdminScreen from "../screens/admin/DashboardAdminScreen";
import EmployeesScreen from "../screens/admin/EmployeesScreen";
import CongesManagementScreen from "../screens/admin/CongesManagementScreen";
import StatsScreen from "../screens/admin/StatsScreen";
import ProfileScreen from "../screens/employee/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: Platform.OS === "ios" ? 85 : 70,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "Employees") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "CongesManagement") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Stats") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardAdminScreen}
        options={{ tabBarLabel: "Dashboard" }}
      />
      <Tab.Screen
        name="Employees"
        component={EmployeesScreen}
        options={{ tabBarLabel: "Employés" }}
      />
      <Tab.Screen
        name="CongesManagement"
        component={CongesManagementScreen}
        options={{ tabBarLabel: "Congés" }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{ tabBarLabel: "Stats" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
      />
    </Tab.Navigator>
  );
}
