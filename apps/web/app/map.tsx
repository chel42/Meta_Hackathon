import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../src/components/layout/AppShell';
import { THEME } from '../src/theme/colors';
import {
  MAP_TIME_FILTERS,
  MAP_CATEGORY_FILTERS,
  MAP_HOTSPOTS,
  TOP_FAKE_NEWS,
  MAP_ACTIVITIES,
  MAP_STATS,
  CATEGORY_BREAKDOWN,
  MapTimeFilter,
  MapCategoryFilter,
  HeatmapPoint,
} from '../src/mocks/mapData';
import {
  IconMap,
  IconGlobe,
  IconClock,
  IconShield,
  IconAlertTriangle,
  IconBarChart,
  IconPin,
  IconArrowRight,
  IconCheckCircle,
} from '../src/icons/Icons';

export default function FakeNewsMapScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [activeTime, setActiveTime] = useState<MapTimeFilter>('Cette semaine');
  const [activeCategory, setActiveCategory] = useState<MapCategoryFilter>('Toutes catégories');
  const [selectedCountry, setSelectedCountry] = useState<HeatmapPoint | null>(MAP_HOTSPOTS[0]);

  const filteredHotspots = useMemo(() => {
    if (activeCategory === 'Toutes catégories') return MAP_HOTSPOTS;
    return MAP_HOTSPOTS.filter((h) => h.category === activeCategory);
  }, [activeCategory]);

  const filteredTopNews = useMemo(() => {
    if (activeCategory === 'Toutes catégories') return TOP_FAKE_NEWS;
    return TOP_FAKE_NEWS.filter((n) => n.category === activeCategory);
  }, [activeCategory]);

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
            <IconMap size={16} color={THEME.colors.teal} />
            <Text style={styles.headerBadgeText}>Observatoire mondial</Text>
          </View>
          <Text style={styles.headerTitle}>Carte des Fake News</Text>
          <Text style={styles.headerSubtitle}>
            Suivez la propagation géographique des rumeurs, l’intensité des signalements citoyens et les foyers de désinformation décryptés en temps réel.
          </Text>
        </View>

        {/* Filters Row */}
        <View style={styles.filtersBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={styles.timeFiltersGroup}>
              {MAP_TIME_FILTERS.map((t) => {
                const active = activeTime === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setActiveTime(t)}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginTop: 8 }}>
            <View style={styles.catFiltersGroup}>
              {MAP_CATEGORY_FILTERS.map((c) => {
                const active = activeCategory === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setActiveCategory(c)}
                    style={[styles.catChip, active && styles.catChipActive]}
                  >
                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Main Map Visual + Top Fake News Layout */}
        <View style={[styles.mapRow, isDesktop && styles.mapRowDesktop]}>
          {/* Interactive Map Visual Area */}
          <View style={styles.mapCanvasCard}>
            <View style={styles.mapCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconGlobe size={18} color="#0F766E" />
                <Text style={styles.mapCardTitle}>Foyers de signalements</Text>
              </View>
              <View style={styles.mapLegendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
                  <Text style={styles.legendText}>Très élevé</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                  <Text style={styles.legendText}>Élevé</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]} />
                  <Text style={styles.legendText}>Modéré</Text>
                </View>
              </View>
            </View>

            {/* Stylized Interactive Map Container */}
            <View style={styles.worldMapVisual}>
              <View style={styles.worldGridBackground}>
                {/* Simulated World Hotspot Markers */}
                {filteredHotspots.map((spot) => {
                  const isSelected = selectedCountry?.id === spot.id;
                  return (
                    <Pressable
                      key={spot.id}
                      onPress={() => setSelectedCountry(spot)}
                      style={[
                        styles.hotspotPill,
                        { borderColor: spot.color },
                        isSelected && styles.hotspotPillSelected,
                      ]}
                    >
                      <View style={[styles.hotspotDot, { backgroundColor: spot.color }]} />
                      <Text style={styles.hotspotLabel}>{spot.label}</Text>
                      <Text style={styles.hotspotCount}>{spot.reports}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Selected Country Drawer Bar */}
              {selectedCountry && (
                <View style={styles.selectedCountryBanner}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View
                      style={[
                        styles.selectedFlagCircle,
                        { backgroundColor: selectedCountry.color + '22' },
                      ]}
                    >
                      <Text style={styles.selectedFlagCode}>{selectedCountry.countryCode}</Text>
                    </View>
                    <View>
                      <Text style={styles.selectedCountryName}>{selectedCountry.label}</Text>
                      <Text style={styles.selectedCountryMeta}>
                        {selectedCountry.reports} signalements enregistrés • {selectedCountry.category}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => router.push('/new-check')}
                    style={styles.signalCountryBtn}
                  >
                    <Text style={styles.signalCountryBtnText}>Signaler un contenu</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* Top Fake News Aside */}
          <View style={[styles.topNewsAside, isDesktop && styles.topNewsAsideDesktop]}>
            <View style={styles.topNewsHeader}>
              <IconAlertTriangle size={18} color="#DC2626" />
              <Text style={styles.topNewsTitle}>Top infox virales ({activeTime})</Text>
            </View>

            <View style={styles.topNewsList}>
              {filteredTopNews.map((item, idx) => (
                <View key={item.id} style={styles.topNewsCard}>
                  <View style={styles.topNewsCardTop}>
                    <View style={styles.topNewsRankBadge}>
                      <Text style={styles.topNewsRankText}>#{idx + 1}</Text>
                    </View>
                    <View style={[styles.topNewsCatBadge, { backgroundColor: item.categoryColor + '18' }]}>
                      <Text style={[styles.topNewsCatText, { color: item.categoryColor }]}>
                        {item.category}
                      </Text>
                    </View>
                    <Text style={styles.topNewsCountry}>{item.countryName}</Text>
                  </View>

                  <Text style={styles.topNewsHeading}>{item.title}</Text>

                  <View style={styles.topNewsFooter}>
                    <Text style={styles.topNewsReportsCount}>
                      🔥 {item.reports} signalements
                    </Text>
                    <View style={styles.verdictChip}>
                      <Text style={styles.verdictChipText}>{item.verdict}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxNumber}>{MAP_STATS.totalReports}</Text>
            <Text style={styles.statBoxLabel}>Signalements analysés</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxNumber}>{MAP_STATS.countriesAffected}</Text>
            <Text style={styles.statBoxLabel}>Pays couverts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxNumber, { color: '#0F766E' }]}>
              {MAP_STATS.verifiedPercentage}
            </Text>
            <Text style={styles.statBoxLabel}>Traçabilité confirmée</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxNumber, { color: '#15803D' }]}>
              {MAP_STATS.debunkedToday}
            </Text>
            <Text style={styles.statBoxLabel}>Démentis aujourd’hui</Text>
          </View>
        </View>

        {/* Bottom Dual Grid: Category Breakdown + Realtime Feed */}
        <View style={[styles.bottomGrid, isDesktop && styles.bottomGridDesktop]}>
          {/* Categories Chart Box */}
          <View style={styles.bottomCard}>
            <View style={styles.bottomCardHeader}>
              <IconBarChart size={18} color="#0F766E" />
              <Text style={styles.bottomCardTitle}>Répartition par thématique</Text>
            </View>
            <View style={styles.breakdownList}>
              {CATEGORY_BREAKDOWN.map((cat) => (
                <View key={cat.name} style={styles.breakdownRow}>
                  <View style={styles.breakdownInfo}>
                    <Text style={styles.breakdownName}>{cat.name}</Text>
                    <Text style={styles.breakdownCount}>
                      {cat.count} ({cat.percentage} %)
                    </Text>
                  </View>
                  <View style={styles.breakdownTrack}>
                    <View
                      style={[
                        styles.breakdownFill,
                        { width: `${cat.percentage}%`, backgroundColor: cat.color },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Real-time Activity Feed */}
          <View style={styles.bottomCard}>
            <View style={styles.bottomCardHeader}>
              <IconClock size={18} color="#0F766E" />
              <Text style={styles.bottomCardTitle}>Flux d’activité en direct</Text>
            </View>
            <View style={styles.activityList}>
              {MAP_ACTIVITIES.map((act) => (
                <View key={act.id} style={styles.activityItem}>
                  <View style={styles.activityIconCircle}>
                    <IconPin size={12} color="#0F766E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activityItemTitle}>{act.title}</Text>
                    <View style={styles.activityMetaRow}>
                      <Text style={styles.activityCountry}>{act.countryName}</Text>
                      <Text style={styles.activityDot}>•</Text>
                      <Text style={[styles.activityCategory, { color: act.categoryColor }]}>
                        {act.category}
                      </Text>
                      <Text style={styles.activityDot}>•</Text>
                      <Text style={styles.activityTime}>{act.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Pedagogical info card */}
        <View style={styles.understandCard}>
          <IconShield size={24} color="#0F766E" />
          <View style={{ flex: 1 }}>
            <Text style={styles.understandTitle}>Comprendre la carte de la désinformation</Text>
            <Text style={styles.understandText}>
              Les foyers géographiques sont agrégés à partir des signalements vérifiés par la communauté TRAUNES AI, des flux d’agences de presse indépendantes certifiées IFCN et des démentis officiels. Aucun verdict n’est posé sans preuve consultable et vérifiable.
            </Text>
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
  filtersBar: {
    marginBottom: 20,
  },
  timeFiltersGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#102A43',
    borderColor: '#102A43',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  catFiltersGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  mapRow: {
    flexDirection: 'column',
    gap: 20,
    marginBottom: 24,
  },
  mapRowDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  mapCanvasCard: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  mapCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mapCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102A43',
  },
  mapLegendRow: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
  },
  worldMapVisual: {
    minHeight: 340,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
  },
  worldGridBackground: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignContent: 'center',
    justifyContent: 'center',
  },
  hotspotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  hotspotPillSelected: {
    backgroundColor: '#102A43',
    borderColor: '#102A43',
  },
  hotspotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hotspotLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#102A43',
  },
  hotspotCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  selectedCountryBanner: {
    backgroundColor: '#102A43',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectedFlagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFlagCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedCountryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectedCountryMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  signalCountryBtn: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signalCountryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topNewsAside: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topNewsAsideDesktop: {
    maxWidth: 380,
  },
  topNewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  topNewsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102A43',
  },
  topNewsList: {
    gap: 12,
  },
  topNewsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  topNewsCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  topNewsRankBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNewsRankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#102A43',
  },
  topNewsCatBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topNewsCatText: {
    fontSize: 10,
    fontWeight: '700',
  },
  topNewsCountry: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 'auto',
  },
  topNewsHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#102A43',
    lineHeight: 18,
    marginBottom: 8,
  },
  topNewsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topNewsReportsCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  verdictChip: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verdictChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B91C1C',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBoxNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#102A43',
    marginBottom: 4,
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  bottomGrid: {
    flexDirection: 'column',
    gap: 20,
    marginBottom: 24,
  },
  bottomGridDesktop: {
    flexDirection: 'row',
  },
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bottomCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  bottomCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102A43',
  },
  breakdownList: {
    gap: 12,
  },
  breakdownRow: {
    gap: 6,
  },
  breakdownInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#102A43',
  },
  breakdownCount: {
    fontSize: 12,
    color: '#64748B',
  },
  breakdownTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  activityIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  activityItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#102A43',
    lineHeight: 17,
  },
  activityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  activityCountry: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  activityDot: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  activityCategory: {
    fontSize: 11,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  understandCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  understandTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
    marginBottom: 4,
  },
  understandText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
});
