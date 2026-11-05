import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../src/theme/colors';
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconGoogle,
  IconCheckCircle,
  IconShield,
  IconCheckShield,
  IconZap,
  IconSun,
  IconMoon,
  IconMenu,
  IconX,
} from '../src/icons/Icons';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { login, resetToDemoUser } = useAuth();

  const [email, setEmail] = useState('camille.laurent@media-verification.org');
  const [password, setPassword] = useState('TraunesAISecur2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isWide = width >= 1024;
  const isWideNav = width >= 1200;
  const isTablet = width >= 768 && width < 1024;

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Veuillez renseigner votre adresse e-mail.');
      return;
    }
    if (!password) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        router.replace('/dashboard');
      } else {
        setError(res.error || 'Identifiants incorrects.');
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    resetToDemoUser();
    router.replace('/dashboard');
  };

  const handleQuickDemo = () => {
    resetToDemoUser();
    router.replace('/dashboard');
  };

  return (
    <View style={styles.pageContainer}>
      {/* =========================================================================
          TOP NAVBAR (Identique à la capture)
         ========================================================================= */}
      <View style={styles.navbar}>
        <View style={styles.navbarContent}>
          <Pressable onPress={() => router.push('/')} style={styles.navLogoContainer}>
            <Image
              source={{ uri: '/logo.png' }}
              style={{ width: isWideNav ? 200 : 140, height: 54 }}
              resizeMode="contain"
            />
          </Pressable>

          {isWideNav && (
            <View style={styles.navLinksRow}>
              <Pressable onPress={() => router.push('/')} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Fonctionnalités</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/')} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Comment ça marche</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/')} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>À propos</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/')} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Ressources</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/')} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Blog</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.navActionsRow}>
            <Pressable
              onPress={() => setIsDarkMode(!isDarkMode)}
              style={styles.themeToggleBtn}
              accessibilityLabel="Changer de thème"
            >
              {isDarkMode ? (
                <IconSun size={16} color="#FBBF24" />
              ) : (
                <IconMoon size={16} color="#94A3B8" />
              )}
            </Pressable>

            {isWideNav && (
              <>
                <Pressable
                  onPress={() => router.push('/login')}
                  style={styles.loginOutlineBtn}
                >
                  <Text style={styles.loginOutlineText}>Se connecter</Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/register')}
                  style={styles.commencerBtn}
                >
                  <Text style={styles.commencerBtnText}>Commencer</Text>
                </Pressable>
              </>
            )}

            {!isWideNav && (
              <Pressable
                onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={styles.hamburgerBtn}
              >
                {mobileMenuOpen ? (
                  <IconX size={20} color="#FFFFFF" />
                ) : (
                  <IconMenu size={20} color="#FFFFFF" />
                )}
              </Pressable>
            )}
          </View>
        </View>

        {mobileMenuOpen && !isWideNav && (
          <View style={styles.mobileNavDrawer}>
            <Pressable onPress={() => { setMobileMenuOpen(false); router.push('/'); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>Fonctionnalités</Text>
            </Pressable>
            <Pressable onPress={() => { setMobileMenuOpen(false); router.push('/'); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>Comment ça marche</Text>
            </Pressable>
            <Pressable onPress={() => { setMobileMenuOpen(false); router.push('/'); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>À propos</Text>
            </Pressable>
            <Pressable onPress={() => { setMobileMenuOpen(false); router.push('/'); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>Ressources</Text>
            </Pressable>
            <Pressable onPress={() => { setMobileMenuOpen(false); router.push('/'); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>Blog</Text>
            </Pressable>
            <View style={styles.mobileNavDivider} />
            <Pressable onPress={() => { setMobileMenuOpen(false); router.push('/login'); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>Se connecter</Text>
            </Pressable>
            <Pressable onPress={() => { setMobileMenuOpen(false); router.push('/register'); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>Commencer</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* =========================================================================
          MAIN LOGIN CONTENT (Deux colonnes : Argumentaire visuel à gauche + Formulaire à droite)
         ========================================================================= */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.mainLayout, isWide && styles.mainLayoutWide]}>
          {/* =============================================================
              COLONNE GAUCHE : Titre, Photo avec badges, 3 Cartes & Social Proof
             ============================================================= */}
          <View style={[styles.leftColumn, isWide && styles.leftColumnWide]}>
            {/* Grand titre avec "esprit critique." en turquoise */}
            <Text style={styles.leftHeadline}>
              Rejoignez TRAUNES AI{'\n'}
              et développez votre{'\n'}
              <Text style={styles.leftHeadlineTeal}>esprit critique.</Text>
            </Text>

            {/* Sous-titre descriptif */}
            <Text style={styles.leftSubtitle}>
              Créez votre compte et accédez à des outils pour vérifier l’information et apprendre chaque jour.
            </Text>

            {/* Carte Visuelle : Photo étudiante avec badges flottants */}
            <View style={styles.photoContainer}>
              <View style={styles.photoHalo} />
              <Image
                source={{ uri: '/images/hero-auth.png' }}
                style={styles.heroAuthImage}
                resizeMode="cover"
              />

              {/* Badge flottant 1 : Fiable */}
              <View style={styles.floatBadgeFiable}>
                <IconCheckCircle size={14} color="#10B981" />
                <Text style={styles.floatBadgeFiableText}>Fiable</Text>
              </View>

              {/* Badge flottant 2 : Source vérifiée */}
              <View style={styles.floatBadgeSource}>
                <IconCheckShield size={14} color="#14B8A6" />
                <Text style={styles.floatBadgeSourceText}>Source vérifiée</Text>
              </View>

              {/* Badge flottant 3 : Analyse IA */}
              <View style={styles.floatBadgeAnalyse}>
                <IconZap size={14} color="#F59E0B" />
                <Text style={styles.floatBadgeAnalyseText}>Analyse IA</Text>
              </View>
            </View>

            {/* 3 Cartes caractéristiques horizontales */}
            <View style={styles.threeFeaturesRow}>
              <View style={styles.featureMiniCard}>
                <View style={[styles.featureMiniIconBox, { backgroundColor: '#14B8A620' }]}>
                  <IconShield size={16} color="#14B8A6" />
                </View>
                <Text style={styles.featureMiniTitle}>Vérifiez</Text>
                <Text style={styles.featureMiniDesc}>
                  Analysez textes, images, vidéos et liens en quelques secondes.
                </Text>
              </View>

              <View style={styles.featureMiniCard}>
                <View style={[styles.featureMiniIconBox, { backgroundColor: '#10B98120' }]}>
                  <IconCheckCircle size={16} color="#10B981" />
                </View>
                <Text style={styles.featureMiniTitle}>Apprenez</Text>
                <Text style={styles.featureMiniDesc}>
                  Comprenez les mécanismes de désinformation grâce à des explications claires.
                </Text>
              </View>

              <View style={styles.featureMiniCard}>
                <View style={[styles.featureMiniIconBox, { backgroundColor: '#F59E0B20' }]}>
                  <IconZap size={16} color="#F59E0B" />
                </View>
                <Text style={styles.featureMiniTitle}>Progressez</Text>
                <Text style={styles.featureMiniDesc}>
                  Gagnez des badges, relevez des défis et montez en niveau.
                </Text>
              </View>
            </View>

            {/* Social Proof Row */}
            <View style={styles.socialProofRow}>
              <View style={styles.avatarsGroup}>
                <View style={[styles.avatarCircleSmall, { backgroundColor: '#EA580C', zIndex: 4 }]}>
                  <Text style={styles.avatarLetter}>A</Text>
                </View>
                <View style={[styles.avatarCircleSmall, { backgroundColor: '#BE185D', zIndex: 3, marginLeft: -8 }]}>
                  <Text style={styles.avatarLetter}>M</Text>
                </View>
                <View style={[styles.avatarCircleSmall, { backgroundColor: '#059669', zIndex: 2, marginLeft: -8 }]}>
                  <Text style={styles.avatarLetter}>K</Text>
                </View>
                <View style={[styles.avatarCircleSmall, { backgroundColor: '#0D9488', zIndex: 1, marginLeft: -8 }]}>
                  <Text style={styles.avatarLetter}>S</Text>
                </View>
              </View>

              <View style={styles.starsRow}>
                <Text style={styles.goldStars}>★★★★★</Text>
              </View>

              <Text style={styles.socialProofText}>
                Rejoint par des milliers de jeunes engagés pour une info responsable.
              </Text>
            </View>
          </View>

          {/* =============================================================
              COLONNE DROITE : Formulaire de Connexion Dark Card
             ============================================================= */}
          <View style={styles.rightColumn}>
            <View style={styles.loginCard}>
              <Text style={styles.cardHeading}>Content de vous revoir</Text>
              <Text style={styles.cardSubheading}>
                Connectez-vous pour continuer à vérifier l’information.
              </Text>

              {/* Message d'erreur */}
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Champ Email */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Adresse e-mail</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <IconMail size={18} color="#94A3B8" />
                  </View>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="exemple@email.com"
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Champ Mot de passe */}
              <View style={styles.formGroup}>
                <View style={styles.pwdHeaderRow}>
                  <Text style={styles.inputLabel}>Mot de passe</Text>
                  <Pressable onPress={() => router.push('/forgot-password')}>
                    <Text style={styles.forgotPwdLink}>Mot de passe oublié ?</Text>
                  </Pressable>
                </View>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <IconLock size={18} color="#94A3B8" />
                  </View>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Votre mot de passe"
                    placeholderTextColor="#64748B"
                    secureTextEntry={!showPassword}
                    style={styles.textInput}
                    onSubmitEditing={handleSubmit}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    accessibilityLabel="Afficher ou masquer le mot de passe"
                  >
                    {showPassword ? (
                      <IconEyeOff size={18} color="#94A3B8" />
                    ) : (
                      <IconEye size={18} color="#94A3B8" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Notice de confidentialité */}
              <View style={styles.privacyNoticeBox}>
                <IconShield size={16} color="#14B8A6" />
                <Text style={styles.privacyNoticeText}>
                  Nous ne partagerons jamais vos données personnelles.
                </Text>
              </View>

              {/* Bouton Se connecter */}
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={({ hovered }: any) => [
                  styles.submitBtn,
                  hovered && !loading && styles.submitBtnHovered,
                  loading && styles.submitBtnDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Se connecter</Text>
                )}
              </Pressable>

              {/* Séparateur */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou continuer avec</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Bouton Google */}
              <Pressable
                onPress={handleGoogleSignIn}
                style={({ hovered }: any) => [
                  styles.googleBtn,
                  hovered && styles.googleBtnHovered,
                ]}
              >
                <IconGoogle size={18} />
                <Text style={styles.googleBtnText}>Continuer avec Google</Text>
              </Pressable>

              {/* Bouton Session Démo en 1 clic */}
              <Pressable onPress={handleQuickDemo} style={styles.quickDemoPill}>
                <IconShield size={14} color="#14B8A6" />
                <Text style={styles.quickDemoText}>Accès rapide session démo (1 clic)</Text>
              </Pressable>

              {/* Lien Créer un compte */}
              <View style={styles.signupPromptRow}>
                <Text style={styles.signupPromptText}>Pas encore de compte ? </Text>
                <Pressable onPress={() => router.push('/register')}>
                  <Text style={styles.signupLinkText}>Créer un compte</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#07131F',
  },
  navbar: {
    backgroundColor: 'rgba(7, 19, 31, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    position: 'sticky' as any,
    top: 0,
    zIndex: 50,
  },
  navbarContent: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoShieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0F2537',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoTagline: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navLinkItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CBD5E1',
  },
  navActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0B1B2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginOutlineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    backgroundColor: '#0A1B2C',
  },
  loginOutlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  commencerBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#0D9488',
  },
  commencerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hamburgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#0F2537',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileNavDrawer: {
    backgroundColor: '#0A1B2C',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    padding: 16,
    gap: 12,
  },
  mobileNavItem: {
    paddingVertical: 8,
  },
  mobileNavDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4,
  },
  mobileNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  scrollContent: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    minHeight: '100%',
    alignItems: 'center',
  },
  mainLayout: {
    width: '100%',
    maxWidth: 1300,
    flexDirection: 'column',
    gap: 40,
  },
  mainLayoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 48,
  },
  leftColumn: {
    width: '100%',
    maxWidth: 640,
  },
  leftColumnWide: {
    flex: 1.1,
  },
  leftHeadline: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 52,
    letterSpacing: -0.8,
    marginBottom: 16,
  },
  leftHeadlineTeal: {
    color: '#14B8A6',
  },
  leftSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 23,
    maxWidth: 500,
    marginBottom: 28,
  },
  photoContainer: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    backgroundColor: '#0A1826',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 28,
  },
  photoHalo: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#0F766E',
    opacity: 0.75,
  },
  heroAuthImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  floatBadgeFiable: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 24, 38, 0.92)',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  floatBadgeFiableText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  floatBadgeSource: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 24, 38, 0.92)',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  floatBadgeSourceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  floatBadgeAnalyse: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 24, 38, 0.92)',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  floatBadgeAnalyseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  threeFeaturesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  featureMiniCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#0B1B2B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  featureMiniIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureMiniTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureMiniDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  socialProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  avatarsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircleSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#07131F',
  },
  avatarLetter: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  starsRow: {},
  goldStars: {
    color: '#FBBF24',
    fontSize: 14,
    letterSpacing: 2,
  },
  socialProofText: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
    minWidth: 200,
  },
  rightColumn: {
    width: '100%',
    maxWidth: 500,
  },
  loginCard: {
    backgroundColor: '#0A1826',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  cardHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardSubheading: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 6,
  },
  pwdHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPwdLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#14B8A6',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07131F',
    borderWidth: 1.5,
    borderColor: '#1E3A5F',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#FFFFFF',
  },
  eyeBtn: {
    padding: 4,
  },
  privacyNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  privacyNoticeText: {
    fontSize: 12,
    color: '#CCFBF1',
    flex: 1,
    lineHeight: 16,
  },
  submitBtn: {
    backgroundColor: '#0D9488',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  submitBtnHovered: {
    backgroundColor: '#0F766E',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  dividerText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#07131F',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    height: 48,
    borderRadius: 12,
    marginBottom: 16,
  },
  googleBtnHovered: {
    backgroundColor: '#0F2537',
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  quickDemoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 118, 110, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 20,
  },
  quickDemoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#14B8A6',
  },
  signupPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupPromptText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  signupLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14B8A6',
  },
});
