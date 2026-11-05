import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../src/components/layout/AppShell';
import { THEME } from '../src/theme/colors';
import {
  BADGES_LIST,
  BADGE_CATEGORIES,
  BADGE_PROGRESS,
  BadgeItem,
} from '../src/mocks/badgesData';
import {
  IconAward,
  IconCheckCircle,
  IconLock,
  IconClock,
  IconZap,
  IconShield,
  IconX,
  IconArrowRight,
  IconTrophy,
} from '../src/icons/Icons';

export default function BadgesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [activeFilter, setActiveFilter] = useState('Tous les badges');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  const filteredBadges = useMemo(() => {
    return BADGES_LIST.filter((b) => {
      if (activeFilter === 'Débloqués') return b.unlocked;
      if (activeFilter === 'À débloquer') return !b.unlocked;
      if (activeFilter === 'Tous les badges') return true;
      return b.category === activeFilter;
    });
  }, [activeFilter]);

  const renderBadgeIcon = (iconType: string, color: string) => {
    switch (iconType) {
      case 'observateur':
      case 'curieux':
      case 'verificateur':
      case 'detective':
      case 'expertSource':
      case 'chasseur':
      case 'expertImages':
      case 'expertVideos':
      case 'analysteIA':
      case 'espritCritique':
      case 'communaute':
      case 'ambassadeur':
      default:
        return (
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="22" r="20" fill={color} fillOpacity="0.12" />
            <circle cx="22" cy="22" r="15" fill={color} fillOpacity="0.25" />
            <path
              d="M22 10L25 18H33L27 23L29 31L22 26L15 31L17 23L11 18H19L22 10Z"
              fill={color}
            />
          </svg>
        );
    }
  };

  return (
    <AppShell>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <IconAward size={16} color={THEME.colors.teal} />
            <Text style={styles.headerBadgeText}>Progression & Récompenses</Text>
          </View>
          <Text style={styles.headerTitle}>Mes badges de vérificateur</Text>
          <Text style={styles.headerSubtitle}>
            Chaque vérification rigoureuse, chaque module suivi et chaque défi relevé vous rapproche des titres d’expertise factuelle.
          </Text>
        </View>

        {/* Global Progress Card */}
        <View style={styles.globalProgressCard}>
          <View style={styles.progressCardLeft}>
            <View style={styles.currentRankBadge}>
              <IconTrophy size={16} color="#F59E0B" />
              <Text style={styles.currentRankText}>{BADGE_PROGRESS.currentRank}</Text>
            </View>
            <Text style={styles.unlockedMainText}>
              {BADGE_PROGRESS.unlockedCount} sur {BADGE_PROGRESS.total} badges débloqués
            </Text>
            <Text style={styles.nextRankSub}>
              Prochain rang : <Text style={{ color: '#0F766E', fontWeight: '700' }}>{BADGE_PROGRESS.nextRank}</Text> dans {BADGE_PROGRESS.xpToNextRank} XP
            </Text>

            <View style={styles.globalProgressBarBg}>
              <View
                style={[
                  styles.globalProgressBarFill,
                  { width: `${BADGE_PROGRESS.percentage}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.progressPercentCircle}>
            <Text style={styles.percentNumber}>{BADGE_PROGRESS.percentage}%</Text>
            <Text style={styles.percentSub}>complété</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {BADGE_CATEGORIES.map((cat) => {
            const active = activeFilter === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveFilter(cat)}
                style={({ hovered }: any) => [
                  styles.filterPill,
                  active && styles.filterPillActive,
                  hovered && !active && styles.filterPillHovered,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    active && styles.filterPillTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Badges Grid */}
        <View style={styles.badgesGrid}>
          {filteredBadges.map((badge) => (
            <Pressable
              key={badge.id}
              onPress={() => setSelectedBadge(badge)}
              style={({ hovered }: any) => [
                styles.badgeCard,
                isDesktop && styles.badgeCardDesktop,
                hovered && styles.badgeCardHovered,
                !badge.unlocked && styles.badgeCardLocked,
              ]}
            >
              <View style={styles.badgeCardTop}>
                <View
                  style={[
                    styles.badgeIconBox,
                    { backgroundColor: badge.accentBg },
                  ]}
                >
                  {renderBadgeIcon(badge.iconType, badge.color)}
                </View>
                <View style={styles.badgeStatusWrapper}>
                  {badge.unlocked ? (
                    <View style={styles.badgeUnlockedPill}>
                      <IconCheckCircle size={12} color="#15803D" />
                      <Text style={styles.badgeUnlockedText}>Débloqué</Text>
                    </View>
                  ) : (
                    <View style={styles.badgeLockedPill}>
                      <IconLock size={12} color="#64748B" />
                      <Text style={styles.badgeLockedText}>+{badge.xpReward} XP</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.badgeTitle}>{badge.title}</Text>
              <Text style={styles.badgeCategory}>
                {badge.category} • Niveau {badge.level}
              </Text>
              <Text style={styles.badgeDescription} numberOfLines={2}>
                {badge.description}
              </Text>

              <View style={styles.badgeCriteriaBox}>
                <Text style={styles.badgeCriteriaText} numberOfLines={2}>
                  🎯 {badge.criteria}
                </Text>
              </View>

              {badge.unlockedDate && (
                <Text style={styles.badgeDate}>Obtenu le {badge.unlockedDate}</Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* How to Earn Badges Section */}
        <View style={styles.howToCard}>
          <Text style={styles.howToTitle}>Comment débloquer davantage de badges ?</Text>
          <View style={styles.howToSteps}>
            <View style={styles.howToStepItem}>
              <View style={styles.howToStepIcon}>
                <Text style={styles.howToStepNumber}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.howToStepName}>Effectuer des vérifications</Text>
                <Text style={styles.howToStepDesc}>
                  Analysez des affirmations suspectes et vérifiez les sources dans l’espace dédié.
                </Text>
              </View>
            </View>

            <View style={styles.howToStepItem}>
              <View style={styles.howToStepIcon}>
                <Text style={styles.howToStepNumber}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.howToStepName}>Progresser dans l’Académie</Text>
                <Text style={styles.howToStepDesc}>
                  Complétez les leçons méthodologiques et réalisez des quiz de validation.
                </Text>
              </View>
            </View>

            <View style={styles.howToStepItem}>
              <View style={styles.howToStepIcon}>
                <Text style={styles.howToStepNumber}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.howToStepName}>S’engager en communauté</Text>
                <Text style={styles.howToStepDesc}>
                  Partagez des décryptages sourcés et aidez les autres citoyens à s’informer.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Badge Details Modal */}
        {selectedBadge && (
          <Modal
            transparent
            visible={!!selectedBadge}
            animationType="fade"
            onRequestClose={() => setSelectedBadge(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderIcon}>
                    {renderBadgeIcon(selectedBadge.iconType, selectedBadge.color)}
                  </View>
                  <Pressable
                    onPress={() => setSelectedBadge(null)}
                    style={styles.modalCloseBtn}
                  >
                    <IconX size={20} color="#64748B" />
                  </Pressable>
                </View>

                <Text style={styles.modalBadgeTitle}>{selectedBadge.title}</Text>
                <Text style={styles.modalBadgeCategory}>
                  {selectedBadge.category} • Niveau {selectedBadge.level}
                </Text>

                <Text style={styles.modalBadgeDesc}>{selectedBadge.description}</Text>

                <View style={styles.modalCriteriaBox}>
                  <Text style={styles.modalCriteriaHeading}>Condition d’obtention :</Text>
                  <Text style={styles.modalCriteriaBody}>{selectedBadge.criteria}</Text>
                </View>

                <View style={styles.modalStatusRow}>
                  <Text style={styles.modalStatusLabel}>Statut actuel :</Text>
                  <Text
                    style={[
                      styles.modalStatusValue,
                      selectedBadge.unlocked ? styles.modalStatusSuccess : styles.modalStatusLocked,
                    ]}
                  >
                    {selectedBadge.unlocked
                      ? `Débloqué le ${selectedBadge.unlockedDate}`
                      : `À débloquer (+${selectedBadge.xpReward} XP)`}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => {
                      setSelectedBadge(null);
                      router.push('/academie-emi');
                    }}
                    style={styles.modalActionPrimary}
                  >
                    <Text style={styles.modalActionPrimaryText}>Aller à l’Académie</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedBadge(null)}
                    style={styles.modalActionSecondary}
                  >
                    <Text style={styles.modalActionSecondaryText}>Fermer</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 20,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#CCFBF1',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#102A43',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    maxWidth: 800,
  },
  globalProgressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  progressCardLeft: {
    flex: 1,
    minWidth: 260,
  },
  currentRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  currentRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  unlockedMainText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#102A43',
    marginBottom: 4,
  },
  nextRankSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  globalProgressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  globalProgressBarFill: {
    height: '100%',
    backgroundColor: '#0F766E',
    borderRadius: 4,
  },
  progressPercentCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F766E',
  },
  percentSub: {
    fontSize: 10,
    color: '#0F766E',
    fontWeight: '600',
  },
  filterScroll: {
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  filterPillHovered: {
    borderColor: '#0F766E',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  badgeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeCardDesktop: {
    width: '31.8%',
  },
  badgeCardHovered: {
    borderColor: '#0F766E',
    shadowColor: '#0F766E',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  badgeCardLocked: {
    opacity: 0.85,
  },
  badgeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeStatusWrapper: {},
  badgeUnlockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeUnlockedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  badgeLockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeLockedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102A43',
    marginBottom: 3,
  },
  badgeCategory: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 12,
  },
  badgeCriteriaBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  badgeCriteriaText: {
    fontSize: 11,
    color: '#334155',
  },
  badgeDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  howToCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  howToTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#102A43',
    marginBottom: 16,
  },
  howToSteps: {
    flexDirection: 'column',
    gap: 14,
  },
  howToStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  howToStepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  howToStepNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F766E',
  },
  howToStepName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102A43',
    marginBottom: 2,
  },
  howToStepDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 42, 67, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBadgeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#102A43',
    marginBottom: 4,
  },
  modalBadgeCategory: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 12,
  },
  modalBadgeDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalCriteriaBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  modalCriteriaHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalCriteriaBody: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },
  modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  modalStatusLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  modalStatusValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalStatusSuccess: {
    color: '#15803D',
  },
  modalStatusLocked: {
    color: '#64748B',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalActionPrimary: {
    flex: 1,
    backgroundColor: '#0F766E',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalActionPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalActionSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalActionSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
});
