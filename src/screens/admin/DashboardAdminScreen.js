import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";
import { useAuth } from "../../context/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import { FIREBASE_COLLECTIONS, CONGE_STATUS } from "../../utils/constants";

export default function DashboardAdminScreen() {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingConges: 0,
    totalPointages: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Total employees
      const usersSnapshot = await getDocs(
        collection(db, FIREBASE_COLLECTIONS.USERS)
      );
      const totalEmployees = usersSnapshot.size;
      const activeEmployees = usersSnapshot.docs.filter(
        (doc) => doc.data().active
      ).length;

      // Pending congés
      const congesRef = collection(db, FIREBASE_COLLECTIONS.CONGES);
      const pendingQuery = query(
        congesRef,
        where("status", "==", CONGE_STATUS.EN_ATTENTE)
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingConges = pendingSnapshot.size;

      // Total pointages
      const pointagesSnapshot = await getDocs(
        collection(db, FIREBASE_COLLECTIONS.POINTAGES)
      );
      const totalPointages = pointagesSnapshot.size;

      setStats({
        totalEmployees,
        activeEmployees,
        pendingConges,
        totalPointages,
      });
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
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
          <Text style={styles.greeting}>👋 Bonjour Admin</Text>
          <Text style={styles.userName}>
            {userProfile?.firstName} {userProfile?.lastName}
          </Text>
        </View>
        <View style={styles.avatarContainer}>
          <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="people"
          label="Total Employés"
          value={stats.totalEmployees}
          color={COLORS.primary}
        />
        <StatCard
          icon="checkmark-circle"
          label="Employés Actifs"
          value={stats.activeEmployees}
          color={COLORS.success}
        />
        <StatCard
          icon="time"
          label="Congés en attente"
          value={stats.pendingConges}
          color={COLORS.warning}
        />
        <StatCard
          icon="finger-print"
          label="Total Pointages"
          value={stats.totalPointages}
          color={COLORS.accent}
        />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.actionsContainer}>
        <ActionCard
          icon="person-add"
          label="Ajouter Employé"
          color={COLORS.primary}
          onPress={() => {}}
        />
        <ActionCard
          icon="document-text"
          label="Générer Rapport"
          color={COLORS.accent}
          onPress={() => {}}
        />
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Activité récente</Text>
      <View style={styles.activityCard}>
        <View style={styles.activityItem}>
          <Ionicons name="person-add" size={20} color={COLORS.success} />
          <Text style={styles.activityText}>3 nouveaux employés ce mois</Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
          <Text style={styles.activityText}>
            12 demandes de congés traitées
          </Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="stats-chart" size={20} color={COLORS.warning} />
          <Text style={styles.activityText}>156 pointages cette semaine</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// Component: Stat Card
function StatCard({ icon, label, value, color }) {
  return (
    <View style={styles.statCard}>
      <View
        style={[styles.statIconContainer, { backgroundColor: color + "15" }]}
      >
        <Ionicons name={icon} size={24} color={color} />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.text,
  },
});
