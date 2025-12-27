// Rôles utilisateurs
export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin',
};

// Labels des rôles (pour affichage)
export const ROLE_LABELS = {
  [ROLES.EMPLOYEE]: 'Employé',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.ADMIN]: 'Administrateur RH',
};

// Statuts des demandes de congés
export const CONGE_STATUS = {
  EN_ATTENTE: 'en_attente',
  VALIDE: 'validé',
  REFUSE: 'refusé',
};

// Labels des statuts
export const CONGE_STATUS_LABELS = {
  [CONGE_STATUS.EN_ATTENTE]: 'En attente',
  [CONGE_STATUS.VALIDE]: 'Validé',
  [CONGE_STATUS.REFUSE]: 'Refusé',
};

// Couleurs des statuts
export const CONGE_STATUS_COLORS = {
  [CONGE_STATUS.EN_ATTENTE]: '#F59E0B',
  [CONGE_STATUS.VALIDE]: '#10B981',
  [CONGE_STATUS.REFUSE]: '#EF4444',
};

// Types de congés
export const CONGE_TYPES = {
  PAYE: 'payé',
  MALADIE: 'maladie',
  SANS_SOLDE: 'sans_solde',
};

// Labels des types
export const CONGE_TYPE_LABELS = {
  [CONGE_TYPES.PAYE]: 'Congé Payé',
  [CONGE_TYPES.MALADIE]: 'Congé Maladie',
  [CONGE_TYPES.SANS_SOLDE]: 'Sans Solde',
};

// Types de pointage
export const POINTAGE_TYPES = {
  CHECK_IN: 'check-in',
  CHECK_OUT: 'check-out',
};

// Nombre de jours de congés par défaut
export const DEFAULT_CONGES_RESTANTS = 22;

// Départements
export const DEPARTEMENTS = [
  { id: 'dev', label: 'Développement' },
  { id: 'rh', label: 'Ressources Humaines' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'ventes', label: 'Ventes' },
  { id: 'finance', label: 'Finance' },
  { id: 'support', label: 'Support Client' },
];

// Postes/Titres
export const POSTES = [
  'Développeur',
  'Designer',
  'Chef de Projet',
  'Manager',
  'Directeur',
  'Assistant RH',
  'Responsable RH',
  'Commercial',
  'Comptable',
];

// Messages d'erreur communs
export const ERROR_MESSAGES = {
  NETWORK: 'Erreur de connexion. Vérifiez votre connexion internet.',
  AUTH_FAILED: 'Email ou mot de passe incorrect.',
  EMAIL_EXISTS: 'Cet email est déjà utilisé.',
  WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 6 caractères.',
  REQUIRED_FIELD: 'Ce champ est obligatoire.',
  INVALID_EMAIL: 'Email invalide.',
  UNKNOWN: 'Une erreur est survenue. Réessayez plus tard.',
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  LOGIN: 'Connexion réussie!',
  REGISTER: 'Inscription réussie!',
  CONGE_CREATED: 'Demande de congé envoyée!',
  CONGE_VALIDATED: 'Demande validée avec succès!',
  CONGE_REFUSED: 'Demande refusée.',
  POINTAGE_SUCCESS: 'Pointage enregistré!',
  PROFILE_UPDATED: 'Profil mis à jour!',
};

// Configuration Firebase (sera rempli plus tard)
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  POINTAGES: 'pointages',
  CONGES: 'conges',
  DOCUMENTS: 'documents',
  DEPARTEMENTS: 'departements',
};