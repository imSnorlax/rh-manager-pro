import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  FIREBASE_COLLECTIONS,
  CONGE_STATUS,
  ROLES,
} from "../../utils/constants";

const { width } = Dimensions.get("window");

export default function StatsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    users: {
      total: 0,
      employees: 0,
      managers: 0,
      admins: 0,
      active: 0,
      inactive: 0,
    },
    conges: { total: 0, pending: 0, approved: 0, rejected: 0, totalDays: 0 },
    pointages: { total: 0, thisMonth: 0, today: 0 },
  });

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      // Users Stats
      const usersSnapshot = await getDocs(
        collection(db, FIREBASE_COLLECTIONS.USERS)
      );
      const users = usersSnapshot.docs.map((doc) => doc.data());

      const userStats = {
        total: users.length,
        employees: users.filter((u) => u.role === ROLES.EMPLOYEE).length,
        managers: users.filter((u) => u.role === ROLES.MANAGER).length,
        admins: users.filter((u) => u.role === ROLES.ADMIN).length,
        active: users.filter((u) => u.active).length,
        inactive: users.filter((u) => !u.active).length,
      };

      // Congés Stats
      const congesSnapshot = await getDocs(
        collection(db, FIREBASE_COLLECTIONS.CONGES)
      );
      const conges = congesSnapshot.docs.map((doc) => doc.data());

      const congeStats = {
        total: conges.length,
        pending: conges.filter((c) => c.status === CONGE_STATUS.EN_ATTENTE)
          .length,
        approved: conges.filter((c) => c.status === CONGE_STATUS.VALIDE).length,
        rejected: conges.filter((c) => c.status === CONGE_STATUS.REFUSE).length,
        totalDays: conges.reduce((sum, c) => sum + (c.nbJours || 0), 0),
      };

      // Pointages Stats
      const pointagesSnapshot = await getDocs(
        collection(db, FIREBASE_COLLECTIONS.POINTAGES)
      );
      const pointages = pointagesSnapshot.docs.map((doc) => doc.data());

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));

      const pointageStats = {
        total: pointages.length,
        thisMonth: pointages.filter(
          (p) => new Date(p.timestamp) >= startOfMonth
        ).length,
        today: pointages.filter((p) => new Date(p.timestamp) >= startOfDay)
          .length,
      };

      setStats({
        users: userStats,
        conges: congeStats,
        pointages: pointageStats,
      });
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllStats();
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
        <Ionicons name="stats-chart" size={32} color={COLORS.primary} />
        <Text style={styles.headerTitle}>Statistiques</Text>
        <Text style={styles.headerSubtitle}>
          Vue d'ensemble de l'entreprise
        </Text>
      </View>

      {/* Users Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Utilisateurs</Text>

        <View style={styles.bigStatCard}>
          <Text style={styles.bigStatValue}>{stats.users.total}</Text>
          <Text style={styles.bigStatLabel}>Total Utilisateurs</Text>
        </View>

        <View style={styles.statsGrid}>
          <MiniStatCard
            icon="person"
            label="Employés"
            value={stats.users.employees}
            color={COLORS.primary}
          />
          <MiniStatCard
            icon="people"
            label="Managers"
            value={stats.users.managers}
            color={COLORS.accent}
          />
          <MiniStatCard
            icon="checkmark-circle"
            label="Actifs"
            value={stats.users.active}
            color={COLORS.success}
          />
          <MiniStatCard
            icon="close-circle"
            label="Inactifs"
            value={stats.users.inactive}
            color={COLORS.error}
          />
        </View>
      </View>

      {/* Congés Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Congés</Text>

        <View style={styles.bigStatCard}>
          <Text style={styles.bigStatValue}>{stats.conges.totalDays}</Text>
          <Text style={styles.bigStatLabel}>Jours de congés totaux</Text>
        </View>

        <View style={styles.statsGrid}>
          <MiniStatCard
            icon="calendar"
            label="Total demandes"
            value={stats.conges.total}
            color={COLORS.primary}
          />
          <MiniStatCard
            icon="time"
            label="En attente"
            value={stats.conges.pending}
            color={COLORS.warning}
          />
          <MiniStatCard
            icon="checkmark"
            label="Validés"
            value={stats.conges.approved}
            color={COLORS.success}
          />
          <MiniStatCard
            icon="close"
            label="Refusés"
            value={stats.conges.rejected}
            color={COLORS.error}
          />
        </View>
      </View>

      {/* Pointages Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🖐️ Pointages</Text>

        <View style={styles.bigStatCard}>
          <Text style={styles.bigStatValue}>{stats.pointages.total}</Text>
          <Text style={styles.bigStatLabel}>Total Pointages</Text>
        </View>

        <View style={styles.statsGrid}>
          <MiniStatCard
            icon="today"
            label="Aujourd'hui"
            value={stats.pointages.today}
            color={COLORS.success}
          />
          <MiniStatCard
            icon="calendar"
            label="Ce mois"
            value={stats.pointages.thisMonth}
            color={COLORS.primary}
          />
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 Résumé</Text>
        <SummaryRow
          icon="people"
          label="Taux d'activité"
          value={`${Math.round(
            (stats.users.active / stats.users.total) * 100 || 0
          )}%`}
        />
        <SummaryRow
          icon="calendar"
          label="Congés en attente"
          value={stats.conges.pending}
        />
        <SummaryRow
          icon="finger-print"
          label="Pointages/jour (moy)"
          value={Math.round(stats.pointages.total / 30)}
        />
      </View>
    </ScrollView>
  );
}

// Component: Mini Stat Card
function MiniStatCard({ icon, label, value, color }) {
  return (
    <View style={styles.miniStatCard}>
      <View style={[styles.miniStatIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

// Component: Summary Row
function SummaryRow({ icon, label, value }) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryLeft}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
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
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  bigStatCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bigStatValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  bigStatLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  miniStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});
