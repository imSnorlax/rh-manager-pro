import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { COLORS } from "../utils/colors";

// Screens Manager
import HomeScreen from "../screens/employee/HomeScreen"; // Même Home
import CongesScreen from "../screens/employee/CongesScreen"; // Même Congés
import ProfileScreen from "../screens/employee/ProfileScreen"; // Même Profil
// Screens spécifiques Manager (on va les créer)
import TeamScreen from "../screens/manager/TeamScreen";
import ValidationScreen from "../screens/manager/ValidationScreen";

const Tab = createBottomTabNavigator();

export default function ManagerTabNavigator() {
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

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Team") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Validation") {
            iconName = focused
              ? "checkmark-circle"
              : "checkmark-circle-outline";
          } else if (route.name === "Conges") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Accueil" }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{ tabBarLabel: "Équipe" }}
      />
      <Tab.Screen
        name="Validation"
        component={ValidationScreen}
        options={{ tabBarLabel: "Valider" }}
      />
      <Tab.Screen
        name="Conges"
        component={CongesScreen}
        options={{ tabBarLabel: "Congés" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
      />
    </Tab.Navigator>
  );
}
