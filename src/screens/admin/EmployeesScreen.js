import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { FIREBASE_COLLECTIONS, ROLE_LABELS } from "../../utils/constants";

export default function EmployeesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const usersSnapshot = await getDocs(
        collection(db, FIREBASE_COLLECTIONS.USERS)
      );
      const employeesData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesData);
    } catch (error) {
      console.error("Erreur chargement employés:", error);
      Alert.alert("Erreur", "Impossible de charger les employés");
    }
  };

  const toggleActiveStatus = async (employee) => {
    try {
      const userRef = doc(db, FIREBASE_COLLECTIONS.USERS, employee.id);
      await updateDoc(userRef, {
        active: !employee.active,
      });

      Alert.alert(
        "Succès",
        `Employé ${employee.active ? "désactivé" : "activé"}`,
        [{ text: "OK", onPress: loadEmployees }]
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de modifier le statut");
      console.error("Erreur toggle status:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmployees();
    setRefreshing(false);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      `${emp.firstName} ${emp.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Employés</Text>
        <Text style={styles.headerSubtitle}>{employees.length} employés</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un employé..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredEmployees.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={64}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyText}>Aucun employé trouvé</Text>
          </View>
        ) : (
          filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onToggleStatus={() => toggleActiveStatus(employee)}
            />
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={COLORS.textWhite} />
      </TouchableOpacity>
    </View>
  );
}

// Component: Employee Card
function EmployeeCard({ employee, onToggleStatus }) {
  return (
    <View style={styles.employeeCard}>
      <View style={styles.employeeHeader}>
        <View style={styles.employeeAvatar}>
          <Ionicons name="person" size={24} color={COLORS.primary} />
        </View>

        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>
            {employee.firstName} {employee.lastName}
          </Text>
          <Text style={styles.employeeRole}>{ROLE_LABELS[employee.role]}</Text>
          <Text style={styles.employeeEmail}>{employee.email}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: employee.active
                ? COLORS.success + "15"
                : COLORS.error + "15",
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: employee.active ? COLORS.success : COLORS.error },
            ]}
          >
            {employee.active ? "Actif" : "Inactif"}
          </Text>
        </View>
      </View>

      <View style={styles.employeeStats}>
        <View style={styles.statItem}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.statText}>
            {employee.congesRestants}j restants
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="briefcase-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.statText}>{employee.department || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.employeeActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onToggleStatus}
          activeOpacity={0.7}
        >
          <Ionicons
            name={
              employee.active
                ? "close-circle-outline"
                : "checkmark-circle-outline"
            }
            size={20}
            color={employee.active ? COLORS.error : COLORS.success}
          />
          <Text
            style={[
              styles.actionButtonText,
              { color: employee.active ? COLORS.error : COLORS.success },
            ]}
          >
            {employee.active ? "Désactiver" : "Activer"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>
            Modifier
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  employeeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  employeeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  employeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 2,
  },
  employeeRole: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  employeeEmail: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  employeeStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  employeeActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
