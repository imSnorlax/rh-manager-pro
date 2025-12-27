import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';

export default function DashboardEmployee() {
  const { userProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>Bienvenue!</Text>
        <Text style={styles.name}>
          {userProfile?.firstName} {userProfile?.lastName}
        </Text>
        <Text style={styles.role}>Rôle: {userProfile?.role}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>✅</Text>
          <Text style={styles.cardTitle}>Connexion réussie!</Text>
          <Text style={styles.cardText}>
            Vous êtes maintenant connecté à RH Manager Pro
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>🚀</Text>
          <Text style={styles.cardTitle}>Dashboard en construction</Text>
          <Text style={styles.cardText}>
            Les fonctionnalités seront ajoutées prochainement
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Informations du compte</Text>
          <Text style={styles.infoText}>Email: {userProfile?.email}</Text>
          <Text style={styles.infoText}>Téléphone: {userProfile?.phone || 'Non renseigné'}</Text>
          <Text style={styles.infoText}>Congés restants: {userProfile?.congesRestants} jours</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: COLORS.textWhite,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});