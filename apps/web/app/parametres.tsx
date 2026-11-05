import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../src/components/layout/AppShell';
import { THEME } from '../src/theme/colors';
import {
  IconSettings,
  IconBell,
  IconEye,
  IconEyeOff,
  IconShield,
  IconTrash,
  IconCheck,
  IconRefresh,
  IconUser,
  IconLock,
  IconGlobe,
  IconSun,
  IconMoon,
  IconLogOut,
  IconAlertTriangle,
  IconCheckCircle,
  IconCheckShield,
} from '../src/icons/Icons';
import { useAuth } from '../src/context/AuthContext';
import { useNotifications } from '../src/context/NotificationContext';
import { useTraunesAIData } from '../src/context/TraunesAIDataContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const { user, updatePreferences, updateProfile, changePassword, logout, deleteAccount, resetToDemoUser } = useAuth();
  const { addNotification } = useNotifications();
  const { resetToDefaultReports } = useTraunesAIData();

  // Preferences from user context
  const prefs = user?.preferences || {
    language: 'fr',
    theme: 'light',
    highContrast: false,
    reducedMotion: false,
    defaultSearchDepth: 'standard',
    notificationsEmail: true,
    notificationsInApp: true,
    alertMajorDisinfo: true,
    historyRetentionDays: 90,
  };

  // Personal Info Form State
  const [name, setName] = useState(user?.name || 'Camille Laurent');
  const [email, setEmail] = useState(user?.email || 'camille.laurent@media-verification.org');
  const [organization, setOrganization] = useState(user?.organization || 'Observatoire International des Faits');
  const [infoSaved, setInfoSaved] = useState(false);

  // Password State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  // Modals State
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // General Notification Banner State
  const [savedBannerMessage, setSavedBannerMessage] = useState<string | null>(null);

  const showSavedBanner = (msg: string) => {
    setSavedBannerMessage(msg);
    setTimeout(() => setSavedBannerMessage(null), 3000);
  };

  const handleTogglePref = (key: keyof typeof prefs, val: any) => {
    updatePreferences({ [key]: val });
    showSavedBanner('Préférences enregistrées avec succès.');
    addNotification({
      title: 'Paramètres mis à jour',
      message: 'Vos préférences de plateforme ont été sauvegardées.',
      type: 'system',
    });
  };

  const handleSavePersonalInfo = () => {
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim(),
    });
    setInfoSaved(true);
    showSavedBanner('Informations personnelles mises à jour.');
    addNotification({
      title: 'Compte mis à jour',
      message: 'Vos coordonnées ont été enregistrées.',
      type: 'system',
    });
    setTimeout(() => setInfoSaved(false), 3000);
  };

  const handleResetPersonalInfo = () => {
    setName(user?.name || 'Camille Laurent');
    setEmail(user?.email || 'camille.laurent@media-verification.org');
    setOrganization(user?.organization || 'Observatoire International des Faits');
  };

  const handleChangePassword = async () => {
    setPassError(null);
    setPassSuccess(false);

    if (!currentPass) {
      setPassError('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (newPass.length < 8) {
      setPassError('Le nouveau mot de passe doit comporter au moins 8 caractères.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    const res = await changePassword(currentPass, newPass);
    if (res.success) {
      setPassSuccess(true);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      showSavedBanner('Mot de passe mis à jour avec succès.');
      addNotification({
        title: 'Mot de passe réactualisé',
        message: 'Votre clé de connexion a été modifiée.',
        type: 'security',
      });
      setTimeout(() => setPassSuccess(false), 3000);
    } else {
      setPassError(res.error || 'Erreur lors du changement de mot de passe.');
    }
  };

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    logout();
    router.replace('/login' as any);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() === 'SUPPRIMER') {
      await deleteAccount();
      router.replace('/login' as any);
    }
  };

  return (
    <AppShell>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconCircle}>
              <IconSettings size={22} color="#0F766E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Paramètres & Préférences</Text>
              <Text style={styles.subtitle}>
                Personnalisez votre expérience d’utilisation, vos notifications, l'affichage et la gestion de votre compte TRAUNES AI.
              </Text>
            </View>
          </View>

          {/* Feedback Banner */}
          {savedBannerMessage && (
            <View style={styles.savedBanner}>
              <IconCheck size={16} color="#15803D" />
              <Text style={styles.savedBannerText}>{savedBannerMessage}</Text>
            </View>
          )}

          {/* 1. PRÉFÉRENCES GÉNÉRALES & APPARENCE */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <IconGlobe size={20} color="#0F766E" />
              <Text style={styles.sectionTitle}>Préférences générales & Apparence</Text>
            </View>
            <Text style={styles.sectionSub}>
              Ajustez le thème d’affichage, la langue d’interface et vos critères de confort visuel.
            </Text>

            <View style={styles.prefGroup}>
              {/* Thème */}
              <View style={styles.fieldCol}>
                <Text style={styles.fieldLabel}>Thème d'affichage</Text>
                <View style={styles.optionsRow}>
                  {[
                    { id: 'light', label: 'Clair', icon: IconSun },
                    { id: 'dark', label: 'Sombre', icon: IconMoon },
                    { id: 'system', label: 'Système', icon: IconSettings },
                  ].map((t) => {
                    const IconComp = t.icon;
                    const isActive = prefs.theme === t.id;
                    return (
                      <Pressable
                        key={t.id}
                        onPress={() => handleTogglePref('theme', t.id as any)}
                        style={[styles.choiceBtn, isActive && styles.choiceBtnActive]}
                      >
                        <IconComp size={15} color={isActive ? '#FFFFFF' : '#64748B'} />
                        <Text style={[styles.choiceBtnText, isActive && styles.choiceBtnTextActive]}>
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Langue */}
              <View style={styles.fieldCol}>
                <Text style={styles.fieldLabel}>Langue de l'interface</Text>
                <View style={styles.optionsRow}>
                  {[
                    { id: 'fr', label: '🇫🇷 Français (officiel)' },
                    { id: 'en', label: '🇬🇧 English (International)' },
                    { id: 'es', label: '🇪🇸 Español' },
                  ].map((lang) => {
                    const isActive = prefs.language === lang.id;
                    return (
                      <Pressable
                        key={lang.id}
                        onPress={() => handleTogglePref('language', lang.id as any)}
                        style={[styles.choiceBtn, isActive && styles.choiceBtnActive]}
                      >
                        <Text style={[styles.choiceBtnText, isActive && styles.choiceBtnTextActive]}>
                          {lang.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Profondeur par défaut */}
              <View style={styles.fieldCol}>
                <Text style={styles.fieldLabel}>Profondeur d'analyse par défaut</Text>
                <View style={styles.optionsRow}>
                  {[
                    { id: 'rapid', label: '⚡ Synthétique' },
                    { id: 'standard', label: '🎯 Standard' },
                    { id: 'deep', label: '🔬 Approfondie (OSINT)' },
                  ].map((d) => {
                    const isActive = prefs.defaultSearchDepth === d.id;
                    return (
                      <Pressable
                        key={d.id}
                        onPress={() => handleTogglePref('defaultSearchDepth', d.id as any)}
                        style={[styles.choiceBtn, isActive && styles.choiceBtnActive]}
                      >
                        <Text style={[styles.choiceBtnText, isActive && styles.choiceBtnTextActive]}>
                          {d.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Comfort & Accessibility Switches */}
              <View style={styles.toggleList}>
                <View style={styles.toggleItem}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleTitle}>Contraste renforcé (Norme AA)</Text>
                    <Text style={styles.toggleDesc}>
                      Augmente la lisibilité des textes et renforce la densité visuelle des badges de verdicts.
                    </Text>
                  </View>
                  <Switch
                    value={prefs.highContrast}
                    onValueChange={(v) => handleTogglePref('highContrast', v)}
                    trackColor={{ false: '#CBD5E1', true: '#0F766E' }}
                  />
                </View>

                <View style={styles.toggleItem}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleTitle}>Réduction des animations</Text>
                    <Text style={styles.toggleDesc}>
                      Simplifie les transitions visuelles lors du déroulement des audits en temps réel.
                    </Text>
                  </View>
                  <Switch
                    value={prefs.reducedMotion}
                    onValueChange={(v) => handleTogglePref('reducedMotion', v)}
                    trackColor={{ false: '#CBD5E1', true: '#0F766E' }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* 2. NOTIFICATIONS & ALERTES */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <IconBell size={20} color="#0F766E" />
              <Text style={styles.sectionTitle}>Notifications & Alertes de plateforme</Text>
            </View>
            <Text style={styles.sectionSub}>
              Gérez la fréquence et les canaux de notification pour vos enquêtes et votre parcours Académie EMI.
            </Text>

            <View style={styles.toggleList}>
              <View style={styles.toggleItem}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Notifications dans l’application</Text>
                  <Text style={styles.toggleDesc}>
                    Afficher les alertes dans la cloche et le tableau de bord lorsqu'une analyse est finalisée.
                  </Text>
                </View>
                <Switch
                  value={prefs.notificationsInApp}
                  onValueChange={(v) => handleTogglePref('notificationsInApp', v)}
                  trackColor={{ false: '#CBD5E1', true: '#0F766E' }}
                />
              </View>

              <View style={styles.toggleItem}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Alerte Désinformation Majeure</Text>
                  <Text style={styles.toggleDesc}>
                    Signalements prioritaires en temps réel lors de la détection de rumeurs virales à fort impact.
                  </Text>
                </View>
                <Switch
                  value={prefs.alertMajorDisinfo}
                  onValueChange={(v) => handleTogglePref('alertMajorDisinfo', v)}
                  trackColor={{ false: '#CBD5E1', true: '#0F766E' }}
                />
              </View>

              <View style={styles.toggleItem}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Récapitulatif par e-mail</Text>
                  <Text style={styles.toggleDesc}>
                    Recevoir un bilan périodique des vérifications effectuées et des leçons Académie validées.
                  </Text>
                </View>
                <Switch
                  value={prefs.notificationsEmail}
                  onValueChange={(v) => handleTogglePref('notificationsEmail', v)}
                  trackColor={{ false: '#CBD5E1', true: '#0F766E' }}
                />
              </View>
            </View>
          </View>

          {/* 3. INFORMATIONS DU COMPTE & PROFIL */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <IconUser size={20} color="#0F766E" />
              <Text style={styles.sectionTitle}>Gestion des informations du compte</Text>
            </View>
            <Text style={styles.sectionSub}>
              Consultez et modifiez vos informations identifiantes associées à vos rapports d'audit.
            </Text>

            <View style={styles.formGrid}>
              <View style={styles.fieldCol}>
                <Text style={styles.fieldLabel}>Nom et Prénom</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nom complet"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldCol}>
                <Text style={styles.fieldLabel}>Adresse e-mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldCol}>
                <Text style={styles.fieldLabel}>Organisation / Média d'attache</Text>
                <TextInput
                  style={styles.input}
                  value={organization}
                  onChangeText={setOrganization}
                  placeholder="Ex. Observatoire International des Faits"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.formBtnRow}>
              <Pressable onPress={handleResetPersonalInfo} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </Pressable>

              <Pressable onPress={handleSavePersonalInfo} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Enregistrer les modifications</Text>
              </Pressable>
            </View>
          </View>

          {/* 4. CONFIDENTIALITÉ & SÉCURITÉ DU MOT DE PASSE */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <IconLock size={20} color="#0F766E" />
              <Text style={styles.sectionTitle}>Confidentialité & Sécurité du mot de passe</Text>
            </View>
            <Text style={styles.sectionSub}>
              Mettez à jour vos identifiants d'accès et définissez la durée de conservation de vos données d'analyse.
            </Text>

            {passError && (
              <View style={styles.errorBox}>
                <IconAlertTriangle size={15} color="#B91C1C" />
                <Text style={styles.errorText}>{passError}</Text>
              </View>
            )}

            {passSuccess && (
              <View style={styles.successBadge}>
                <IconCheck size={14} color="#15803D" />
                <Text style={styles.successText}>Mot de passe réactualisé avec succès.</Text>
              </View>
            )}

            <View style={styles.formGrid}>
              <View style={styles.fieldCol}>
                <Text style={styles.fieldLabel}>Mot de passe actuel</Text>
                <TextInput
                  style={styles.input}
                  value={currentPass}
                  onChangeText={setCurrentPass}
                  secureTextEntry={!showPass}
                  placeholder="••••••••••••"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldCol}>
                <Text style={styles.fieldLabel}>Nouveau mot de passe (8 car. min)</Text>
                <TextInput
                  style={styles.input}
                  value={newPass}
                  onChangeText={setNewPass}
                  secureTextEntry={!showPass}
                  placeholder="••••••••••••"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.fieldCol}>
                <Text style={styles.fieldLabel}>Confirmer le nouveau mot de passe</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPass}
                  onChangeText={setConfirmPass}
                  secureTextEntry={!showPass}
                  placeholder="••••••••••••"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={() => setShowPass(!showPass)}
                style={styles.showPassToggleBtn}
              >
                {showPass ? <IconEyeOff size={15} color="#64748B" /> : <IconEye size={15} color="#64748B" />}
                <Text style={styles.showPassToggleText}>
                  {showPass ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
                </Text>
              </Pressable>

              <Pressable onPress={handleChangePassword} style={styles.darkBtn}>
                <IconLock size={14} color="#FFFFFF" />
                <Text style={styles.darkBtnText}>Mettre à jour le mot de passe</Text>
              </Pressable>
            </View>

            {/* Retention option */}
            <View style={styles.retentionSection}>
              <Text style={styles.fieldLabel}>Durée de conservation de l'historique d'audit</Text>
              <View style={styles.optionsRow}>
                {[
                  { id: 30, label: '30 jours' },
                  { id: 90, label: '90 jours' },
                  { id: 365, label: '1 an' },
                  { id: 0, label: 'Illimitée' },
                ].map((r) => (
                  <Pressable
                    key={r.id}
                    onPress={() => handleTogglePref('historyRetentionDays', r.id)}
                    style={[
                      styles.choiceBtn,
                      prefs.historyRetentionDays === r.id && styles.choiceBtnActive,
                    ]}
                  >
                    <Text style={[styles.choiceBtnText, prefs.historyRetentionDays === r.id && styles.choiceBtnTextActive]}>
                      {r.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Privacy notice info */}
            <View style={styles.privacyNoticeCard}>
              <IconCheckShield size={18} color="#0F766E" />
              <View style={{ flex: 1 }}>
                <Text style={styles.privacyNoticeTitle}>Engagement de protection des données</Text>
                <Text style={styles.privacyNoticeText}>
                  Vos requêtes d'investigation et documents de preuve sont stockés localement sur votre session sécurisée.
                  Aucune donnée personnelle n'est revendue ou partagée avec des tiers.
                </Text>
              </View>
            </View>
          </View>

          {/* 5. GESTION DU COMPTE & ACTIONS SENSIBLES */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <IconShield size={20} color="#0F766E" />
              <Text style={styles.sectionTitle}>Gestion du compte & Actions système</Text>
            </View>

            <View style={styles.actionsGrid}>
              <Pressable
                onPress={() => {
                  resetToDefaultReports();
                  resetToDemoUser();
                  showSavedBanner('Données modèles restaurées.');
                  addNotification({
                    title: 'Démonstration réinitialisée',
                    message: 'Les données d’exemple d’origine ont été rechargées.',
                    type: 'system',
                  });
                }}
                style={styles.dataActionBtn}
              >
                <IconRefresh size={16} color="#0F766E" />
                <Text style={styles.dataActionText}>Restaurer les données modèles d'origine</Text>
              </Pressable>

              <Pressable
                onPress={() => setLogoutModalOpen(true)}
                style={styles.logoutActionBtn}
              >
                <IconLogOut size={16} color="#B91C1C" />
                <Text style={styles.logoutActionText}>Se déconnecter de la session</Text>
              </Pressable>

              <Pressable
                onPress={() => setDeleteModalOpen(true)}
                style={styles.deleteActionBtn}
              >
                <IconTrash size={16} color="#B91C1C" />
                <Text style={styles.deleteActionText}>Supprimer mon compte</Text>
              </Pressable>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>À propos de la plateforme TRAUNES AI</Text>
            <Text style={styles.aboutText}>
              TRAUNES AI est un environnement professionnel d’aide à la vérification de l’information. Conçu pour les journalistes, enseignants, chercheurs et cellules de fact-checking, son protocole privilégie la rigueur méthodologique et la neutralité.
            </Text>
            <View style={styles.aboutMetaRow}>
              <Text style={styles.aboutMeta}>Version : TRAUNES AI Core 2.4.1 (Expo Web)</Text>
              <Text style={styles.aboutMeta}>• Protection des données : Conforme RGPD</Text>
            </View>
          </View>
        </View>

        {/* MODALE DÉCONNEXION */}
        {logoutModalOpen && (
          <Modal
            transparent
            visible={logoutModalOpen}
            animationType="fade"
            onRequestClose={() => setLogoutModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <View style={styles.modalIconCircle}>
                  <IconLogOut size={22} color="#B91C1C" />
                </View>
                <Text style={styles.modalTitle}>Confirmer la déconnexion</Text>
                <Text style={styles.modalText}>
                  Êtes-vous sûr de vouloir vous déconnecter de votre session TRAUNES AI ? Vos paramètres resteront sauvegardés.
                </Text>

                <View style={styles.modalActions}>
                  <Pressable onPress={() => setLogoutModalOpen(false)} style={styles.modalCancelBtn}>
                    <Text style={styles.modalCancelText}>Annuler</Text>
                  </Pressable>

                  <Pressable onPress={handleConfirmLogout} style={styles.modalConfirmBtn}>
                    <Text style={styles.modalConfirmText}>Se déconnecter</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* MODALE SUPPRESSION COMPTE */}
        {deleteModalOpen && (
          <Modal
            transparent
            visible={deleteModalOpen}
            animationType="fade"
            onRequestClose={() => setDeleteModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Suppression définitive du compte</Text>
                <Text style={styles.modalText}>
                  Cette action supprimera définitivement votre profil et vos réglages. Veuillez taper <Text style={{ fontWeight: '800', color: '#B91C1C' }}>SUPPRIMER</Text> ci-dessous :
                </Text>

                <TextInput
                  style={styles.modalInput}
                  value={deleteConfirmText}
                  onChangeText={setDeleteConfirmText}
                  placeholder="SUPPRIMER"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                />

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => {
                      setDeleteModalOpen(false);
                      setDeleteConfirmText('');
                    }}
                    style={styles.modalCancelBtn}
                  >
                    <Text style={styles.modalCancelText}>Annuler</Text>
                  </Pressable>

                  <Pressable
                    disabled={deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER'}
                    onPress={handleDeleteAccount}
                    style={[
                      styles.modalConfirmBtn,
                      deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER' && { opacity: 0.5 },
                    ]}
                  >
                    <Text style={styles.modalConfirmText}>Supprimer définitivement</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  container: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
  },
  savedBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },

  // Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: -8,
  },

  // Field Groups & Options
  prefGroup: {
    gap: 16,
  },
  fieldCol: {
    gap: 6,
    flex: 1,
    minWidth: 240,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  choiceBtnActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  choiceBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  choiceBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Toggle List
  toggleList: {
    gap: 14,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 16,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },

  // Forms
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    outlineStyle: 'none' as any,
  },
  formBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  primaryBtn: {
    backgroundColor: '#0F766E',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  showPassToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  showPassToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  darkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  darkBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  successText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },

  retentionSection: {
    marginTop: 10,
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  privacyNoticeCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  privacyNoticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  privacyNoticeText: {
    fontSize: 12,
    color: '#334155',
    marginTop: 2,
    lineHeight: 17,
  },

  // Actions System
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  dataActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  dataActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  logoutActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },
  deleteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },

  // About Card
  aboutCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  aboutText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  aboutMetaRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  aboutMeta: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxWidth: 420,
    width: '100%',
    gap: 12,
  },
  modalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '700',
    backgroundColor: '#FFFDFD',
    outlineStyle: 'none' as any,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modalConfirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#B91C1C',
  },
  modalConfirmText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
