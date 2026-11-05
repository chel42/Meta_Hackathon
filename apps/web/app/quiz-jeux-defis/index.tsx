import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/layout/AppShell';
import { THEME } from '../../src/theme/colors';
import {
  QUIZ_TABS,
  QUICK_QUIZZES,
  CHALLENGES,
  LEADERBOARD,
  QUIZ_STATS,
  DAILY_CHALLENGE,
} from '../../src/mocks/quizData';
import {
  IconGamepad,
  IconZap,
  IconTrophy,
  IconArrowRight,
  IconCheckCircle,
  IconFlame,
  IconClock,
  IconAward,
  IconShield,
} from '../../src/icons/Icons';

export default function QuizJeuxDefisScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [activeTab, setActiveTab] = useState("Vue d'ensemble");

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
            <IconGamepad size={16} color={THEME.colors.teal} />
            <Text style={styles.headerBadgeText}>Entraînement ludique</Text>
          </View>
          <Text style={styles.headerTitle}>Quiz - Jeux & Défis</Text>
          <Text style={styles.headerSubtitle}>
            Mettez à l’épreuve vos compétences d’analyse de l’information, relevez des défis quotidiens et progressez dans le classement des vérificateurs.
          </Text>
        </View>

        {/* Tab Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabContainer}
        >
          {QUIZ_TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={({ hovered }: any) => [
                  styles.tabPill,
                  active && styles.tabPillActive,
                  hovered && !active && styles.tabPillHovered,
                ]}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    active && styles.tabPillTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Progress Banner */}
        <View style={styles.progressBanner}>
          <View style={styles.progressBannerLeft}>
            <View style={styles.levelBadge}>
              <IconAward size={18} color="#F59E0B" />
              <Text style={styles.levelBadgeText}>Niveau 3 • Vérificateur Confirmé</Text>
            </View>
            <Text style={styles.bannerXpText}>{QUIZ_STATS.xp} XP accumulés</Text>
            <Text style={styles.bannerSub}>
              {QUIZ_STATS.quizzesPassed} • Taux de réussite : {QUIZ_STATS.successRate} • Série : {QUIZ_STATS.streak} 🔥
            </Text>
          </View>

          <View style={styles.progressBannerRight}>
            <Pressable
              onPress={() => router.push('/badges')}
              style={styles.badgesShortcutBtn}
            >
              <Text style={styles.badgesShortcutText}>Voir mes badges</Text>
              <IconArrowRight size={14} color="#0F766E" />
            </Pressable>
          </View>
        </View>

        {/* Daily Challenge Highlight */}
        <View style={styles.dailyChallengeBox}>
          <View style={styles.dailyLeft}>
            <View style={styles.dailyIconWrapper}>
              <IconFlame size={20} color="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dailyTag}>Défi quotidien</Text>
              <Text style={styles.dailyTitle}>{DAILY_CHALLENGE.title}</Text>
              <Text style={styles.dailyDesc}>{DAILY_CHALLENGE.description}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/quiz-jeux-defis/1' as any)}
            style={styles.dailyStartBtn}
          >
            <Text style={styles.dailyStartBtnText}>Relever le défi (+{DAILY_CHALLENGE.xp} XP)</Text>
          </Pressable>
        </View>

        {/* Two-Column Section: Quizzes + Leaderboard */}
        <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
          {/* Left Column: Quick Quizzes & Active Challenges */}
          <View style={styles.leftCol}>
            {/* Quick Quizzes */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <IconZap size={18} color={THEME.colors.teal} />
                <Text style={styles.sectionTitle}>Quiz rapides</Text>
              </View>
              <Text style={styles.sectionSub}>Sessions courtes de 2 à 5 minutes</Text>
            </View>

            <View style={styles.quizzesGrid}>
              {QUICK_QUIZZES.map((quiz) => (
                <Pressable
                  key={quiz.id}
                  onPress={() => router.push(`/quiz-jeux-defis/${quiz.id}` as any)}
                  style={({ hovered }: any) => [
                    styles.quizCard,
                    isDesktop && styles.quizCardDesktop,
                    hovered && styles.quizCardHovered,
                  ]}
                >
                  <View style={styles.quizCardTop}>
                    <View
                      style={[
                        styles.diffBadge,
                        quiz.difficulty === 'easy'
                          ? styles.diffEasy
                          : quiz.difficulty === 'medium'
                          ? styles.diffMedium
                          : styles.diffHard,
                      ]}
                    >
                      <Text
                        style={[
                          styles.diffBadgeText,
                          quiz.difficulty === 'easy'
                            ? styles.diffEasyText
                            : quiz.difficulty === 'medium'
                            ? styles.diffMediumText
                            : styles.diffHardText,
                        ]}
                      >
                        {quiz.difficultyLabel}
                      </Text>
                    </View>
                    <Text style={styles.quizXp}>+{quiz.xp} XP</Text>
                  </View>

                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <Text style={styles.quizDesc} numberOfLines={2}>
                    {quiz.description}
                  </Text>

                  <View style={styles.quizFooter}>
                    <Text style={styles.quizCount}>{quiz.questions.length} questions</Text>
                    <View style={styles.quizPlayBtn}>
                      <Text style={styles.quizPlayText}>Jouer</Text>
                      <IconArrowRight size={12} color="#0F766E" />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Challenges Section */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <IconTrophy size={18} color="#D97706" />
                <Text style={styles.sectionTitle}>Défis en cours</Text>
              </View>
            </View>

            <View style={styles.challengesList}>
              {CHALLENGES.map((ch) => {
                const percent = Math.round((ch.current / ch.target) * 100);
                return (
                  <View key={ch.id} style={styles.challengeItem}>
                    <View style={styles.challengeTop}>
                      <View>
                        <Text style={styles.challengeType}>{ch.type}</Text>
                        <Text style={styles.challengeTitle}>{ch.title}</Text>
                      </View>
                      <Text style={styles.challengeXp}>+{ch.xp} XP</Text>
                    </View>
                    <Text style={styles.challengeDesc}>{ch.description}</Text>

                    <View style={styles.challengeTrack}>
                      <View style={[styles.challengeFill, { width: `${percent}%` }]} />
                    </View>
                    <View style={styles.challengeBottom}>
                      <Text style={styles.challengeProgressText}>
                        {ch.current} / {ch.target} terminés ({percent} %)
                      </Text>
                      <Text style={styles.challengeBadgeTarget}>Badge : {ch.badge}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Coach Tip */}
            <View style={styles.coachTipCard}>
              <IconShield size={20} color={THEME.colors.teal} />
              <View style={{ flex: 1 }}>
                <Text style={styles.coachTipTitle}>Conseil du Coach TRAUNES AI</Text>
                <Text style={styles.coachTipText}>
                  Quand une publication provoque chez vous une réaction émotionnelle immédiate (colère vive, euphorie, indignation), prenez 60 secondes pour respirer. L’ingénierie de la désinformation exploite délibérément vos biais affectifs.
                </Text>
              </View>
            </View>
          </View>

          {/* Right Column: Leaderboard */}
          <View style={[styles.rightCol, isDesktop && styles.rightColDesktop]}>
            <View style={styles.leaderboardCard}>
              <View style={styles.leaderboardHeader}>
                <IconTrophy size={20} color="#F59E0B" />
                <Text style={styles.leaderboardTitle}>Classement des vérificateurs</Text>
              </View>
              <Text style={styles.leaderboardSub}>Top membres de la communauté</Text>

              <View style={styles.ranksList}>
                {LEADERBOARD.map((user) => (
                  <View
                    key={user.rank}
                    style={[
                      styles.rankRow,
                      user.isUser && styles.rankRowUser,
                    ]}
                  >
                    <View style={styles.rankLeft}>
                      <View
                        style={[
                          styles.rankBadge,
                          user.rank === 1
                            ? styles.rankFirst
                            : user.rank === 2
                            ? styles.rankSecond
                            : user.rank === 3
                            ? styles.rankThird
                            : styles.rankOther,
                        ]}
                      >
                        <Text style={styles.rankBadgeText}>#{user.rank}</Text>
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.rankName,
                            user.isUser && styles.rankNameUser,
                          ]}
                        >
                          {user.name} {user.isUser && '(Vous)'}
                        </Text>
                        <Text style={styles.rankUserBadge}>{user.badge}</Text>
                      </View>
                    </View>

                    <Text style={styles.rankXp}>{user.xp} XP</Text>
                  </View>
                ))}
              </View>

              <Pressable
                onPress={() => router.push('/community')}
                style={styles.communityLinkBtn}
              >
                <Text style={styles.communityLinkText}>Rejoindre les discussions de la communauté →</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
  tabScroll: {
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  tabPillHovered: {
    borderColor: '#0F766E',
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  tabPillTextActive: {
    color: '#FFFFFF',
  },
  progressBanner: {
    backgroundColor: '#102A43',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 16,
  },
  progressBannerLeft: {
    flex: 1,
    minWidth: 260,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  bannerXpText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  progressBannerRight: {
    alignSelf: 'center',
  },
  badgesShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  badgesShortcutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  dailyChallengeBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 16,
  },
  dailyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    minWidth: 260,
  },
  dailyIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
    textTransform: 'uppercase',
  },
  dailyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102A43',
    marginVertical: 2,
  },
  dailyDesc: {
    fontSize: 12,
    color: '#7C2D12',
  },
  dailyStartBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dailyStartBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mainLayout: {
    flexDirection: 'column',
    gap: 24,
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#102A43',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  quizzesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
  },
  quizCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quizCardDesktop: {
    width: '48.5%',
  },
  quizCardHovered: {
    borderColor: '#0F766E',
    shadowColor: '#0F766E',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  quizCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  diffEasy: {
    backgroundColor: '#DCFCE7',
  },
  diffMedium: {
    backgroundColor: '#FEF3C7',
  },
  diffHard: {
    backgroundColor: '#FEE2E2',
  },
  diffBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  diffEasyText: {
    color: '#15803D',
  },
  diffMediumText: {
    color: '#D97706',
  },
  diffHardText: {
    color: '#DC2626',
  },
  quizXp: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  quizTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102A43',
    marginBottom: 6,
  },
  quizDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 14,
  },
  quizFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quizCount: {
    fontSize: 11,
    color: '#64748B',
  },
  quizPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quizPlayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  challengesList: {
    gap: 12,
    marginBottom: 28,
  },
  challengeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  challengeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  challengeType: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102A43',
    marginTop: 2,
  },
  challengeXp: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
  challengeDesc: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 10,
  },
  challengeTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  challengeFill: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 3,
  },
  challengeBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengeProgressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  challengeBadgeTarget: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F766E',
  },
  coachTipCard: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  coachTipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
    marginBottom: 4,
  },
  coachTipText: {
    fontSize: 12,
    color: '#134E4A',
    lineHeight: 18,
  },
  rightCol: {
    width: '100%',
  },
  rightColDesktop: {
    width: 320,
  },
  leaderboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderboardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102A43',
  },
  leaderboardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  ranksList: {
    gap: 8,
    marginBottom: 14,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rankRowUser: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankFirst: {
    backgroundColor: '#FEF3C7',
  },
  rankSecond: {
    backgroundColor: '#E2E8F0',
  },
  rankThird: {
    backgroundColor: '#FFEDD5',
  },
  rankOther: {
    backgroundColor: '#F1F5F9',
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#102A43',
  },
  rankName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#102A43',
  },
  rankNameUser: {
    color: '#0F766E',
    fontWeight: '700',
  },
  rankUserBadge: {
    fontSize: 10,
    color: '#64748B',
  },
  rankXp: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  communityLinkBtn: {
    alignItems: 'center',
    paddingTop: 8,
  },
  communityLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F766E',
  },
});
