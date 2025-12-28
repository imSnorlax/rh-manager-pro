import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";
import { useAuth } from "../../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { FIREBASE_COLLECTIONS, ROLE_LABELS } from "../../utils/constants";

export default function TeamScreen() {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      // Récupérer les employés dont le managerId correspond au user actuel
      const usersRef = collection(db, FIREBASE_COLLECTIONS.USERS);
      const q = query(usersRef, where("managerId", "==", userProfile?.uid));

      const snapshot = await getDocs(q);
      const teamData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTeam(teamData);
    } catch (error) {
      console.error("Erreur chargement équipe:", error);
      Alert.alert("Erreur", "Impossible de charger l'équipe");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeam();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Équipe</Text>
        <Text style={styles.headerSubtitle}>{team.length} membres</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {team.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={64}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyText}>Aucun membre dans votre équipe</Text>
            <Text style={styles.emptySubtext}>
              Les employés dont vous êtes le manager apparaîtront ici
            </Text>
          </View>
        ) : (
          team.map((member) => <MemberCard key={member.id} member={member} />)
        )}
      </ScrollView>
    </View>
  );
}

// Component: Member Card
function MemberCard({ member }) {
  return (
    <TouchableOpacity style={styles.memberCard} activeOpacity={0.7}>
      <View style={styles.memberAvatar}>
        <Ionicons name="person" size={28} color={COLORS.primary} />
      </View>

      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {member.firstName} {member.lastName}
        </Text>
        <Text style={styles.memberRole}>{ROLE_LABELS[member.role]}</Text>
        <Text style={styles.memberDepartment}>
          {member.department || "N/A"}
        </Text>
      </View>

      <View style={styles.memberStats}>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeText}>{member.congesRestants}j</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={COLORS.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  memberDepartment: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  memberStats: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  statBadge: {
    backgroundColor: COLORS.success + "15",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.success,
  },
});
