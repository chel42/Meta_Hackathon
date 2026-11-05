import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../src/components/layout/AppShell';
import {
  IconUser,
  IconShield,
  IconLock,
  IconFileText,
  IconTrash,
  IconCheck,
  IconLogOut,
  IconAlertTriangle,
  IconGraduationCap,
  IconAward,
  IconCheckCircle,
  IconMail,
  IconGlobe,
  IconEye,
  IconEyeOff,
  IconDownload,
} from '../src/icons/Icons';
import { useAuth } from '../src/context/AuthContext';
import { useTraunesAIData } from '../src/context/TraunesAIDataContext';
import { useAcademy } from '../src/context/AcademyContext';
import { useNotifications } from '../src/context/NotificationContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const { user, updateProfile, updatePreferences, changePassword, deleteAccount, logout, resetToDemoUser } = useAuth();
  const { reports } = useTraunesAIData();
  const { overallProgress } = useAcademy();
  const { addNotification } = useNotifications();

  // Active tab within settings
  const [activeTab, setActiveTab] = useState<'info' | 'parcours' | 'preferences' | 'securite'>('info');

  // Form states
  const [name, setName] = useState(user?.name || 'Camille Laurent');
  const [email, setEmail] = useState(user?.email || 'camille.laurent@media-verification.org');
  const [organization, setOrganization] = useState(user?.organization || 'Observatoire International des Faits');
  const [bio, setBio] = useState(user?.bio || 'Journaliste spécialisé en vérification des faits et enquêtes numériques.');
  const [profileSaved, setProfileSaved] = useState(false);

  // Preferences
  const [prefLang, setPrefLang] = useState<'fr' | 'en' | 'es'>(user?.preferences?.language || 'fr');
  const [prefDepth, setPrefDepth] = useState<'standard' | 'deep' | 'rapid'>(user?.preferences?.defaultSearchDepth || 'standard');
  const [prefEmailNotif, setPrefEmailNotif] = useState<boolean>(user?.preferences?.notificationsEmail ?? true);
  const [prefAlertDisinfo, setPrefAlertDisinfo] = useState<boolean>(user?.preferences?.alertMajorDisinfo ?? true);
  const [prefSaved, setPrefSaved] = useState(false);

  // Password change
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  // Modals
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Verifications stats
  const totalVerifications = useMemo(() => {
    return reports.length || user?.stats?.totalChecks || 38;
  }, [reports, user]);

  const handleSaveProfile = () => {
    updateProfile({ name, email, organization, bio });
    setProfileSaved(true);
    addNotification({
      title: 'Profil enregistré',
      message: 'Vos informations personnelles ont été mises à jour.',
      type: 'system',
    });
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSavePreferences = () => {
    updatePreferences({
      language: prefLang,
      defaultSearchDepth: prefDepth,
      notificationsEmail: prefEmailNotif,
      alertMajorDisinfo: prefAlertDisinfo,
    });
    setPrefSaved(true);
    addNotification({
      title: 'Préférences enregistrées',
      message: 'Vos paramètres d’analyse ont été mis à jour.',
      type: 'system',
    });
    setTimeout(() => setPrefSaved(false), 3000);
  };

  const handleChangePassword = async () => {
    setPassError(null);
    setPassSuccess(false);

    if (!currentPass) {
      setPassError('Veuillez renseigner le mot de passe actuel.');
      return;
    }
    if (newPass.length < 8) {
      setPassError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
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
      addNotification({
        title: 'Mot de passe modifié',
        message: 'Votre mot de passe a été mis à jour.',
        type: 'security',
      });
      setTimeout(() => setPassSuccess(false), 3000);
    } else {
      setPassError(res.error || 'Erreur lors de la modification.');
    }
  };

  const handleExportData = () => {
    const data = {
      profile: { name, email, organization, bio },
      stats: { totalVerifications, academyProgress: overallProgress.percentCompleted },
      exportedAt: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    if (typeof document !== 'undefined') {
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `profil_emi_${Date.now()}.json`;
      a.click();
    }
  };

  const userInitials = (name || 'Camille Laurent')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>

          {/* 1. CARTE DE PRESENTATION DU PROFIL */}
          <View style={styles.headerCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>

            <View style={styles.headerDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{name}</Text>
                <View style={styles.badgeVerified}>
                  <IconCheckCircle size={13} color="#0F766E" />
                  <Text style={styles.badgeVerifiedText}>Compte Vérifié</Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{email}</Text>
              <Text style={styles.userOrg}>{organization}</Text>
            </View>

            <Pressable
              onPress={() => setLogoutModalOpen(true)}
              style={({ hovered }: any) => [
                styles.logoutBtn,
                hovered && styles.logoutBtnHovered,
              ]}
            >
              <IconLogOut size={15} color="#B91C1C" />
              <Text style={styles.logoutBtnText}>Déconnexion</Text>
            </Pressable>
          </View>

          {/* 2. ONGLETS PRO ET SIMPLES */}
          <View style={styles.tabBar}>
            {[
              { id: 'info', label: 'Informations', icon: IconUser },
              { id: 'parcours', label: 'Mon Parcours EMI', icon: IconAward },
              { id: 'preferences', label: 'Préférences', icon: IconGlobe },
              { id: 'securite', label: 'Sécurité', icon: IconLock },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as any)}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                >
                  <IconComp size={16} color={isActive ? '#0F766E' : '#64748B'} />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* 3. CONTENU SELON L'ONGLET SÉLECTIONNÉ */}

          {/* ONGLET 1: INFORMATIONS PERSONNELLES */}
          {activeTab === 'info' && (
            <View style={styles.cardSection}>
              <Text style={styles.cardTitle}>Informations personnelles</Text>
              <Text style={styles.cardSubtitle}>
                Gérez vos informations de compte et vos coordonnées professionnelles.
              </Text>

              <View style={styles.formGroup}>
                <View style={styles.fieldCol}>
                  <Text style={styles.fieldLabel}>Nom complet</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Prénom Nom"
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
                  <Text style={styles.fieldLabel}>Organisation / Média</Text>
                  <TextInput
                    style={styles.input}
                    value={organization}
                    onChangeText={setOrganization}
                    placeholder="Ex. Observatoire des Médias"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={[styles.fieldCol, { width: '100%' }]}>
                  <Text style={styles.fieldLabel}>Biographie courte</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Présentez brièvement vos activités de vérification..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              <View style={styles.actionRow}>
                {profileSaved && (
                  <View style={styles.successBadge}>
                    <IconCheck size={14} color="#15803D" />
                    <Text style={styles.successText}>Enregistré avec succès</Text>
                  </View>
                )}
                <Pressable onPress={handleSaveProfile} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Enregistrer les modifications</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ONGLET 2: PARCOURS EMI */}
          {activeTab === 'parcours' && (
            <View style={styles.cardSection}>
              <Text style={styles.cardTitle}>Mon Parcours EMI</Text>
              <Text style={styles.cardSubtitle}>
                Vos statistiques de vérification d'information et votre progression globale.
              </Text>

              <View style={styles.statsGrid}>
                {/* Stat 1 */}
                <View style={styles.statCard}>
                  <View style={styles.statIconBox}>
                    <IconFileText size={20} color="#0F766E" />
                  </View>
                  <View>
                    <Text style={styles.statValue}>{totalVerifications}</Text>
                    <Text style={styles.statLabel}>Vérifications réalisées</Text>
                  </View>
                </View>

                {/* Stat 2 */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconBox, { backgroundColor: '#E0F2FE' }]}>
                    <IconGraduationCap size={20} color="#0284C7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.statValue}>{overallProgress.percentCompleted}%</Text>
                    <Text style={styles.statLabel}>Progression Académie</Text>
                  </View>
                </View>

                {/* Stat 3 */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
                    <IconAward size={20} color="#D97706" />
                  </View>
                  <View>
                    <Text style={styles.statValue}>Analyste</Text>
                    <Text style={styles.statLabel}>Niveau TRAUNES AI</Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() => router.push('/academie-emi' as any)}
                style={styles.secondaryLinkBtn}
              >
                <Text style={styles.secondaryLinkText}>Accéder aux modules d'apprentissage →</Text>
              </Pressable>
            </View>
          )}

          {/* ONGLET 3: PRÉFÉRENCES */}
          {activeTab === 'preferences' && (
            <View style={styles.cardSection}>
              <Text style={styles.cardTitle}>Préférences d'utilisation</Text>
              <Text style={styles.cardSubtitle}>
                Personnalisez la langue d'analyse et les options de notification.
              </Text>

              <View style={styles.formGroup}>
                {/* Langue */}
                <View style={styles.prefRow}>
                  <Text style={styles.fieldLabel}>Langue d'analyse</Text>
                  <View style={styles.pillGroup}>
                    {[
                      { id: 'fr', label: 'Français' },
                      { id: 'en', label: 'English' },
                      { id: 'es', label: 'Español' },
                    ].map((l) => (
                      <Pressable
                        key={l.id}
                        onPress={() => setPrefLang(l.id as any)}
                        style={[styles.pillBtn, prefLang === l.id && styles.pillBtnActive]}
                      >
                        <Text style={[styles.pillBtnText, prefLang === l.id && styles.pillBtnTextActive]}>
                          {l.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Profondeur */}
                <View style={styles.prefRow}>
                  <Text style={styles.fieldLabel}>Profondeur de recherche</Text>
                  <View style={styles.pillGroup}>
                    {[
                      { id: 'rapid', label: 'Synthétique' },
                      { id: 'standard', label: 'Standard' },
                      { id: 'deep', label: 'Approfondie' },
                    ].map((d) => (
                      <Pressable
                        key={d.id}
                        onPress={() => setPrefDepth(d.id as any)}
                        style={[styles.pillBtn, prefDepth === d.id && styles.pillBtnActive]}
                      >
                        <Text style={[styles.pillBtnText, prefDepth === d.id && styles.pillBtnTextActive]}>
                          {d.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Toggles */}
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleText}>Notifications par e-mail</Text>
                  <Pressable
                    onPress={() => setPrefEmailNotif(!prefEmailNotif)}
                    style={[styles.switchTrack, prefEmailNotif && styles.switchTrackActive]}
                  >
                    <View style={[styles.switchThumb, prefEmailNotif && styles.switchThumbActive]} />
                  </Pressable>
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleText}>Alertes Désinformation virale</Text>
                  <Pressable
                    onPress={() => setPrefAlertDisinfo(!prefAlertDisinfo)}
                    style={[styles.switchTrack, prefAlertDisinfo && styles.switchTrackActive]}
                  >
                    <View style={[styles.switchThumb, prefAlertDisinfo && styles.switchThumbActive]} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.actionRow}>
                {prefSaved && (
                  <View style={styles.successBadge}>
                    <IconCheck size={14} color="#15803D" />
                    <Text style={styles.successText}>Préférences enregistrées</Text>
                  </View>
                )}
                <Pressable onPress={handleSavePreferences} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Enregistrer les préférences</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ONGLET 4: SÉCURITÉ ET ACTIONS */}
          {activeTab === 'securite' && (
            <View style={styles.cardSection}>
              <Text style={styles.cardTitle}>Sécurité & Compte</Text>
              <Text style={styles.cardSubtitle}>
                Changement de mot de passe et gestion des données personnelles.
              </Text>

              {passError && (
                <View style={styles.errorBanner}>
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

              <View style={styles.formGroup}>
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

              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                <Pressable onPress={handleChangePassword} style={styles.darkBtn}>
                  <IconLock size={14} color="#FFFFFF" />
                  <Text style={styles.darkBtnText}>Mettre à jour le mot de passe</Text>
                </Pressable>

                <Pressable onPress={handleExportData} style={styles.outlineBtn}>
                  <IconDownload size={14} color="#0F766E" />
                  <Text style={styles.outlineBtnText}>Exporter mes données</Text>
                </Pressable>
              </View>

              {/* Zone sensible */}
              <View style={styles.dangerBlock}>
                <Text style={styles.dangerBlockTitle}>Actions avancées</Text>
                <View style={styles.dangerBtnsRow}>
                  <Pressable
                    onPress={() => {
                      resetToDemoUser();
                      setName('Camille Laurent');
                      setEmail('camille.laurent@media-verification.org');
                      setOrganization('Observatoire International des Faits');
                      addNotification({
                        title: 'Compte réinitialisé',
                        message: 'Les données démo ont été restaurées.',
                        type: 'system',
                      });
                    }}
                    style={styles.demoResetBtn}
                  >
                    <Text style={styles.demoResetText}>Restaurer profil démo</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setDeleteModalOpen(true)}
                    style={styles.deleteBtn}
                  >
                    <IconTrash size={14} color="#B91C1C" />
                    <Text style={styles.deleteBtnText}>Supprimer le compte</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

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
                <Text style={styles.modalTitle}>Confirmer la déconnexion</Text>
                <Text style={styles.modalText}>
                  Voulez-vous vraiment vous déconnecter de votre session ?
                </Text>

                <View style={styles.modalActions}>
                  <Pressable onPress={() => setLogoutModalOpen(false)} style={styles.modalCancelBtn}>
                    <Text style={styles.modalCancelText}>Annuler</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setLogoutModalOpen(false);
                      logout();
                      router.replace('/login' as any);
                    }}
                    style={styles.modalLogoutBtn}
                  >
                    <Text style={styles.modalLogoutText}>Se déconnecter</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* MODALE SUPPRESSION */}
        {deleteModalOpen && (
          <Modal
            transparent
            visible={deleteModalOpen}
            animationType="fade"
            onRequestClose={() => setDeleteModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Suppression du compte</Text>
                <Text style={styles.modalText}>
                  Tapez <Text style={{ fontWeight: '800', color: '#B91C1C' }}>SUPPRIMER</Text> ci-dessous pour confirmer :
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
                  <Pressable onPress={() => setDeleteModalOpen(false)} style={styles.modalCancelBtn}>
                    <Text style={styles.modalCancelText}>Annuler</Text>
                  </Pressable>

                  <Pressable
                    disabled={deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER'}
                    onPress={async () => {
                      await deleteAccount();
                      router.replace('/login' as any);
                    }}
                    style={[
                      styles.modalDeleteBtn,
                      deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER' && { opacity: 0.5 },
                    ]}
                  >
                    <Text style={styles.modalLogoutText}>Supprimer</Text>
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
  mainContainer: {
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
    gap: 20,
  },

  // 1. Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerDetails: {
    flex: 1,
    minWidth: 240,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  badgeVerifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  userOrg: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutBtnHovered: {
    backgroundColor: '#FEE2E2',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },

  // 2. Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 4,
    gap: 4,
    flexWrap: 'wrap',
  },
  tabItem: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: '#F0FDFA',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    fontWeight: '800',
    color: '#0F766E',
  },

  // 3. Card Sections
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: -10,
  },

  // Form Layout
  formGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  fieldCol: {
    flex: 1,
    minWidth: 260,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
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
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  successText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },

  // Parcours Stats
  statsGrid: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  secondaryLinkBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  secondaryLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },

  // Preferences Layout
  prefRow: {
    width: '100%',
    gap: 8,
  },
  pillGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillBtnActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  pillBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  pillBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toggleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  switchTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    padding: 2,
  },
  switchTrackActive: {
    backgroundColor: '#0F766E',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },

  // Security Layout
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
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  outlineBtnText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },

  // Danger Block
  dangerBlock: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 10,
  },
  dangerBlockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B91C1C',
  },
  dangerBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  demoResetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  demoResetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxWidth: 400,
    width: '100%',
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalText: {
    fontSize: 13,
    color: '#64748B',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '700',
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
  modalLogoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#B91C1C',
  },
  modalDeleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#B91C1C',
  },
  modalLogoutText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
