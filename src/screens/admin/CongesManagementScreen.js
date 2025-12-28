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
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  FIREBASE_COLLECTIONS,
  CONGE_STATUS,
  CONGE_STATUS_LABELS,
  CONGE_STATUS_COLORS,
  CONGE_TYPE_LABELS,
} from "../../utils/constants";

export default function CongesManagementScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [conges, setConges] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    loadConges();
  }, []);

  const loadConges = async () => {
    try {
      const congesRef = collection(db, FIREBASE_COLLECTIONS.CONGES);
      const q = query(congesRef, orderBy("createdAt", "desc"));

      const snapshot = await getDocs(q);
      const congesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setConges(congesData);
    } catch (error) {
      console.error("Erreur chargement congés:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConges();
    setRefreshing(false);
  };

  const getFilteredConges = () => {
    switch (filter) {
      case "pending":
        return conges.filter((c) => c.status === CONGE_STATUS.EN_ATTENTE);
      case "approved":
        return conges.filter((c) => c.status === CONGE_STATUS.VALIDE);
      case "rejected":
        return conges.filter((c) => c.status === CONGE_STATUS.REFUSE);
      default:
        return conges;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };

  const filteredConges = getFilteredConges();

  const stats = {
    total: conges.length,
    pending: conges.filter((c) => c.status === CONGE_STATUS.EN_ATTENTE).length,
    approved: conges.filter((c) => c.status === CONGE_STATUS.VALIDE).length,
    rejected: conges.filter((c) => c.status === CONGE_STATUS.REFUSE).length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestion Congés</Text>
        <Text style={styles.headerSubtitle}>
          {conges.length} demandes totales
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={[styles.statChip, filter === "all" && styles.statChipActive]}
          onPress={() => setFilter("all")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.statChipText,
              filter === "all" && styles.statChipTextActive,
            ]}
          >
            Tous ({stats.total})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statChip,
            filter === "pending" && styles.statChipActive,
          ]}
          onPress={() => setFilter("pending")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.statChipText,
              filter === "pending" && styles.statChipTextActive,
            ]}
          >
            En attente ({stats.pending})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statChip,
            filter === "approved" && styles.statChipActive,
          ]}
          onPress={() => setFilter("approved")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.statChipText,
              filter === "approved" && styles.statChipTextActive,
            ]}
          >
            Validés ({stats.approved})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statChip,
            filter === "rejected" && styles.statChipActive,
          ]}
          onPress={() => setFilter("rejected")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.statChipText,
              filter === "rejected" && styles.statChipTextActive,
            ]}
          >
            Refusés ({stats.rejected})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredConges.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="calendar-outline"
              size={64}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyText}>Aucune demande</Text>
          </View>
        ) : (
          filteredConges.map((conge) => (
            <CongeAdminCard
              key={conge.id}
              conge={conge}
              formatDate={formatDate}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// Component: Conge Admin Card
function CongeAdminCard({ conge, formatDate }) {
  const statusColor = CONGE_STATUS_COLORS[conge.status];

  return (
    <TouchableOpacity style={styles.congeCard} activeOpacity={0.7}>
      <View style={styles.congeHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.userName}>{conge.userName}</Text>
            <Text style={styles.congeType}>
              {CONGE_TYPE_LABELS[conge.type]}
            </Text>
          </View>
        </View>

        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {CONGE_STATUS_LABELS[conge.status]}
          </Text>
        </View>
      </View>

      <View style={styles.congeBody}>
        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.infoText}>
            {formatDate(conge.dateDebut)} → {formatDate(conge.dateFin)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="time-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.infoText}>{conge.nbJours} jours</Text>
        </View>

        {conge.motif && (
          <Text style={styles.motif} numberOfLines={2}>
            "{conge.motif}"
          </Text>
        )}

        {conge.validationComment && (
          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Commentaire:</Text>
            <Text style={styles.commentText}>{conge.validationComment}</Text>
          </View>
        )}
      </View>

      <View style={styles.congeFooter}>
        <Text style={styles.footerText}>
          Créé le {new Date(conge.createdAt).toLocaleDateString("fr-FR")}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
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
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
  statChipTextActive: {
    color: COLORS.textWhite,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  congeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  congeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
  },
  congeType: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  congeBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
  },
  motif: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    marginTop: 4,
  },
  commentContainer: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  commentLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.text,
  },
  congeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
