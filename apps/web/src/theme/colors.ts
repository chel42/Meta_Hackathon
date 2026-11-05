export const THEME = {
  colors: {
    primary: '#0F766E', // Turquoise principal
    teal: '#0F766E',
    primaryDark: '#115E59',
    primaryLight: '#14B8A6', // Turquoise secondaire
    primarySoft: '#F0FDFA',
    navy: '#102A43', // Bleu nuit
    navySoft: '#1E3A5F',
    background: '#F5F8FA', // Fond clair
    surface: '#FFFFFF', // Blanc
    surfaceSubtle: '#F8FAFC',
    border: '#E2E8F0',
    borderStrong: '#CBD5E1',
    text: '#172B3A', // Texte principal
    textSecondary: '#475569',
    textMuted: '#94A3B8',

    // Verdicts - "vrai" et "faux" n'apparaissent nulle part
    verdicts: {
      confirmed: {
        text: '#15803D',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        label: 'Confirmée par les éléments disponibles',
        shortLabel: 'Confirmée',
      },
      contradicted: {
        text: '#B91C1C',
        bg: '#FEF2F2',
        border: '#FECACA',
        label: 'Contredite par les éléments disponibles',
        shortLabel: 'Contredite',
      },
      unverifiable: {
        text: '#475569',
        bg: '#F1F5F9',
        border: '#CBD5E1',
        label: 'Non vérifiable',
        shortLabel: 'Non vérifiable',
      },
    },

    // Limites d'investigation
    limitations: {
      text: '#B45309',
      bg: '#FFFBEB',
      border: '#FDE68A',
    },

    // Source trust levels
    sourceTrust: {
      high: {
        text: '#0F766E',
        bg: '#F0FDFA',
        border: '#99F6E4',
        label: 'Confiance élevée',
      },
      medium: {
        text: '#D97706',
        bg: '#FFFBEB',
        border: '#FDE68A',
        label: 'Fiabilité modérée',
      },
      unverified: {
        text: '#64748B',
        bg: '#F8FAFC',
        border: '#E2E8F0',
        label: 'À vérifier',
      },
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  shadows: {
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 2,
    },
    lg: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 4,
    },
  },
  radii: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};
