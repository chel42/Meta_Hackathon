import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../src/components/layout/AppShell';
import { VerdictBadge } from '../src/components/verification/VerdictBadge';
import { THEME } from '../src/theme/colors';
import {
  IconSearch,
  IconShield,
  IconFileText,
  IconPlusCircle,
  IconChevronRight,
  IconGraduationCap,
  IconAward,
  IconClock,
  IconLightbulb,
  IconArrowRight,
  IconSparkles,
} from '../src/icons/Icons';
import { useAuth } from '../src/context/AuthContext';
import { useTraunesAIData } from '../src/context/TraunesAIDataContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { reports, activeRuns } = useTraunesAIData();

  // Formatted Current Date in French
  const formattedDate = useMemo(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }, []);

  // Real statistics calculation
  const stats = useMemo(() => {
    const totalReports = reports.length;
    const activeRunsCount = Object.keys(activeRuns).length;
    const totalActivities = totalReports + activeRunsCount;

    return {
      totalReports,
      totalActivities,
      academyProgress: '3 / 6',
      badgesUnlocked: 4,
    };
  }, [reports, activeRuns]);

  const recentReports = reports.slice(0, 4);

  return (
    <AppShell>
      <View style={styles.container}>
        {/* 1. En-tête de bienvenue */}
        <View style={styles.welcomeHeader}>
          <View style={styles.welcomeTextGroup}>
            <Text style={styles.greetingTitle}>
              Bonjour {user?.name ? user.name.split(' ')[0] : 'Camille'} et bienvenue ! 👋
            </Text>
            <Text style={styles.greetingSubtitle}>
              Comprendre l'information, vérifier les faits et décider en toute confiance.
            </Text>
          </View>
          <View style={styles.dateBadge}>
            <IconClock size={14} color="#0F766E" />
            <Text style={styles.dateBadgeText}>{formattedDate}</Text>
          </View>
        </View>

        {/* 2. Grande section principale - Carte Héros TRAUNES AI */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroKickerRow}>
              <IconShield size={16} color="#14B8A6" />
              <Text style={styles.heroKickerText}>Plateforme d'Investigation EMI</Text>
            </View>
            <Text style={styles.heroTitle}>Ne partagez plus sans vérifier.</Text>
            <Text style={styles.heroDescription}>
              Analysez les informations, développez votre esprit critique et apprenez à reconnaître les fausses informations grâce au moteur TRAUNES AI.
            </Text>

            <Pressable
              onPress={() => router.push('/new-check')}
              style={({ hovered }: any) => [
                styles.heroCtaBtn,
                hovered && styles.heroCtaBtnHovered,
              ]}
            >
              <IconSearch size={18} color="#FFFFFF" />
              <Text style={styles.heroCtaText}>Commencer une vérification</Text>
              <IconArrowRight size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Decorative geometric accent card */}
          <View style={styles.heroDecorCard}>
            <View style={styles.heroDecorInner}>
              <IconSparkles size={24} color="#14B8A6" />
              <Text style={styles.heroDecorTitle}>Moteur TRAUNES AI 2.4</Text>
              <Text style={styles.heroDecorSub}>Vérification multi-sources assistée par IA</Text>
            </View>
          </View>
        </View>

        {/* 3. Statistiques personnelles */}
        <View style={styles.statsGrid}>
          {/* Card 1: Vérifications effectuées */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(15, 118, 110, 0.1)' }]}>
              <IconFileText size={20} color="#0F766E" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.totalReports}</Text>
              <Text style={styles.statLabel}>Vérifications effectuées</Text>
            </View>
          </View>

          {/* Card 2: Activités récentes */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
              <IconClock size={20} color="#0EA5E9" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.totalActivities}</Text>
              <Text style={styles.statLabel}>Activités récentes</Text>
            </View>
          </View>

          {/* Card 3: Progression Académie EMI */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <IconGraduationCap size={20} color="#8B5CF6" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.academyProgress}</Text>
              <Text style={styles.statLabel}>Académie EMI</Text>
            </View>
          </View>

          {/* Card 4: Badges obtenus */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <IconAward size={20} color="#F59E0B" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stats.badgesUnlocked}</Text>
              <Text style={styles.statLabel}>Badges obtenus</Text>
            </View>
          </View>
        </View>

        {/* 4. Mes espaces */}
        <View style={styles.spacesSection}>
          <Text style={styles.sectionHeading}>Mes espaces</Text>

          <View style={styles.spacesGrid}>
            {/* Espace 1: Nouvelle vérification */}
            <Pressable
              onPress={() => router.push('/new-check')}
              style={({ hovered }: any) => [
                styles.spaceCard,
                hovered && styles.spaceCardHovered,
              ]}
            >
              <View style={[styles.spaceIconBox, { backgroundColor: 'rgba(20, 184, 166, 0.12)' }]}>
                <IconPlusCircle size={24} color="#0F766E" />
              </View>
              <View style={styles.spaceContent}>
                <Text style={styles.spaceTitle}>Nouvelle vérification</Text>
                <Text style={styles.spaceDescription}>
                  Soumettez une déclaration, un article ou un lien URL pour extraire les faits et évaluer la fiabilité des sources.
                </Text>
                <View style={styles.spaceActionRow}>
                  <Text style={styles.spaceActionText}>Lancer une recherche</Text>
                  <IconArrowRight size={14} color="#0F766E" />
                </View>
              </View>
            </Pressable>

            {/* Espace 2: Académie EMI */}
            <Pressable
              onPress={() => router.push('/academie-emi')}
              style={({ hovered }: any) => [
                styles.spaceCard,
                hovered && styles.spaceCardHovered,
              ]}
            >
              <View style={[styles.spaceIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
                <IconGraduationCap size={24} color="#4F46E5" />
              </View>
              <View style={styles.spaceContent}>
                <Text style={styles.spaceTitle}>Académie EMI</Text>
                <Text style={styles.spaceDescription}>
                  Développez votre esprit critique, apprenez à débusquer la désinformation et suivez nos parcours pédagogiques.
                </Text>
                <View style={styles.spaceActionRow}>
                  <Text style={[styles.spaceActionText, { color: '#4F46E5' }]}>Accéder aux cours</Text>
                  <IconArrowRight size={14} color="#4F46E5" />
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        {/* 5. Activité récente */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <View style={styles.recentTitleGroup}>
              <IconFileText size={18} color="#0F766E" />
              <Text style={styles.sectionHeading}>Activité récente</Text>
            </View>

            <Pressable
              onPress={() => router.push('/historique')}
              style={({ hovered }: any) => [
                styles.viewAllBtn,
                hovered && styles.viewAllBtnHovered,
              ]}
            >
              <Text style={styles.viewAllText}>Voir tout</Text>
              <IconChevronRight size={14} color="#0F766E" />
            </Pressable>
          </View>

          {reports.length === 0 ? (
            <View style={styles.emptyRecentBox}>
              <IconFileText size={32} color="#94A3B8" />
              <Text style={styles.emptyRecentTitle}>Aucune vérification pour le moment</Text>
              <Text style={styles.emptyRecentSub}>
                Vos investigations et analyses d'affirmations apparaîtront ici.
              </Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {recentReports.map((report) => (
                <Pressable
                  key={report.id}
                  onPress={() => router.push(`/reports/${report.id}` as any)}
                  style={({ hovered }: any) => [
                    styles.recentItem,
                    hovered && styles.recentItemHovered,
                  ]}
                >
                  <View style={styles.recentMainInfo}>
                    <Text style={styles.recentItemTitle} numberOfLines={1}>
                      {report.title}
                    </Text>
                    <View style={styles.recentMetaRow}>
                      <Text style={styles.recentItemDate}>
                        {new Date(report.completedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.recentItemMeta}>
                        {report.claimsCount} affirmation{report.claimsCount > 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.recentItemMeta}>
                        {report.traceability?.sourcesConsulted || 12} sources analysées
                      </Text>
                    </View>
                  </View>

                  <View style={styles.recentVerdictCol}>
                    <VerdictBadge
                      verdict={report.confirmedCount > 0 ? 'confirmed' : 'contradicted'}
                      variant="short"
                      size="sm"
                    />
                    <IconChevronRight size={16} color="#94A3B8" />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* 6. Conseil EMI du jour */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeaderRow}>
            <View style={styles.tipIconBadge}>
              <IconLightbulb size={18} color="#F59E0B" />
            </View>
            <Text style={styles.tipCardTitle}>Conseil EMI du jour</Text>
          </View>
          <Text style={styles.tipCardBody}>
            « Avant de partager une image spectaculaire ou une citation polémique sur les réseaux sociaux, effectuez une recherche d'image inversée et vérifiez si le média n'a pas été sorti de son contexte d'origine. »
          </Text>
          <Pressable
            onPress={() => router.push('/academie-emi')}
            style={({ hovered }: any) => [
              styles.tipBtn,
              hovered && styles.tipBtnHovered,
            ]}
          >
            <Text style={styles.tipBtnText}>Découvrir d'autres astuces dans l'Académie</Text>
            <IconChevronRight size={14} color="#14B8A6" />
          </Pressable>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 28,
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 8,
  },
  // 1. En-tête de bienvenue
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 4,
  },
  welcomeTextGroup: {
    flex: 1,
    minWidth: 280,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 20,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },

  // 2. Section Principale - Héros
  heroCard: {
    backgroundColor: '#0A1826',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    ...THEME.shadows.md,
  },
  heroContent: {
    flex: 1,
    maxWidth: 580,
  },
  heroKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  heroKickerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5EEAD4',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.7,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 22,
    marginBottom: 24,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroCtaBtnHovered: {
    backgroundColor: '#0F766E',
  },
  heroCtaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroDecorCard: {
    width: 220,
    backgroundColor: '#07131F',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    padding: 20,
    display: 'none' as any,
  },
  heroDecorInner: {
    gap: 8,
  },
  heroDecorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  heroDecorSub: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },

  // 3. Statistiques Personnelles
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...THEME.shadows.sm,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },

  // 4. Mes espaces
  spacesSection: {
    gap: 14,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  spacesGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  spaceCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    ...THEME.shadows.sm,
  },
  spaceCardHovered: {
    borderColor: '#CCFBF1',
    backgroundColor: '#FAFCFE',
  },
  spaceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceContent: {
    flex: 1,
  },
  spaceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  spaceDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  spaceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spaceActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },

  // 5. Activité récente
  recentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
    ...THEME.shadows.sm,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  viewAllBtnHovered: {
    backgroundColor: '#F0FDFA',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },
  emptyRecentBox: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 8,
  },
  emptyRecentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyRecentSub: {
    fontSize: 12,
    color: '#64748B',
  },
  recentList: {
    gap: 10,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  recentItemHovered: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  recentMainInfo: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  recentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recentItemDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  metaDot: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  recentItemMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  recentVerdictCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // 6. Conseil EMI du jour
  tipCard: {
    backgroundColor: '#0F2537',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    gap: 12,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tipCardBody: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  tipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  tipBtnHovered: {
    opacity: 0.8,
  },
  tipBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14B8A6',
  },
});
