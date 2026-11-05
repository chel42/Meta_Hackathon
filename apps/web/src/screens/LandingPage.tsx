import React, { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TraunesAILogo } from '../components/ui/TraunesAILogo';
import { THEME } from '../theme/colors';
import {
  IconShield,
  IconCheck,
  IconCheckCircle,
  IconArrowRight,
  IconSun,
  IconMoon,
  IconSparkles,
  IconFileText,
  IconVideo,
  IconLink2,
  IconImage,
  IconGraduationCap,
  IconGamepad,
  IconAward,
  IconMap,
  IconUsers,
  IconSearch,
  IconMenu,
  IconX,
} from '../icons/Icons';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isAuthenticated } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const isDesktop = width >= 1024;
  const isWideDesktop = width >= 1200;
  const isTablet = width >= 768 && width < 1024;

  const scrollToSection = (yOffset: number) => {
    setMobileMenuOpen(false);
    scrollViewRef.current?.scrollTo({ y: yOffset, animated: true });
  };

  return (
    <View style={styles.pageContainer}>
      {/* =========================================================================
          1. NAVIGATION BAR (Style sombre moderne identique à la maquette)
         ========================================================================= */}
      <View style={styles.navbar}>
        <View style={styles.navbarContent}>
          {/* Logo TRAUNES AI */}
          <Pressable onPress={() => router.push('/')} style={styles.navLogoContainer}>
            <Image
              source={{ uri: '/logo.png' }}
              style={{ width: isWideDesktop ? 200 : 140, height: 54 }}
              resizeMode="contain"
            />
          </Pressable>

          {/* Liens de navigation centraux — Identique à la maquette */}
          {isWideDesktop && (
            <View style={styles.navLinksRow}>
              <Pressable onPress={() => scrollToSection(720)} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Fonctionnalités</Text>
              </Pressable>
              <Pressable onPress={() => scrollToSection(1200)} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Comment ça marche</Text>
              </Pressable>
              <Pressable onPress={() => scrollToSection(1600)} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>À propos</Text>
              </Pressable>
              <Pressable onPress={() => scrollToSection(2100)} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Ressources</Text>
              </Pressable>
              <Pressable onPress={() => scrollToSection(2600)} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Blog</Text>
              </Pressable>
            </View>
          )}

          {/* Boutons d'action à droite — Identique à la maquette */}
          <View style={styles.navActionsRow}>
            {/* Bouton bascule de thème */}
            <Pressable
              onPress={toggleTheme}
              style={styles.themeToggleBtn}
              accessibilityLabel="Changer de thème"
            >
              {isDarkMode ? (
                <IconSun size={16} color="#FBBF24" />
              ) : (
                <IconMoon size={16} color="#94A3B8" />
              )}
            </Pressable>

            {isWideDesktop && (
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

            {/* Menu hamburger mobile */}
            {!isWideDesktop && (
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

        {/* Menu déroulant mobile */}
        {mobileMenuOpen && !isWideDesktop && (
          <View style={styles.mobileNavDrawer}>
            <Pressable onPress={() => { setMobileMenuOpen(false); scrollToSection(720); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>Fonctionnalités</Text>
            </Pressable>
            <Pressable onPress={() => { setMobileMenuOpen(false); scrollToSection(1200); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>Comment ça marche</Text>
            </Pressable>
            <Pressable onPress={() => { setMobileMenuOpen(false); scrollToSection(1600); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>À propos</Text>
            </Pressable>
            <Pressable onPress={() => { setMobileMenuOpen(false); scrollToSection(2100); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>Ressources</Text>
            </Pressable>
            <Pressable onPress={() => { setMobileMenuOpen(false); scrollToSection(2600); }} style={styles.mobileNavItem}>
              <Text style={styles.mobileNavText}>Blog</Text>
            </Pressable>
            <View style={styles.mobileNavDivider} />
            <Pressable onPress={() => { setMobileMenuOpen(false); router.push('/login'); }} style={styles.mobileNavItem}>
              <Text style={[styles.mobileNavText, { color: '#E2E8F0' }]}>Se connecter</Text>
            </Pressable>
            <Pressable onPress={() => { setMobileMenuOpen(false); router.push('/register'); }} style={[styles.mobileNavItem, { backgroundColor: '#0D9488', borderRadius: 8, paddingHorizontal: 12 }]}>
              <Text style={[styles.mobileNavText, { color: '#FFFFFF' }]}>Commencer</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* =========================================================================
          CONTENU PRINCIPAL SCROLLABLE
         ========================================================================= */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            2. HERO SECTION (100% IDENTIQUE À L'IMAGE PARTAGÉE)
           ========================================================================= */}
        <View style={styles.heroSection}>
          <View style={styles.heroAmbientGlow} />

          <View style={[styles.heroContainer, isDesktop && styles.heroContainerDesktop]}>
            {/* Colonne Gauche : Titre percutant, swoosh jaune, boutons CTA */}
            <View style={styles.heroLeftCol}>
              {/* Badge TRAUNES AI */}
              <View style={styles.heroBrandBadge}>
                <View style={styles.heroBrandBadgeIcon}>
                  <IconShield size={14} color="#14B8A6" />
                </View>
                <Text style={styles.heroBrandBadgeText}>TRAUNES AI</Text>
              </View>

              {/* Titre Principal avec "partager" souligné en jaune */}
              <Text style={styles.heroHeadline}>
                Vérifiez avant de{'\n'}
                <Text style={styles.heroWordHighlight}>partager</Text>
              </Text>

              {/* Ligne incurvée dorée sous "partager" */}
              <View style={styles.yellowSwooshWrapper}>
                <svg width="220" height="12" viewBox="0 0 220 12" fill="none">
                  <path
                    d="M2 9C40 3 90 3 120 7C160 11 190 11 218 4"
                    stroke="#F59E0B"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </View>

              {/* Sous-titre officiel */}
              <Text style={styles.heroSubDescription}>
                TRAUNES AI analyse textes, images, vidéos et liens pour vous donner un verdict clair — et vous aider à comprendre ce qui se cache derrière l’information.
              </Text>

              {/* Rangée de boutons d'action */}
              <View style={styles.heroActionBtnsRow}>
                <Pressable
                  onPress={() => router.push('/register')}
                  style={({ hovered }: any) => [
                    styles.primaryCtaBtn,
                    hovered && styles.primaryCtaBtnHovered,
                  ]}
                >
                  <Text style={styles.primaryCtaBtnText}>Commencer gratuitement</Text>
                  <IconArrowRight size={16} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  onPress={() => scrollToSection(1200)}
                  style={({ hovered }: any) => [
                    styles.secondaryOutlineBtn,
                    hovered && styles.secondaryOutlineBtnHovered,
                  ]}
                >
                  <Text style={styles.secondaryOutlineBtnText}>Voir comment ça marche</Text>
                </Pressable>
              </View>

              {/* Micro-légende de confiance */}
              <Text style={styles.heroMicroFeatures}>
                Détection • Verdict expliqué • Formation EMI
              </Text>
            </View>

            {/* Colonne Droite : Visuel mockup avec les jeunes vérificateurs avec tablette, halo turquoise et cartes flottantes */}
            <View style={styles.heroRightCol}>
              <View style={styles.heroVisualOuterCard}>
                {/* Photo équipe avec ordinateur portable (fond blanc 100% retiré) */}
                <Image
                  source={{ uri: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_22.03.22_66fa0b61.jpeg' }}
                  style={styles.heroStudentPhoto}
                  resizeMode="cover"
                />

                {/* =============================================================
                    CARTE FLOTTANTE 1 : Analyse IA (Haut gauche)
                   ============================================================= */}
                <View style={styles.floatCardAnalyseIA}>
                  <Text style={styles.floatCardAnalyseTitle}>Analyse IA</Text>
                  <View style={styles.floatCardAnalyseRow}>
                    <View style={styles.radialGaugeContainer}>
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          fill="none"
                          stroke="#1E293B"
                          strokeWidth="3.5"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          fill="none"
                          stroke="#14B8A6"
                          strokeWidth="3.5"
                          strokeDasharray="82 100"
                          strokeLinecap="round"
                          transform="rotate(-90 20 20)"
                        />
                      </svg>
                      <Text style={styles.radialGaugeText}>82%</Text>
                    </View>
                    <View>
                      <Text style={styles.floatCardLabel}>Fiabilité</Text>
                      <Text style={styles.floatCardModeree}>Modérée</Text>
                    </View>
                  </View>
                </View>

                {/* =============================================================
                    CARTE FLOTTANTE 2 : Source fiable (Haut droite)
                   ============================================================= */}
                <View style={styles.floatCardSourceFiable}>
                  <View style={styles.floatCardSourceRow}>
                    <View style={styles.sourceShieldCircle}>
                      <IconShield size={14} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={styles.sourceFiableTitle}>Source fiable</Text>
                      <Text style={styles.sourceFiableLevel}>Élevée</Text>
                    </View>
                  </View>
                  <View style={styles.sourceProgressBarTrack}>
                    <View style={styles.sourceProgressBarFill} />
                  </View>
                </View>

                {/* =============================================================
                    CARTE FLOTTANTE 3 : Vérification 4 formats (Bas droite)
                   ============================================================= */}
                <View style={styles.floatCardVerification}>
                  <Text style={styles.verificationHeading}>Vérification</Text>
                  <View style={styles.verificationItemList}>
                    <View style={styles.verificationItemRow}>
                      <View style={styles.verificationItemLeft}>
                        <IconFileText size={13} color="#14B8A6" />
                        <Text style={styles.verificationItemText}>Texte</Text>
                      </View>
                      <IconCheckCircle size={14} color="#14B8A6" />
                    </View>
                    <View style={styles.verificationItemRow}>
                      <View style={styles.verificationItemLeft}>
                        <IconImage size={13} color="#10B981" />
                        <Text style={styles.verificationItemText}>Image</Text>
                      </View>
                      <IconCheckCircle size={14} color="#14B8A6" />
                    </View>
                    <View style={styles.verificationItemRow}>
                      <View style={styles.verificationItemLeft}>
                        <IconVideo size={13} color="#F59E0B" />
                        <Text style={styles.verificationItemText}>Vidéo</Text>
                      </View>
                      <IconCheckCircle size={14} color="#14B8A6" />
                    </View>
                    <View style={styles.verificationItemRow}>
                      <View style={styles.verificationItemLeft}>
                        <IconLink2 size={13} color="#38BDF8" />
                        <Text style={styles.verificationItemText}>Lien</Text>
                      </View>
                      <IconCheckCircle size={14} color="#14B8A6" />
                    </View>
                  </View>
                </View>

                {/* =============================================================
                    PASTILLE FLOTTANTE 4 : Analyse en temps réel (Bas gauche)
                   ============================================================= */}
                <View style={styles.floatPillRealtime}>
                  <IconSparkles size={14} color="#14B8A6" />
                  <Text style={styles.floatPillRealtimeText}>Analyse en temps réel</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* =========================================================================
            3. SECTION PILIERS DE VALEUR (Analysez • Comprenez • Apprenez • Progressez)
           ========================================================================= */}
        <View style={styles.pillarsSection}>
          <View style={styles.sectionHeaderCentered}>
            <Text style={styles.sectionSmallTag}>MÉTHODOLOGIE TRAUNES AI</Text>
            <Text style={styles.sectionHeadline}>L’esprit critique comme réflexe quotidien</Text>
            <Text style={styles.sectionSubtitleText}>
              Une approche rigoureuse pour ne plus jamais partager sans certitude factuelle.
            </Text>
          </View>

          <View style={[styles.pillarsGrid, isDesktop && styles.pillarsGridDesktop]}>
            <View style={styles.pillarCard}>
              <View style={[styles.pillarIconBox, { backgroundColor: '#0F766E22' }]}>
                <IconSearch size={22} color="#14B8A6" />
              </View>
              <Text style={styles.pillarTitle}>Analysez</Text>
              <Text style={styles.pillarDesc}>
                Textes, images truquées, vidéos ralenties ou liens d’articles en quelques secondes.
              </Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={[styles.pillarIconBox, { backgroundColor: '#10B98122' }]}>
                <IconShield size={22} color="#10B981" />
              </View>
              <Text style={styles.pillarTitle}>Comprenez</Text>
              <Text style={styles.pillarDesc}>
                Des explications claires et transparentes sur les sources primaires et les limites méthodologiques.
              </Text>
            </View>

            <View style={styles.pillarCard}>
              <View style={[styles.pillarIconBox, { backgroundColor: '#F59E0B22' }]}>
                <IconGraduationCap size={22} color="#F59E0B" />
              </View>
              <Text style={styles.pillarTitle}>Apprenez</Text>
              <Text style={styles.pillarDesc}>
                Cours d’Éducation aux Médias, détection des deepfakes et décryptage des biais cognitifs.
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            4. SECTION COMMENT ÇA MARCHE (01 • 02 • 03)
           ========================================================================= */}
        <View style={styles.howItWorksSection}>
          <View style={styles.sectionHeaderCentered}>
            <Text style={styles.sectionSmallTag}>PARCOURS SIMPLE</Text>
            <Text style={styles.sectionHeadline}>Comment fonctionne TRAUNES AI ?</Text>
          </View>

          <View style={[styles.stepsGrid, isDesktop && styles.stepsGridDesktop]}>
            <View style={styles.stepCard}>
              <Text style={styles.stepNumberText}>01</Text>
              <Text style={styles.stepTitle}>Soumettez une information</Text>
              <Text style={styles.stepDesc}>
                Collez un texte, importez une capture d’écran, partagez un lien ou soumettez une vidéo virale.
              </Text>
            </View>

            <View style={styles.stepCard}>
              <Text style={styles.stepNumberText}>02</Text>
              <Text style={styles.stepTitle}>Obtenez un verdict sourcé</Text>
              <Text style={styles.stepDesc}>
                TRAUNES AI croise les bases fact-checking, analyse l’authenticité des métadonnées et évalue la fiabilité.
              </Text>
            </View>

            <View style={styles.stepCard}>
              <Text style={styles.stepNumberText}>03</Text>
              <Text style={styles.stepTitle}>Développez votre regard critique</Text>
              <Text style={styles.stepDesc}>
                Consultez le dossier de preuve complet, apprenez les réflexes clés et partagez avec discernement.
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            5. MODULES COMPLETS DE LA PLATEFORME (ACCÈS DIRECTS)
           ========================================================================= */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeaderCentered}>
            <Text style={styles.sectionSmallTag}>ÉCOSYSTÈME TRAUNES AI</Text>
            <Text style={styles.sectionHeadline}>Tout ce dont vous avez besoin pour vérifier</Text>
          </View>

          <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
            <Pressable
              onPress={() => router.push('/new-check')}
              style={styles.featureInteractiveCard}
            >
              <View style={[styles.featureIconBadge, { backgroundColor: '#14B8A620' }]}>
                <IconShield size={20} color="#14B8A6" />
              </View>
              <Text style={styles.featureCardTitle}>Vérification multi-formats</Text>
              <Text style={styles.featureCardDesc}>
                Analyse sémantique poussée de textes, détection d’images hors contexte et audit de liens.
              </Text>
              <View style={styles.featureCardLink}>
                <Text style={styles.featureCardLinkText}>Lancer une vérification</Text>
                <IconArrowRight size={14} color="#14B8A6" />
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/academie-emi')}
              style={styles.featureInteractiveCard}
            >
              <View style={[styles.featureIconBadge, { backgroundColor: '#F59E0B20' }]}>
                <IconGraduationCap size={20} color="#F59E0B" />
              </View>
              <Text style={styles.featureCardTitle}>Académie EMI</Text>
              <Text style={styles.featureCardDesc}>
                8 modules pédagogiques complets sur les biais de confirmation, les deepfakes et les sources.
              </Text>
              <View style={styles.featureCardLink}>
                <Text style={styles.featureCardLinkText}>Accéder aux cours</Text>
                <IconArrowRight size={14} color="#14B8A6" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* =========================================================================
            6. BANNIÈRE D'APPEL À L'ACTION FINALE
           ========================================================================= */}
        <View style={styles.finalCtaSection}>
          <View style={styles.finalCtaCard}>
            <Image
              source={{ uri: '/assets/aistudio/WhatsApp_Image_2026-11-03_at_22.03.22_66fa0b61.jpeg' }}
              style={styles.finalCtaImageBg}
              resizeMode="cover"
            />
            <View style={styles.finalCtaOverlay} />

            <View style={styles.finalCtaContent}>
              <Text style={styles.finalCtaTitle}>Prêt à vérifier avant de partager ?</Text>
              <Text style={styles.finalCtaDesc}>
                Rejoignez TRAUNES AI et transformez chaque doute en réflexe critique — en quelques secondes, avec des preuves tangibles.
              </Text>
              <View style={styles.finalCtaButtonsRow}>
                <Pressable
                  onPress={() => router.push('/register')}
                  style={styles.finalCtaPrimaryBtn}
                >
                  <Text style={styles.finalCtaPrimaryBtnText}>Créer un compte gratuit</Text>
                  <IconArrowRight size={16} color="#07131F" />
                </Pressable>
                <Pressable
                  onPress={() => router.push('/login')}
                  style={styles.finalCtaOutlineBtn}
                >
                  <Text style={styles.finalCtaOutlineBtnText}>J’ai déjà un compte</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* =========================================================================
            7. FOOTER
           ========================================================================= */}
        <View style={styles.footerSection}>
          <View style={styles.footerInner}>
            <View style={styles.footerTopRow}>
              <View style={styles.footerBrandBlock}>
                <Image
                  source={{ uri: '/logo.png' }}
                  style={{ width: 300, height: 75, marginBottom: 12 }}
                  resizeMode="contain"
                />
                <Text style={styles.footerTagline}>
                  Vérifier • Comprendre • Décider
                </Text>
                <Text style={styles.footerMission}>
                  Plateforme indépendante d’évaluation de la fiabilité de l’information et d’éducation aux médias.
                </Text>
              </View>

              <View style={styles.footerLinksGrid}>
                <View style={styles.footerColumn}>
                  <Text style={styles.footerColHeading}>Fonctionnalités</Text>
                  <Pressable onPress={() => router.push('/new-check')}>
                    <Text style={styles.footerLink}>Vérification</Text>
                  </Pressable>
                  <Pressable onPress={() => router.push('/academie-emi')}>
                    <Text style={styles.footerLink}>Académie EMI</Text>
                  </Pressable>
                </View>

                <View style={styles.footerColumn}>
                  <Text style={styles.footerColHeading}>Légal</Text>
                  <Text style={styles.footerLink}>Charte éthique</Text>
                  <Text style={styles.footerLink}>Méthodologie TRAUNES AI</Text>
                  <Text style={styles.footerLink}>Protection des données</Text>
                </View>
              </View>
            </View>

            <View style={styles.footerBottomBar}>
              <Text style={styles.footerCopyright}>
                © 2026 TRAUNES AI — Tous droits réservés. L’information vérifiée pour un monde éclairé.
              </Text>
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
    backgroundColor: 'rgba(7, 19, 31, 0.92)',
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
  mobileNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  mobileNavDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 4,
  },
  mainScroll: {
    flex: 1,
  },
  heroSection: {
    position: 'relative',
    paddingVertical: 48,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  heroAmbientGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
  },
  heroContainer: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 48,
  },
  heroContainerDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  heroLeftCol: {
    flex: 1,
    maxWidth: 620,
  },
  heroBrandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 118, 110, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  heroBrandBadgeIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBrandBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5EEAD4',
    letterSpacing: 0.5,
  },
  heroHeadline: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 56,
    letterSpacing: -1,
  },
  heroWordHighlight: {
    color: '#14B8A6',
  },
  yellowSwooshWrapper: {
    marginTop: -4,
    marginBottom: 20,
  },
  heroSubDescription: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 25,
    marginBottom: 32,
    maxWidth: 540,
  },
  heroActionBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 24,
  },
  primaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#0D9488',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  primaryCtaBtnHovered: {
    backgroundColor: '#0F766E',
  },
  primaryCtaBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryOutlineBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0B1B2B',
  },
  secondaryOutlineBtnHovered: {
    borderColor: '#64748B',
    backgroundColor: '#0F2537',
  },
  secondaryOutlineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  heroMicroFeatures: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  heroRightCol: {
    flex: 1,
    maxWidth: 600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroVisualOuterCard: {
    width: '100%',
    maxWidth: 580,
    height: 480,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    backgroundColor: '#0A1826',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0D9488',
    shadowOpacity: 0.22,
    shadowRadius: 36,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
   heroStudentPhoto: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    transform: [{ scale: 1.4 }],
  },
  floatCardAnalyseIA: {
    position: 'absolute',
    top: 24,
    left: 20,
    backgroundColor: 'rgba(10, 24, 38, 0.92)',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 16,
    padding: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  floatCardAnalyseTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  floatCardAnalyseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radialGaugeContainer: {
    width: 40,
    height: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialGaugeText: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '800',
    color: '#14B8A6',
  },
  floatCardLabel: {
    fontSize: 9,
    color: '#94A3B8',
  },
  floatCardModeree: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  floatCardSourceFiable: {
    position: 'absolute',
    top: 28,
    right: 20,
    backgroundColor: 'rgba(10, 24, 38, 0.92)',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 14,
    padding: 12,
    minWidth: 130,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  floatCardSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sourceShieldCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceFiableTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sourceFiableLevel: {
    fontSize: 9,
    color: '#14B8A6',
    fontWeight: '600',
  },
  sourceProgressBarTrack: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sourceProgressBarFill: {
    width: '85%',
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 2,
  },
  floatCardVerification: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: 'rgba(10, 24, 38, 0.92)',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    borderRadius: 16,
    padding: 14,
    minWidth: 140,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  verificationHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  verificationItemList: {
    gap: 6,
  },
  verificationItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  verificationItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verificationItemText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  floatPillRealtime: {
    position: 'absolute',
    bottom: 24,
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
  floatPillRealtimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  pillarsSection: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    backgroundColor: '#06101A',
  },
  sectionHeaderCentered: {
    maxWidth: 720,
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 44,
  },
  sectionSmallTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#14B8A6',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionHeadline: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionSubtitleText: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
  pillarsGrid: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 20,
  },
  pillarsGridDesktop: {
    flexDirection: 'row',
  },
  pillarCard: {
    flex: 1,
    backgroundColor: '#0B1B2B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  pillarIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pillarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  pillarDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 19,
  },
  howItWorksSection: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    backgroundColor: '#07131F',
  },
  stepsGrid: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 20,
  },
  stepsGridDesktop: {
    flexDirection: 'row',
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#0B1B2B',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  stepNumberText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0D9488',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
  },
  featuresSection: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    backgroundColor: '#06101A',
  },
  featuresGrid: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 20,
  },
  featuresGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureInteractiveCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: '#0B1B2B',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  featureIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureCardDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 19,
    marginBottom: 16,
  },
  featureCardLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 'auto',
  },
  featureCardLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14B8A6',
  },
  finalCtaSection: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: '#07131F',
  },
  finalCtaCard: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 280,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  finalCtaImageBg: {
    ...StyleSheet.absoluteFillObject,
  },
  finalCtaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 19, 31, 0.88)',
  },
  finalCtaContent: {
    position: 'relative',
    zIndex: 2,
    padding: 40,
    alignItems: 'center',
    maxWidth: 720,
    alignSelf: 'center',
  },
  finalCtaTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  finalCtaDesc: {
    fontSize: 15,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  finalCtaButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  finalCtaPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#14B8A6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  finalCtaPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#07131F',
  },
  finalCtaOutlineBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  finalCtaOutlineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerSection: {
    backgroundColor: '#050D15',
    borderTopWidth: 1,
    borderTopColor: '#0F2537',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  footerInner: {
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
  },
  footerTopRow: {
    flexDirection: 'column',
    gap: 36,
    marginBottom: 36,
  },
  footerBrandBlock: {
    maxWidth: 360,
  },
  footerTagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#14B8A6',
    marginVertical: 6,
  },
  footerMission: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  footerLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 36,
  },
  footerColumn: {
    minWidth: 140,
    gap: 10,
  },
  footerColHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 13,
    color: '#94A3B8',
  },
  footerBottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#0F2537',
    paddingTop: 24,
    alignItems: 'center',
  },
  footerCopyright: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
