import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../utils/colors';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    // Simuler chargement - après 2 secondes → Login
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🏢</Text>
        <Text style={styles.title}>RH Manager Pro</Text>
        <Text style={styles.subtitle}>Gestion des Ressources Humaines</Text>
        
        <ActivityIndicator 
          size="large" 
          color={COLORS.textWhite} 
          style={styles.loader}
        />
      </View>
      
      <Text style={styles.footer}>Version 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textWhite,
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loader: {
    marginTop: 40,
  },
  footer: {
    fontSize: 14,
    color: COLORS.textWhite,
    opacity: 0.7,
    marginBottom: 40,
  },
});