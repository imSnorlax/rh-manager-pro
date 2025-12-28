import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FIREBASE_COLLECTIONS, POINTAGE_TYPES } from '../../utils/constants';

export default function HomeScreen() {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [todayPointage, setTodayPointage] = useState(null);
  const [stats, setStats] = useState({
    congesRestants: 0,
    pointagesMonth: 0,
    congesPending: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Stats basiques
      setStats({
        congesRestants: userProfile?.congesRestants || 0,
        pointagesMonth: 12, // TODO: calculer vraiment
        congesPending: 0, // TODO: fetch depuis Firestore
      });

      // Charger pointage du jour
      await loadTodayPointage();
    } catch (error) {
      console.error('Erreur chargement data:', error);
    }
  };

  const loadTodayPointage = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const pointagesRef = collection(db, FIREBASE_COLLECTIONS.POINTAGES);
      const q = query(
        pointagesRef,
        where('userId', '==', userProfile?.uid),
        where('timestamp', '>=', today.toISOString()),
        orderBy('timestamp', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setTodayPointage(snapshot.docs[0].data());
      }
    } catch (error) {
      console.error('Erreur chargement pointage:', error);
    }
  };

  const handlePointage = async (type) => {
    try {
      const pointageData = {
        userId: userProfile?.uid,
        type: type,
        timestamp: new Date().toISOString(),
        location: null, // TODO: ajouter geolocation
        isValid: true,
      };

      await addDoc(collection(db, FIREBASE_COLLECTIONS.POINTAGES), pointageData);
      
      Alert.alert(
        'Succès',
        type === POINTAGE_TYPES.CHECK_IN ? 'Check-in enregistré!' : 'Check-out enregistré!',
        [{ text: 'OK', onPress: loadTodayPointage }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer le pointage');
      console.error('Erreur pointage:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Bonjour';
    if (hour < 18) return '☀️ Bon après-midi';
    return '🌙 Bonsoir';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>
            {userProfile?.firstName} {userProfile?.lastName}
          </Text>
        </View>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={32} color={COLORS.primary} />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="calendar-outline"
          label="Congés restants"
          value={`${stats.congesRestants} jours`}
          color={COLORS.success}
        />
        <StatCard
          icon="time-outline"
          label="Pointages ce mois"
          value={stats.pointagesMonth}
          color={COLORS.primary}
        />
      </View>

      {/* Pointage Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="finger-print" size={24} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Pointage du jour</Text>
        </View>

        {todayPointage ? (
          <View style={styles.pointageInfo}>
            <Text style={styles.pointageText}>
              Dernier pointage: {todayPointage.type === 'check-in' ? 'Entrée' : 'Sortie'}
            </Text>
            <Text style={styles.pointageTime}>
              {new Date(todayPointage.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ) : (
          <Text style={styles.noPointageText}>Aucun pointage aujourd'hui</Text>
        )}

        <View style={styles.pointageButtons}>
          <TouchableOpacity
            style={[styles.pointageButton, styles.checkInButton]}
            onPress={() => handlePointage(POINTAGE_TYPES.CHECK_IN)}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={24} color={COLORS.textWhite} />
            <Text style={styles.pointageButtonText}>Check-in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pointageButton, styles.checkOutButton]}
            onPress={() => handlePointage(POINTAGE_TYPES.CHECK_OUT)}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={24} color={COLORS.textWhite} />
            <Text style={styles.pointageButtonText}>Check-out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.actionsContainer}>
        <ActionCard
          icon="calendar-outline"
          label="Demander un congé"
          color={COLORS.primary}
          onPress={() => Alert.alert('Info', 'Aller dans l\'onglet Congés')}
        />
        <ActionCard
          icon="document-text-outline"
          label="Mes documents"
          color={COLORS.accent}
          onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
        />
      </View>
    </ScrollView>
  );
}

// Component: Stat Card
function StatCard({ icon, label, value, color }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Component: Action Card
function ActionCard({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={28} color={COLORS.textWhite} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 10,
  },
  pointageInfo: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pointageText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  pointageTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  noPointageText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  pointageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pointageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkInButton: {
    backgroundColor: COLORS.success,
  },
  checkOutButton: {
    backgroundColor: COLORS.error,
  },
  pointageButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});