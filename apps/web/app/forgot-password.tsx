import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TraunesAILogo } from '../src/components/ui/TraunesAILogo';
import { THEME } from '../src/theme/colors';
import { IconMail, IconChevronLeft, IconCheckCircle } from '../src/icons/Icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez renseigner votre adresse e-mail de connexion.');
      return;
    }

    setLoading(true);
    // Simulate reset link dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <TraunesAILogo size="lg" showSubtitle={true} />
          <Text style={styles.pageTitle}>Réinitialisation du mot de passe</Text>
          <Text style={styles.pageSubtitle}>
            Indiquez votre adresse e-mail professionnelle. Vous recevrez un lien d’accès sécurisé
            valable 30 minutes.
          </Text>
        </View>

        {submitted ? (
          <View style={styles.successBox}>
            <View style={styles.successIconCircle}>
              <IconCheckCircle size={32} color="#15803D" />
            </View>
            <Text style={styles.successTitle}>Lien de réinitialisation transmis</Text>
            <Text style={styles.successMessage}>
              Si un compte vérificateur est associé à <Text style={styles.boldText}>{email}</Text>,
              un message contenant un lien crypté de réinitialisation vient de vous être envoyé.
            </Text>

            <Pressable
              onPress={() => router.push('/login' as any)}
              style={styles.returnButton}
            >
              <Text style={styles.returnButtonText}>Retour à la connexion</Text>
            </Pressable>

            <Pressable
              onPress={() => setSubmitted(false)}
              style={styles.resendLink}
            >
              <Text style={styles.resendText}>Essayer avec une autre adresse e-mail</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Adresse e-mail professionnelle</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <IconMail size={18} color={THEME.colors.textSecondary} />
                </View>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setError(null);
                  }}
                  placeholder="nom@organisation.org"
                  placeholderTextColor={THEME.colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ hovered }: any) => [
                styles.submitButton,
                hovered && !loading && styles.submitButtonHovered,
                loading && styles.submitButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Envoyer le lien de réinitialisation</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push('/login' as any)}
              style={styles.backToLoginRow}
            >
              <IconChevronLeft size={16} color={THEME.colors.primary} />
              <Text style={styles.backToLoginText}>Retour à l’écran de connexion</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContainer: {
    padding: 24,
    minHeight: '100%' as any,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.xl,
    padding: 32,
    maxWidth: 480,
    width: '100%',
    ...THEME.shadows.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.navy,
    marginTop: 18,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.lg,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 14,
    color: THEME.colors.text,
    outlineStyle: 'none' as any,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: THEME.radii.md,
    padding: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 48,
  },
  submitButtonHovered: {
    backgroundColor: THEME.colors.primaryDark,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  backToLoginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.navy,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: '700',
    color: THEME.colors.navy,
  },
  returnButton: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: THEME.radii.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resendLink: {
    padding: 8,
  },
  resendText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
