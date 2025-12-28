import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/colors';
import { ROLE_LABELS } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FIREBASE_COLLECTIONS } from '../../utils/constants';

export default function ProfileScreen() {
  const { userProfile, logout, refreshProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    phone: userProfile?.phone || '',
  });

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      if (!editData.firstName.trim() || !editData.lastName.trim()) {
        Alert.alert('Erreur', 'Le prénom et nom sont obligatoires');
        return;
      }

      const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, userProfile?.uid);
      await updateDoc(userRef, {
        firstName: editData.firstName.trim(),
        lastName: editData.lastName.trim(),
        phone: editData.phone.trim(),
      });

      await refreshProfile();
      setShowEditModal(false);
      Alert.alert('Succès', 'Profil mis à jour!');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
      console.error('Erreur update profil:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.userName}>
          {userProfile?.firstName} {userProfile?.lastName}
        </Text>
        <Text style={styles.userRole}>{ROLE_LABELS[userProfile?.role]}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Info Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            <TouchableOpacity
              onPress={() => {
                setEditData({
                  firstName: userProfile?.firstName || '',
                  lastName: userProfile?.lastName || '',
                  phone: userProfile?.phone || '',
                });
                setShowEditModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <InfoRow icon="mail" label="Email" value={userProfile?.email} />
          <InfoRow icon="call" label="Téléphone" value={userProfile?.phone || 'Non renseigné'} />
          <InfoRow icon="briefcase" label="Département" value={userProfile?.department || 'Non renseigné'} />
          <InfoRow icon="medal" label="Poste" value={userProfile?.position || 'Non renseigné'} />
        </View>

        {/* Stats Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          
          <StatItem
            icon="calendar"
            label="Congés restants"
            value={`${userProfile?.congesRestants || 0} jours`}
            color={COLORS.success}
          />
          <StatItem
            icon="time"
            label="Membre depuis"
            value={userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'N/A'}
            color={COLORS.primary}
          />
          <StatItem
            icon={userProfile?.active ? 'checkmark-circle' : 'close-circle'}
            label="Statut du compte"
            value={userProfile?.active ? 'Actif' : 'Inactif'}
            color={userProfile?.active ? COLORS.success : COLORS.error}
          />
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <ActionButton
            icon="document-text-outline"
            label="Mes documents"
            onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
          />
          <ActionButton
            icon="notifications-outline"
            label="Notifications"
            onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
          />
          <ActionButton
            icon="settings-outline"
            label="Paramètres"
            onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
          />
          <ActionButton
            icon="help-circle-outline"
            label="Aide & Support"
            onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre prénom"
              placeholderTextColor={COLORS.textLight}
              value={editData.firstName}
              onChangeText={(text) => setEditData({ ...editData, firstName: text })}
            />

            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom"
              placeholderTextColor={COLORS.textLight}
              value={editData.lastName}
              onChangeText={(text) => setEditData({ ...editData, lastName: text })}
            />

            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="+212 6XX XXX XXX"
              placeholderTextColor={COLORS.textLight}
              value={editData.phone}
              onChangeText={(text) => setEditData({ ...editData, phone: text })}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// Component: Info Row
function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={20} color={COLORS.textSecondary} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// Component: Stat Item
function StatItem({ icon, label, value, color }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

// Component: Action Button
function ActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionLeft}>
        <Ionicons name={icon} size={24} color={COLORS.text} />
        <Text style={styles.actionLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
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
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.textWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: COLORS.textWhite,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
    flex: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
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
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});