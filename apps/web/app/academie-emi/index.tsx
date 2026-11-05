import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/layout/AppShell';
import { THEME } from '../../src/theme/colors';
import { useAcademy } from '../../src/context/AcademyContext';
import {
  ACADEMY_FILTERS,
  ACADEMY_LEVELS,
  ACADEMY_RESOURCES,
  filterAcademyModules,
  AcademyModule,
} from '../../src/mocks/academyData';
import {
  IconGraduationCap,
  IconCheckCircle,
  IconClock,
  IconLock,
  IconArrowRight,
  IconFileText,
  IconSearch,
  IconZap,
  IconShield,
  IconAward,
  IconSparkles,
  IconLightbulb,
  IconBookOpen,
  IconLayers,
  IconCheckShield,
  IconRefresh,
  IconX,
} from '../../src/icons/Icons';

export default function AcademieEmiScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const { modules, quizResults, overallProgress, resetProgress } = useAcademy();

  // Internal Navigation Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'learning' | 'results'>('overview');

  // Filters for Catalog tab
  const [activeCategory, setActiveCategory] = useState('Tous les modules');
  const [activeLevel, setActiveLevel] = useState('Tous les niveaux');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCatalogModules = useMemo(
    () => filterAcademyModules(modules, activeCategory, activeLevel, searchQuery),
    [modules, activeCategory, activeLevel, searchQuery]
  );

  const activeInProgramModules = useMemo(
    () => modules.filter((m) => m.status === 'in-progress' || m.status === 'completed'),
    [modules]
  );

  const getLevelBadgeStyle = (level: AcademyModule['level']) => {
    switch (level) {
      case 'Débutant':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'Intermédiaire':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'Avancé':
        return { bg: '#F3E8FF', text: '#6B21A8' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const getStatusBadgeStyle = (status: AcademyModule['status']) => {
    switch (status) {
      case 'completed':
        return { bg: '#DCFCE7', text: '#15803D', label: 'Terminé' };
      case 'in-progress':
        return { bg: '#CCFBF1', text: '#0F766E', label: 'En cours' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', label: 'Disponible' };
    }
  };

  return (
    <AppShell>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerBadge}>
              <IconGraduationCap size={15} color="#0F766E" />
              <Text style={styles.headerBadgeText}>Plateforme Pédagogique TRAUNES AI</Text>
            </View>
            <Pressable onPress={resetProgress} style={styles.headerResetLink}>
              <IconRefresh size={13} color="#64748B" />
              <Text style={styles.headerResetLinkText}>Réinitialiser la progression</Text>
            </Pressable>
          </View>

          <Text style={styles.headerTitle}>Académie EMI</Text>
          <Text style={styles.headerSubtitle}>
            Développez votre esprit critique, apprenez à déceler les biais d'information et maîtrisez les techniques d'investigation numérique grâce à un parcours certifiant et structuré.
          </Text>

          {/* Senior Executive Dashboard Stats Grid (4 Metric Cards) */}
          <View style={styles.dashboardStatsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>Progression Globale</Text>
                <View style={styles.statCardIconCircle}>
                  <IconCheckShield size={16} color="#0F766E" />
                </View>
              </View>
              <Text style={styles.statCardValue}>{overallProgress.percentCompleted} %</Text>
              <View style={styles.statProgressBarBg}>
                <View
                  style={[
                    styles.statProgressBarFill,
                    { width: `${overallProgress.percentCompleted}%` },
                  ]}
                />
              </View>
              <Text style={styles.statCardSubtext}>
                {overallProgress.completedLessonsCount} sur {overallProgress.totalLessonsCount} leçons validées
              </Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>Modules Complétés</Text>
                <View style={[styles.statCardIconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <IconBookOpen size={16} color="#D97706" />
                </View>
              </View>
              <Text style={styles.statCardValue}>
                {overallProgress.completedModulesCount} <Text style={styles.statCardValueTotal}>/ {overallProgress.totalModulesCount}</Text>
              </Text>
              <Text style={styles.statCardSubtext}>Parcours pédagogique suivi</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>Temps de Formation</Text>
                <View style={[styles.statCardIconCircle, { backgroundColor: '#E0F2FE' }]}>
                  <IconClock size={16} color="#0284C7" />
                </View>
              </View>
              <Text style={styles.statCardValue}>
                {Math.round((overallProgress.totalTimeSpentMinutes / 60) * 10) / 10} <Text style={styles.statCardValueTotal}>h</Text>
              </Text>
              <Text style={styles.statCardSubtext}>Heures d'étude cumulées</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>Statut & Titre</Text>
                <View style={[styles.statCardIconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <IconAward size={16} color="#9333EA" />
                </View>
              </View>
              <Text style={styles.statCardValueHighlight}>Analyste Factuel</Text>
              <Text style={styles.statCardSubtext}>Niveau 2 • TRAUNES AI Verified</Text>
            </View>
          </View>
        </View>

        {/* 2. Internal Navigation Segmented Control Bar */}
        <View style={styles.segmentedTabContainer}>
          <Pressable
            onPress={() => setActiveTab('overview')}
            style={[styles.segmentedTabBtn, activeTab === 'overview' && styles.segmentedTabBtnActive]}
          >
            <IconSparkles size={15} color={activeTab === 'overview' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.segmentedTabLabel, activeTab === 'overview' && styles.segmentedTabLabelActive]}>
              Vue d'ensemble
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('catalog')}
            style={[styles.segmentedTabBtn, activeTab === 'catalog' && styles.segmentedTabBtnActive]}
          >
            <IconBookOpen size={15} color={activeTab === 'catalog' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.segmentedTabLabel, activeTab === 'catalog' && styles.segmentedTabLabelActive]}>
              Tous les modules ({modules.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('learning')}
            style={[styles.segmentedTabBtn, activeTab === 'learning' && styles.segmentedTabBtnActive]}
          >
            <IconLayers size={15} color={activeTab === 'learning' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.segmentedTabLabel, activeTab === 'learning' && styles.segmentedTabLabelActive]}>
              Mon apprentissage ({activeInProgramModules.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('results')}
            style={[styles.segmentedTabBtn, activeTab === 'results' && styles.segmentedTabBtnActive]}
          >
            <IconAward size={15} color={activeTab === 'results' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.segmentedTabLabel, activeTab === 'results' && styles.segmentedTabLabelActive]}>
              Mes résultats & Badges
            </Text>
          </Pressable>
        </View>

        {/* TAB 1: VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <View style={styles.tabContentArea}>
            {/* Hero Recommended Course Banner */}
            <View style={styles.heroBannerCard}>
              <View style={styles.heroBannerContent}>
                <View style={styles.heroBadgeTag}>
                  <IconZap size={13} color="#F59E0B" />
                  <Text style={styles.heroBadgeTagText}>Dernier module consulté</Text>
                </View>
                <Text style={styles.heroBannerTitle}>Vérifier une information & la méthode 5W</Text>
                <Text style={styles.heroBannerDesc}>
                  Maîtrisez la grille d'investigation TRAUNES AI : recoupement de sources primaires, analyse d'intention de l'auteur et traçabilité des dépêches d'actualité.
                </Text>

                <View style={styles.heroBannerMetaRow}>
                  <View style={styles.heroMetaItem}>
                    <IconClock size={13} color="#CCFBF1" />
                    <Text style={styles.heroMetaText}>40 min • Niveau Intermédiaire</Text>
                  </View>
                  <View style={styles.heroMetaItem}>
                    <IconCheckCircle size={13} color="#5EEAD4" />
                    <Text style={styles.heroMetaText}>2 leçons sur 3 complétées (75%)</Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => router.push('/academie-emi/3')}
                  style={({ hovered }: any) => [
                    styles.heroCtaBtn,
                    hovered && styles.heroCtaBtnHovered,
                  ]}
                >
                  <Text style={styles.heroCtaText}>Poursuivre ce module (75 %)</Text>
                  <IconArrowRight size={15} color="#FFFFFF" />
                </Pressable>
              </View>

              <View style={styles.heroDecorBox}>
                <IconShield size={54} color="rgba(20, 184, 166, 0.2)" />
                <Text style={styles.heroDecorText}>Méthodologie TRAUNES AI</Text>
              </View>
            </View>

            {/* Structured 2-Column Grid Layout */}
            <View style={[styles.overviewLayoutRow, !isDesktop && styles.overviewLayoutColumn]}>
              {/* Left Main Column: Featured Essential Modules */}
              <View style={styles.overviewMainCol}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitleText}>Modules indispensables</Text>
                  <Pressable onPress={() => setActiveTab('catalog')}>
                    <Text style={styles.seeAllText}>Voir le catalogue complet →</Text>
                  </Pressable>
                </View>

                <View style={styles.modulesGridTwoCol}>
                  {modules.slice(0, 4).map((mod) => {
                    const levelStyle = getLevelBadgeStyle(mod.level);
                    const statusStyle = getStatusBadgeStyle(mod.status);

                    return (
                      <Pressable
                        key={mod.id}
                        onPress={() => router.push(`/academie-emi/${mod.id}`)}
                        style={({ hovered }: any) => [
                          styles.moduleCardItem,
                          isDesktop && styles.moduleCardItemHalf,
                          hovered && styles.moduleCardHovered,
                        ]}
                      >
                        <View style={styles.cardHeaderRow}>
                          <View style={[styles.pillBadge, { backgroundColor: levelStyle.bg }]}>
                            <Text style={[styles.pillBadgeText, { color: levelStyle.text }]}>
                              {mod.level}
                            </Text>
                          </View>

                          <View style={[styles.pillBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.pillBadgeText, { color: statusStyle.text }]}>
                              {statusStyle.label}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.moduleCategoryText}>{mod.category}</Text>
                        <Text style={styles.moduleTitleText} numberOfLines={2}>
                          {mod.title}
                        </Text>
                        <Text style={styles.moduleDescText} numberOfLines={2}>
                          {mod.description}
                        </Text>

                        {/* Progress Bar if started */}
                        {mod.progress !== undefined && mod.progress > 0 && (
                          <View style={styles.cardProgressWrapper}>
                            <View style={styles.cardProgressBg}>
                              <View
                                style={[styles.cardProgressFill, { width: `${mod.progress}%` }]}
                              />
                            </View>
                            <Text style={styles.cardProgressText}>{mod.progress} %</Text>
                          </View>
                        )}

                        <View style={styles.cardFooterRow}>
                          <View style={styles.cardMetaGroup}>
                            <IconClock size={13} color="#64748B" />
                            <Text style={styles.cardMetaText}>{mod.duration}</Text>
                            <Text style={styles.cardMetaDot}>•</Text>
                            <Text style={styles.cardMetaText}>{mod.lessons.length} leçons</Text>
                          </View>

                          <View style={styles.cardActionCircle}>
                            <IconArrowRight size={14} color="#0F766E" />
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Right Sidebar Column */}
              <View style={[styles.overviewSidebarCol, isDesktop && { width: 330 }]}>
                {/* Daily Tip */}
                <View style={styles.tipCardBox}>
                  <View style={styles.tipHeaderRow}>
                    <View style={styles.tipIconBox}>
                      <IconLightbulb size={18} color="#F59E0B" />
                    </View>
                    <Text style={styles.tipTitleText}>Conseil EMI du jour</Text>
                  </View>
                  <Text style={styles.tipBodyText}>
                    « Avant de partager une capture d'écran de tweet ou de citation provocante, recherchez si le compte existe réellement. De nombreuses fausses captures sont créées sur des générateurs en ligne. »
                  </Text>
                  <Text style={styles.tipAuthorText}>— Équipe Pédagogique TRAUNES AI</Text>
                </View>

                {/* Practical Resources */}
                <View style={styles.resourcesCardBox}>
                  <Text style={styles.resourcesHeaderTitle}>Guides & Fiches Méthodologiques</Text>
                  {ACADEMY_RESOURCES.map((res, idx) => (
                    <View key={idx} style={styles.resourceItemRow}>
                      <View style={styles.resourceIconWrapper}>
                        <IconFileText size={16} color="#0F766E" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.resourceItemTitle}>{res.title}</Text>
                        <Text style={styles.resourceItemMeta}>{res.meta}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Practice Quiz CTA */}
                <View style={styles.practiceCtaCard}>
                  <IconAward size={24} color="#FFFFFF" />
                  <Text style={styles.practiceCtaTitle}>Testez vos réflexes en direct</Text>
                  <Text style={styles.practiceCtaDesc}>
                    Relevez les quiz hebdomadaires de détection de fake news et gagnez des points d'expérience TRAUNES AI.
                  </Text>
                  <Pressable
                    onPress={() => router.push('/quiz-jeux-defis')}
                    style={styles.practiceCtaBtn}
                  >
                    <Text style={styles.practiceCtaBtnText}>Lancer un Quiz rapide</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: TOUS LES MODULES */}
        {activeTab === 'catalog' && (
          <View style={styles.tabContentArea}>
            {/* Filter Panel */}
            <View style={styles.filterBarContainer}>
              <View style={styles.searchBoxInput}>
                <IconSearch size={18} color="#94A3B8" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Rechercher par mot-clé (ex: IA, Biais, Sources, Deepfake)..."
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInputText}
                />
                {searchQuery !== '' && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <IconX size={16} color="#94A3B8" />
                  </Pressable>
                )}
              </View>

              <View style={styles.filterSectionGroup}>
                {/* Category Pills */}
                <View style={styles.filterRowBox}>
                  <Text style={styles.filterRowLabel}>Thématique :</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                    {ACADEMY_FILTERS.map((cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => setActiveCategory(cat)}
                        style={[
                          styles.filterPill,
                          activeCategory === cat && styles.filterPillActive,
                        ]}
                      >
                        <Text style={[styles.filterPillText, activeCategory === cat && styles.filterPillTextActive]}>
                          {cat}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Level Pills */}
                <View style={styles.filterRowBox}>
                  <Text style={styles.filterRowLabel}>Niveau :</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                    {ACADEMY_LEVELS.map((lvl) => (
                      <Pressable
                        key={lvl}
                        onPress={() => setActiveLevel(lvl)}
                        style={[
                          styles.filterPill,
                          activeLevel === lvl && styles.filterPillActive,
                        ]}
                      >
                        <Text style={[styles.filterPillText, activeLevel === lvl && styles.filterPillTextActive]}>
                          {lvl}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Modules Count Indicator */}
            <View style={styles.catalogCountRow}>
              <Text style={styles.catalogCountText}>
                {filteredCatalogModules.length} module{filteredCatalogModules.length > 1 ? 's' : ''} disponible{filteredCatalogModules.length > 1 ? 's' : ''}
              </Text>

              {(activeCategory !== 'Tous les modules' || activeLevel !== 'Tous les niveaux' || searchQuery !== '') && (
                <Pressable
                  onPress={() => {
                    setActiveCategory('Tous les modules');
                    setActiveLevel('Tous les niveaux');
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.resetFilterInlineText}>Réinitialiser les filtres</Text>
                </Pressable>
              )}
            </View>

            {/* Modules Grid */}
            {filteredCatalogModules.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <IconSearch size={36} color="#94A3B8" />
                <Text style={styles.emptyStateTitle}>Aucun module ne correspond à vos critères</Text>
                <Text style={styles.emptyStateDesc}>Modifiez votre texte de recherche ou vos filtres pour afficher davantage de contenus.</Text>
                <Pressable
                  onPress={() => {
                    setActiveCategory('Tous les modules');
                    setActiveLevel('Tous les niveaux');
                    setSearchQuery('');
                  }}
                  style={styles.resetFilterBtn}
                >
                  <Text style={styles.resetFilterText}>Afficher tous les modules</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.catalogGrid}>
                {filteredCatalogModules.map((mod) => {
                  const levelStyle = getLevelBadgeStyle(mod.level);
                  const statusStyle = getStatusBadgeStyle(mod.status);

                  return (
                    <Pressable
                      key={mod.id}
                      onPress={() => router.push(`/academie-emi/${mod.id}`)}
                      style={({ hovered }: any) => [
                        styles.catalogModuleCard,
                        isDesktop && styles.catalogModuleCardDesktop,
                        hovered && styles.moduleCardHovered,
                      ]}
                    >
                      <View style={styles.cardHeaderRow}>
                        <View style={[styles.pillBadge, { backgroundColor: levelStyle.bg }]}>
                          <Text style={[styles.pillBadgeText, { color: levelStyle.text }]}>
                            {mod.level}
                          </Text>
                        </View>

                        <View style={[styles.pillBadge, { backgroundColor: statusStyle.bg }]}>
                          <Text style={[styles.pillBadgeText, { color: statusStyle.text }]}>
                            {statusStyle.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.moduleCategoryText}>{mod.category}</Text>
                      <Text style={styles.moduleTitleText}>{mod.title}</Text>
                      <Text style={styles.moduleDescText} numberOfLines={3}>
                        {mod.description}
                      </Text>

                      {mod.progress !== undefined && mod.progress > 0 && (
                        <View style={styles.cardProgressWrapper}>
                          <View style={styles.cardProgressBg}>
                            <View
                              style={[styles.cardProgressFill, { width: `${mod.progress}%` }]}
                            />
                          </View>
                          <Text style={styles.cardProgressText}>{mod.progress} %</Text>
                        </View>
                      )}

                      <View style={styles.cardFooterRow}>
                        <View style={styles.cardMetaGroup}>
                          <IconClock size={13} color="#64748B" />
                          <Text style={styles.cardMetaText}>{mod.duration}</Text>
                          <Text style={styles.cardMetaDot}>•</Text>
                          <Text style={styles.cardMetaText}>{mod.lessons.length} leçons</Text>
                        </View>

                        <Pressable
                          onPress={() => router.push(`/academie-emi/${mod.id}`)}
                          style={styles.cardActionBtn}
                        >
                          <Text style={styles.cardActionBtnText}>
                            {mod.status === 'completed'
                              ? 'Revoir'
                              : mod.progress && mod.progress > 0
                              ? 'Continuer'
                              : 'Commencer'}
                          </Text>
                          <IconArrowRight size={12} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* TAB 3: MON APPRENTISSAGE */}
        {activeTab === 'learning' && (
          <View style={styles.tabContentArea}>
            <View style={styles.learningContainer}>
              <Text style={styles.sectionHeadingTitle}>Vos modules et leçons en cours</Text>
              <Text style={styles.sectionHeadingSub}>
                Suivez le détail de vos leçons actives, reprenez la lecture là où vous vous étiez arrêté et validez vos compétences.
              </Text>

              <View style={styles.learningList}>
                {modules.map((mod) => {
                  const levelStyle = getLevelBadgeStyle(mod.level);
                  const statusStyle = getStatusBadgeStyle(mod.status);

                  return (
                    <View key={mod.id} style={styles.learningModuleBox}>
                      <View style={styles.learningHeaderRow}>
                        <View style={{ flex: 1 }}>
                          <View style={styles.cardHeaderRow}>
                            <View style={[styles.pillBadge, { backgroundColor: levelStyle.bg }]}>
                              <Text style={[styles.pillBadgeText, { color: levelStyle.text }]}>
                                {mod.level}
                              </Text>
                            </View>
                            <View style={[styles.pillBadge, { backgroundColor: statusStyle.bg }]}>
                              <Text style={[styles.pillBadgeText, { color: statusStyle.text }]}>
                                {statusStyle.label}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.learningModuleTitle}>{mod.title}</Text>
                          <Text style={styles.learningModuleMeta}>
                            {mod.category} • {mod.duration} • {mod.lessons.length} leçons
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => router.push(`/academie-emi/${mod.id}`)}
                          style={styles.openModuleBtn}
                        >
                          <Text style={styles.openModuleBtnText}>Accéder au cours</Text>
                          <IconArrowRight size={14} color="#FFFFFF" />
                        </Pressable>
                      </View>

                      {/* Sub-lessons */}
                      <View style={styles.lessonsSubList}>
                        {mod.lessons.map((lesson) => (
                          <View key={lesson.id} style={styles.lessonSubItem}>
                            <View style={styles.lessonSubLeft}>
                              <View style={styles.lessonNumberBadge}>
                                <Text style={styles.lessonNumberBadgeText}>{lesson.id}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.lessonSubTitle}>{lesson.title}</Text>
                                <Text style={styles.lessonSubDuration}>{lesson.duration}</Text>
                              </View>
                            </View>

                            <Pressable
                              onPress={() => router.push(`/academie-emi/${mod.id}`)}
                              style={styles.readLessonBtn}
                            >
                              <Text style={styles.readLessonBtnText}>Lire la leçon</Text>
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* TAB 4: MES RÉSULTATS & BADGES */}
        {activeTab === 'results' && (
          <View style={styles.tabContentArea}>
            <View style={styles.resultsContainer}>
              {/* Metric Cards Row */}
              <View style={styles.resultsStatsRow}>
                <View style={styles.resultsStatCard}>
                  <View style={[styles.resultsIconBox, { backgroundColor: 'rgba(15, 118, 110, 0.1)' }]}>
                    <IconCheckCircle size={22} color="#0F766E" />
                  </View>
                  <View>
                    <Text style={styles.resultsStatValue}>{overallProgress.completedLessonsCount}</Text>
                    <Text style={styles.resultsStatLabel}>Leçons validées</Text>
                  </View>
                </View>

                <View style={styles.resultsStatCard}>
                  <View style={[styles.resultsIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <IconAward size={22} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={styles.resultsStatValue}>4</Text>
                    <Text style={styles.resultsStatLabel}>Badges débloqués</Text>
                  </View>
                </View>

                <View style={styles.resultsStatCard}>
                  <View style={[styles.resultsIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                    <IconShield size={22} color="#4F46E5" />
                  </View>
                  <View>
                    <Text style={styles.resultsStatValue}>100%</Text>
                    <Text style={styles.resultsStatLabel}>Taux de réussite Quiz</Text>
                  </View>
                </View>
              </View>

              {/* Quiz History Box */}
              <View style={styles.quizHistoryBox}>
                <Text style={styles.quizHistoryTitle}>Historique des Quiz d'évaluation TRAUNES AI</Text>

                {Object.keys(quizResults).length === 0 ? (
                  <Text style={styles.emptyQuizText}>Aucun quiz réalisé pour le moment. Accédez aux leçons pour valider vos connaissances !</Text>
                ) : (
                  <View style={styles.quizHistoryList}>
                    {Object.entries(quizResults).map(([modId, res]) => {
                      const mod = modules.find((m) => m.id === Number(modId));
                      const percent = Math.round((res.score / res.total) * 100);

                      return (
                        <View key={modId} style={styles.quizHistoryItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.quizItemModuleTitle}>{mod?.title || `Module ${modId}`}</Text>
                            <Text style={styles.quizItemDate}>Complété le {res.completedAt}</Text>
                          </View>
                          <View style={[styles.quizScoreBadge, percent >= 75 ? styles.quizScoreSuccess : styles.quizScoreWarning]}>
                            <Text style={styles.quizScoreText}>
                              {res.score} / {res.total} ({percent}%)
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Badges Link CTA */}
              <Pressable
                onPress={() => router.push('/badges')}
                style={styles.fullBadgesBtn}
              >
                <IconAward size={18} color="#FFFFFF" />
                <Text style={styles.fullBadgesBtnText}>Consulter mon tableau complet des badges →</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 60,
    maxWidth: 1140,
    alignSelf: 'center',
    width: '100%',
  },

  // 1. Header
  header: {
    marginBottom: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  headerResetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerResetLinkText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    maxWidth: 860,
    marginBottom: 20,
  },

  // Executive Dashboard Stats Grid
  dashboardStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  statCardIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  statCardValueTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  statCardValueHighlight: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F766E',
  },
  statProgressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8,
  },
  statProgressBarFill: {
    height: '100%',
    backgroundColor: '#0F766E',
    borderRadius: 3,
  },
  statCardSubtext: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  // 2. Segmented Controller Tab Bar
  segmentedTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  segmentedTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  segmentedTabBtnActive: {
    backgroundColor: '#0F766E',
  },
  segmentedTabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentedTabLabelActive: {
    color: '#FFFFFF',
  },

  tabContentArea: {
    gap: 24,
  },

  // Overview Hero Banner
  heroBannerCard: {
    backgroundColor: '#0A1826',
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
  },
  heroBannerContent: {
    flex: 1,
    maxWidth: 680,
  },
  heroBadgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  heroBadgeTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  heroBannerTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  heroBannerDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 14,
  },
  heroBannerMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 18,
    flexWrap: 'wrap',
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaText: {
    fontSize: 12,
    color: '#CCFBF1',
    fontWeight: '600',
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroCtaBtnHovered: {
    backgroundColor: '#0F766E',
  },
  heroCtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroDecorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10,
    display: 'none',
  },
  heroDecorText: {
    color: '#5EEAD4',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },

  // Overview 2-Column Grid
  overviewLayoutRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  overviewLayoutColumn: {
    flexDirection: 'column',
  },
  overviewMainCol: {
    flex: 1,
    gap: 16,
  },
  overviewSidebarCol: {
    width: '100%',
    gap: 18,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },

  modulesGridTwoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  moduleCardItem: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    justifyContent: 'space-between',
  },
  moduleCardItemHalf: {
    width: '48.5%',
  },
  moduleCardHovered: {
    borderColor: '#99F6E4',
    backgroundColor: '#FAFCFE',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  moduleCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  moduleTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 21,
  },
  moduleDescText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  cardProgressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  cardProgressBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  cardProgressFill: {
    height: '100%',
    backgroundColor: '#0F766E',
    borderRadius: 3,
  },
  cardProgressText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 6,
  },
  cardMetaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  cardMetaDot: {
    color: '#CBD5E1',
  },
  cardActionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sidebar Tip Box
  tipCardBox: {
    backgroundColor: '#0F2537',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    gap: 10,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tipBodyText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  tipAuthorText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    alignSelf: 'flex-end',
  },

  // Sidebar Resources Box
  resourcesCardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  resourcesHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  resourceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  resourceIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceItemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  resourceItemMeta: {
    fontSize: 11,
    color: '#64748B',
  },

  // Sidebar Practice CTA
  practiceCtaCard: {
    backgroundColor: '#0F766E',
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  practiceCtaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  practiceCtaDesc: {
    fontSize: 12,
    color: '#CCFBF1',
    lineHeight: 18,
  },
  practiceCtaBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  practiceCtaBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },

  // Catalog Tab
  filterBarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  searchBoxInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInputText: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
  },
  filterSectionGroup: {
    gap: 12,
  },
  filterRowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterRowLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    width: 80,
  },
  pillsScroll: {
    flexDirection: 'row',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#0F766E',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  catalogCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  catalogCountText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  resetFilterInlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },

  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  catalogModuleCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    justifyContent: 'space-between',
  },
  catalogModuleCardDesktop: {
    width: '48.8%',
  },

  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F766E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  emptyStateBox: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  emptyStateDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 420,
  },
  resetFilterBtn: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  resetFilterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Learning Tab
  learningContainer: {
    gap: 16,
  },
  sectionHeadingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionHeadingSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: -8,
  },
  learningList: {
    gap: 16,
  },
  learningModuleBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 16,
  },
  learningHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  learningModuleTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
  },
  learningModuleMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  openModuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F766E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  openModuleBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lessonsSubList: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    gap: 8,
  },
  lessonSubItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  lessonSubLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  lessonNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumberBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  lessonSubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  lessonSubDuration: {
    fontSize: 11,
    color: '#64748B',
  },
  readLessonBtn: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  readLessonBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0369A1',
  },

  // Results Tab
  resultsContainer: {
    gap: 20,
  },
  resultsStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  resultsStatCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  resultsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsStatValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  resultsStatLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  quizHistoryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  quizHistoryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  emptyQuizText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  quizHistoryList: {
    gap: 10,
  },
  quizHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  quizItemModuleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  quizItemDate: {
    fontSize: 11,
    color: '#64748B',
  },
  quizScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  quizScoreSuccess: {
    backgroundColor: '#DCFCE7',
  },
  quizScoreWarning: {
    backgroundColor: '#FEF3C7',
  },
  quizScoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },

  fullBadgesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F766E',
    paddingVertical: 14,
    borderRadius: 14,
  },
  fullBadgesBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
