export const COLORS = {
  // Main colors
  primary: '#2563EB',      // Bleu professionnel
  secondary: '#10B981',    // Vert succès
  accent: '#8B5CF6',       // Violet
  
  // Status colors
  error: '#EF4444',        // Rouge erreur
  warning: '#F59E0B',      // Orange warning
  success: '#10B981',      // Vert succès
  info: '#3B82F6',         // Bleu info
  
  // Backgrounds
  background: '#F9FAFB',   // Gris très clair
  surface: '#FFFFFF',      // Blanc
  card: '#FFFFFF',         // Blanc pour cards
  
  // Text colors
  text: '#111827',         // Noir texte principal
  textSecondary: '#6B7280', // Gris texte secondaire
  textLight: '#9CA3AF',    // Gris clair
  textWhite: '#FFFFFF',    // Blanc
  
  // Border colors
  border: '#E5E7EB',       // Gris border
  borderLight: '#F3F4F6',  // Gris très clair
  
  // Special
  shadow: '#00000015',     // Ombre légère
  overlay: '#00000080',    // Overlay semi-transparent
  
  // Gradient colors (pour backgrounds)
  gradientStart: '#2563EB',
  gradientEnd: '#1E40AF',
};

// Helper pour créer des gradients
export const GRADIENTS = {
  primary: [COLORS.gradientStart, COLORS.gradientEnd],
  success: [COLORS.success, '#059669'],
  error: [COLORS.error, '#DC2626'],
};