import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  FIREBASE_COLLECTIONS, 
  CONGE_TYPES, 
  CONGE_TYPE_LABELS,
  CONGE_STATUS,
  CONGE_STATUS_LABELS,
  CONGE_STATUS_COLORS,
} from '../../utils/constants';

export default function CongesScreen() {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [conges, setConges] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    dateDebut: '',
    dateFin: '',
    type: CONGE_TYPES.PAYE,
    motif: '',
  });
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  useEffect(() => {
    loadConges();
  }, []);

  const loadConges = async () => {
    try {
      const congesRef = collection(db, FIREBASE_COLLECTIONS.CONGES);
      const q = query(
        congesRef,
        where('userId', '==', userProfile?.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const congesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setConges(congesData);
    } catch (error) {
      console.error('Erreur chargement congés:', error);
    }
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.dateDebut || !formData.dateFin) {
      Alert.alert('Erreur', 'Veuillez sélectionner les dates');
      return;
    }

    if (new Date(formData.dateFin) < new Date(formData.dateDebut)) {
      Alert.alert('Erreur', 'La date de fin doit être après la date de début');
      return;
    }

    if (!formData.motif.trim()) {
      Alert.alert('Erreur', 'Veuillez indiquer un motif');
      return;
    }

    try {
      const nbJours = calculateDays(formData.dateDebut, formData.dateFin);

      const congeData = {
        userId: userProfile?.uid,
        userName: `${userProfile?.firstName} ${userProfile?.lastName}`,
        type: formData.type,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        nbJours: nbJours,
        motif: formData.motif.trim(),
        status: CONGE_STATUS.EN_ATTENTE,
        validatedBy: null,
        validationComment: '',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, FIREBASE_COLLECTIONS.CONGES), congeData);

      Alert.alert('Succès', 'Demande de congé envoyée!', [
        { 
          text: 'OK', 
          onPress: () => {
            setShowModal(false);
            resetForm();
            loadConges();
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande');
      console.error('Erreur demande congé:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      dateDebut: '',
      dateFin: '',
      type: CONGE_TYPES.PAYE,
      motif: '',
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConges();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Congés</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Solde Card */}
        <View style={styles.soldeCard}>
          <View style={styles.soldeIconContainer}>
            <Ionicons name="calendar" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.soldeInfo}>
            <Text style={styles.soldeLabel}>Congés restants</Text>
            <Text style={styles.soldeValue}>{userProfile?.congesRestants || 0} jours</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color={COLORS.textWhite} />
          </TouchableOpacity>
        </View>

        {/* Liste des congés */}
        <Text style={styles.sectionTitle}>Mes demandes</Text>
        
        {conges.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Aucune demande de congé</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.emptyButtonText}>Faire une demande</Text>
            </TouchableOpacity>
          </View>
        ) : (
          conges.map((conge) => (
            <CongeCard key={conge.id} conge={conge} formatDate={formatDate} />
          ))
        )}
      </ScrollView>

      {/* Modal Demande Congé */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Demander un congé</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Type de congé */}
            <Text style={styles.label}>Type de congé *</Text>
            <View style={styles.typeContainer}>
              {Object.values(CONGE_TYPES).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {CONGE_TYPE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date début */}
            <Text style={styles.label}>Date de début *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartCalendar(!showStartCalendar)}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateButtonText}>
                {formData.dateDebut ? formatDate(formData.dateDebut) : 'Sélectionner'}
              </Text>
            </TouchableOpacity>

            {showStartCalendar && (
              <Calendar
                onDayPress={(day) => {
                  setFormData({ ...formData, dateDebut: day.dateString });
                  setShowStartCalendar(false);
                }}
                markedDates={{
                  [formData.dateDebut]: { selected: true, selectedColor: COLORS.primary },
                }}
                theme={{
                  todayTextColor: COLORS.primary,
                  selectedDayBackgroundColor: COLORS.primary,
                }}
              />
            )}

            {/* Date fin */}
            <Text style={styles.label}>Date de fin *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndCalendar(!showEndCalendar)}
            >
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateButtonText}>
                {formData.dateFin ? formatDate(formData.dateFin) : 'Sélectionner'}
              </Text>
            </TouchableOpacity>

            {showEndCalendar && (
              <Calendar
                onDayPress={(day) => {
                  setFormData({ ...formData, dateFin: day.dateString });
                  setShowEndCalendar(false);
                }}
                markedDates={{
                  [formData.dateFin]: { selected: true, selectedColor: COLORS.primary },
                }}
                minDate={formData.dateDebut}
                theme={{
                  todayTextColor: COLORS.primary,
                  selectedDayBackgroundColor: COLORS.primary,
                }}
              />
            )}

            {/* Nombre de jours */}
            {formData.dateDebut && formData.dateFin && (
              <View style={styles.daysInfo}>
                <Text style={styles.daysText}>
                  Durée: {calculateDays(formData.dateDebut, formData.dateFin)} jours
                </Text>
              </View>
            )}

            {/* Motif */}
            <Text style={styles.label}>Motif *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Raison de votre demande..."
              placeholderTextColor={COLORS.textLight}
              value={formData.motif}
              onChangeText={(text) => setFormData({ ...formData, motif: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Envoyer la demande</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// Component: Conge Card
function CongeCard({ conge, formatDate }) {
  const statusColor = CONGE_STATUS_COLORS[conge.status];

  return (
    <View style={styles.congeCard}>
      <View style={styles.congeHeader}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {CONGE_STATUS_LABELS[conge.status]}
          </Text>
        </View>
        <Text style={styles.congeType}>{CONGE_TYPE_LABELS[conge.type]}</Text>
      </View>

      <View style={styles.congeBody}>
        <View style={styles.congeDate}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.congeDateText}>
            {formatDate(conge.dateDebut)} → {formatDate(conge.dateFin)}
          </Text>
        </View>
        <Text style={styles.congeDays}>{conge.nbJours} jours</Text>
      </View>

      {conge.motif && (
        <Text style={styles.congeMotif} numberOfLines={2}>
          {conge.motif}
        </Text>
      )}

      {conge.validationComment && (
        <View style={styles.commentContainer}>
          <Text style={styles.commentLabel}>Commentaire:</Text>
          <Text style={styles.commentText}>{conge.validationComment}</Text>
        </View>
      )}
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
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  soldeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  soldeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  soldeInfo: {
    flex: 1,
  },
  soldeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  soldeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '600',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  congeType: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  congeBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  congeDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  congeDateText: {
    fontSize: 14,
    color: COLORS.text,
  },
  congeDays: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  congeMotif: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  commentContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.text,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  daysInfo: {
    backgroundColor: COLORS.primary + '15',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  daysText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});