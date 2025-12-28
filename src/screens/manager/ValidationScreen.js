import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  FIREBASE_COLLECTIONS,
  CONGE_STATUS,
  CONGE_STATUS_LABELS,
  CONGE_STATUS_COLORS,
  CONGE_TYPE_LABELS,
} from "../../utils/constants";

export default function ValidationScreen() {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [pendingConges, setPendingConges] = useState([]);
  const [selectedConge, setSelectedConge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");
  const [actionType, setActionType] = useState(""); // 'validate' or 'refuse'

  useEffect(() => {
    loadPendingConges();
  }, []);

  const loadPendingConges = async () => {
    try {
      // TODO: Améliorer pour récupérer seulement les congés de son équipe
      const congesRef = collection(db, FIREBASE_COLLECTIONS.CONGES);
      const q = query(
        congesRef,
        where("status", "==", CONGE_STATUS.EN_ATTENTE)
      );

      const snapshot = await getDocs(q);
      const congesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPendingConges(congesData);
    } catch (error) {
      console.error("Erreur chargement congés:", error);
    }
  };

  const handleValidation = (conge, action) => {
    setSelectedConge(conge);
    setActionType(action);
    setComment("");
    setShowModal(true);
  };

  const confirmAction = async () => {
    try {
      const newStatus =
        actionType === "validate" ? CONGE_STATUS.VALIDE : CONGE_STATUS.REFUSE;

      const congeRef = doc(db, FIREBASE_COLLECTIONS.CONGES, selectedConge.id);
      await updateDoc(congeRef, {
        status: newStatus,
        validatedBy: userProfile?.uid,
        validationComment: comment.trim(),
        validatedAt: new Date().toISOString(),
      });

      Alert.alert(
        "Succès",
        actionType === "validate" ? "Congé validé!" : "Congé refusé",
        [
          {
            text: "OK",
            onPress: () => {
              setShowModal(false);
              loadPendingConges();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de traiter la demande");
      console.error("Erreur validation:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingConges();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Validation</Text>
        <Text style={styles.headerSubtitle}>
          {pendingConges.length} demande{pendingConges.length > 1 ? "s" : ""} en
          attente
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {pendingConges.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-done-outline"
              size={64}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyText}>Aucune demande en attente</Text>
            <Text style={styles.emptySubtext}>
              Les nouvelles demandes apparaîtront ici
            </Text>
          </View>
        ) : (
          pendingConges.map((conge) => (
            <CongeValidationCard
              key={conge.id}
              conge={conge}
              formatDate={formatDate}
              onValidate={() => handleValidation(conge, "validate")}
              onRefuse={() => handleValidation(conge, "refuse")}
            />
          ))
        )}
      </ScrollView>

      {/* Validation Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === "validate"
                ? "Valider la demande"
                : "Refuser la demande"}
            </Text>

            <Text style={styles.modalSubtitle}>
              {selectedConge?.userName} • {selectedConge?.nbJours} jours
            </Text>

            <TextInput
              style={styles.commentInput}
              placeholder="Commentaire (optionnel)"
              placeholderTextColor={COLORS.textLight}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  {
                    backgroundColor:
                      actionType === "validate" ? COLORS.success : COLORS.error,
                  },
                ]}
                onPress={confirmAction}
              >
                <Text style={styles.confirmButtonText}>
                  {actionType === "validate" ? "Valider" : "Refuser"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Component: Conge Validation Card
function CongeValidationCard({ conge, formatDate, onValidate, onRefuse }) {
  return (
    <View style={styles.congeCard}>
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
        <View style={styles.daysBadge}>
          <Text style={styles.daysText}>{conge.nbJours}j</Text>
        </View>
      </View>

      <View style={styles.congeBody}>
        <View style={styles.dateRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.dateText}>
            {formatDate(conge.dateDebut)} → {formatDate(conge.dateFin)}
          </Text>
        </View>

        {conge.motif && (
          <Text style={styles.motif} numberOfLines={2}>
            "{conge.motif}"
          </Text>
        )}
      </View>

      <View style={styles.congeActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.refuseButton]}
          onPress={onRefuse}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={COLORS.error} />
          <Text style={[styles.actionButtonText, { color: COLORS.error }]}>
            Refuser
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.validateButton]}
          onPress={onValidate}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={20} color={COLORS.success} />
          <Text style={[styles.actionButtonText, { color: COLORS.success }]}>
            Valider
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  congeType: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  daysBadge: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  daysText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  congeBody: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text,
  },
  motif: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  congeActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  refuseButton: {
    backgroundColor: COLORS.error + "15",
  },
  validateButton: {
    backgroundColor: COLORS.success + "15",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 80,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textWhite,
  },
});
