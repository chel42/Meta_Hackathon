import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../src/components/layout/AppShell';
import { VerdictBadge } from '../src/components/verification/VerdictBadge';
import { EmptyState } from '../src/components/common/EmptyState';
import {
  IconSearch,
  IconTrash,
  IconChevronRight,
  IconRefresh,
  IconX,
  IconClock,
  IconCheckCircle,
  IconAlertCircle,
  IconHelpCircle,
  IconFileText,
  IconLink,
  IconImage,
  IconPlus,
} from '../src/icons/Icons';
import { useTraunesAIData } from '../src/context/TraunesAIDataContext';
import { useNotifications } from '../src/context/NotificationContext';
import { VerdictType } from '../src/types';

export default function HistoryScreen() {
  const router = useRouter();
  const { reports, deleteReport, resetToDefaultReports } = useTraunesAIData();
  const { addNotification } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'all' | VerdictType>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'text' | 'url' | 'image'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'claims'>('newest');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Counts by verdict type
  const counts = useMemo(() => {
    let confirmed = 0;
    let contradicted = 0;
    let unverifiable = 0;

    reports.forEach((r) => {
      if (r.confirmedCount > 0) confirmed += 1;
      if (r.contradictedCount > 0) contradicted += 1;
      if (r.unverifiableCount > 0) unverifiable += 1;
    });

    return { total: reports.length, confirmed, contradicted, unverifiable };
  }, [reports]);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let result = [...reports];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.inputContent.toLowerCase().includes(q) ||
          r.claims.some((c) => c.claimText.toLowerCase().includes(q))
      );
    }

    // Verdict filter
    if (verdictFilter !== 'all') {
      result = result.filter((r) => {
        if (verdictFilter === 'confirmed') return r.confirmedCount > 0;
        if (verdictFilter === 'contradicted') return r.contradictedCount > 0;
        if (verdictFilter === 'unverifiable') return r.unverifiableCount > 0;
        return true;
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((r) => r.inputType === typeFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
      }
      if (sortBy === 'claims') {
        return b.claimsCount - a.claimsCount;
      }
      return 0;
    });

    return result;
  }, [reports, searchQuery, verdictFilter, typeFilter, sortBy]);

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteReport(deleteTargetId);
      addNotification({
        title: 'Vérification supprimée',
        message: 'L\'enregistrement a été retiré de votre historique.',
        type: 'system',
      });
      setDeleteTargetId(null);
    }
  };

  const formatTypeLabel = (type: string) => {
    switch (type) {
      case 'url':
        return 'Lien / Web';
      case 'image':
        return 'Image / Média';
      default:
        return 'Article / Texte';
    }
  };

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'url':
        return <IconLink size={14} color="#0F766E" />;
      case 'image':
        return <IconImage size={14} color="#0F766E" />;
      default:
        return <IconFileText size={14} color="#0F766E" />;
    }
  };

  return (
    <AppShell>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>

          {/* En-tête de la page */}
          <View style={styles.headerCard}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerTextCol}>
                <Text style={styles.title}>Historique de mes vérifications</Text>
                <Text style={styles.subtitle}>
                  Retrouvez, consultez et suivez toutes vos activités de vérification de l'information.
                </Text>
              </View>

              <View style={styles.headerRightActions}>
                <Pressable
                  onPress={() => router.push('/new-check')}
                  style={styles.primaryCheckBtn}
                >
                  <IconPlus size={16} color="#FFFFFF" />
                  <Text style={styles.primaryCheckBtnText}>Nouvelle vérification</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    resetToDefaultReports();
                    addNotification({
                      title: 'Historique réinitialisé',
                      message: 'Les vérifications exemples d’origine ont été restaurées.',
                      type: 'system',
                    });
                  }}
                  style={styles.resetBtn}
                >
                  <IconRefresh size={14} color="#0F766E" />
                  <Text style={styles.resetBtnText}>Restaurer exemples</Text>
                </Pressable>
              </View>
            </View>

            {/* Total count badge */}
            <View style={styles.totalBadgeContainer}>
              <View style={styles.totalCountChip}>
                <IconClock size={15} color="#0F766E" />
                <Text style={styles.totalCountText}>
                  {counts.total} vérification{counts.total > 1 ? 's' : ''} réalisée{counts.total > 1 ? 's' : ''} au total
                </Text>
              </View>
            </View>
          </View>

          {/* Cartes de synthèse de statut */}
          <View style={styles.statsSummaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{counts.total}</Text>
              <Text style={styles.summaryLabel}>Total des analyses</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <View style={styles.cardHeaderRow}>
                <IconCheckCircle size={16} color="#15803D" />
                <Text style={[styles.summaryValue, { color: '#15803D' }]}>{counts.confirmed}</Text>
              </View>
              <Text style={styles.summaryLabel}>Confirmées</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
              <View style={styles.cardHeaderRow}>
                <IconAlertCircle size={16} color="#B91C1C" />
                <Text style={[styles.summaryValue, { color: '#B91C1C' }]}>{counts.contradicted}</Text>
              </View>
              <Text style={styles.summaryLabel}>Contredites</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <View style={styles.cardHeaderRow}>
                <IconHelpCircle size={16} color="#B45309" />
                <Text style={[styles.summaryValue, { color: '#B45309' }]}>{counts.unverifiable}</Text>
              </View>
              <Text style={styles.summaryLabel}>Non vérifiables</Text>
            </View>
          </View>

          {/* Barre de recherche et filtres */}
          <View style={styles.toolbarCard}>
            {/* Recherche */}
            <View style={styles.searchWrapper}>
              <IconSearch size={18} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher une vérification par titre, contenu ou mot-clé..."
                placeholderTextColor="#94A3B8"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                  <IconX size={16} color="#64748B" />
                </Pressable>
              )}
            </View>

            {/* Filtres par statut & type */}
            <View style={styles.filtersBar}>
              {/* Filtres Statut */}
              <View style={styles.pillsGroup}>
                <Text style={styles.filterSectionLabel}>Statut :</Text>
                {[
                  { id: 'all', label: `Tous (${counts.total})` },
                  { id: 'confirmed', label: 'Confirmée' },
                  { id: 'contradicted', label: 'Contredite' },
                  { id: 'unverifiable', label: 'Non vérifiable' },
                ].map((pill) => {
                  const isActive = verdictFilter === pill.id;
                  return (
                    <Pressable
                      key={pill.id}
                      onPress={() => setVerdictFilter(pill.id as any)}
                      style={[styles.pillItem, isActive && styles.pillItemActive]}
                    >
                      <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                        {pill.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Filtres Type de contenu */}
              <View style={styles.pillsGroup}>
                <Text style={styles.filterSectionLabel}>Type :</Text>
                {[
                  { id: 'all', label: 'Tous types' },
                  { id: 'text', label: 'Texte' },
                  { id: 'url', label: 'Lien Web' },
                  { id: 'image', label: 'Image' },
                ].map((pill) => {
                  const isActive = typeFilter === pill.id;
                  return (
                    <Pressable
                      key={pill.id}
                      onPress={() => setTypeFilter(pill.id as any)}
                      style={[styles.pillItem, isActive && styles.pillItemActiveSecondary]}
                    >
                      <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                        {pill.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Tri */}
              <View style={styles.sortGroup}>
                <Text style={styles.sortLabel}>Trier par :</Text>
                <Pressable
                  onPress={() => {
                    setSortBy(sortBy === 'newest' ? 'oldest' : sortBy === 'oldest' ? 'claims' : 'newest');
                  }}
                  style={styles.sortPillBtn}
                >
                  <Text style={styles.sortPillText}>
                    {sortBy === 'newest'
                      ? 'Plus récents'
                      : sortBy === 'oldest'
                      ? 'Plus anciens'
                      : 'Affirmations'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Liste des vérifications */}
          {filteredReports.length === 0 ? (
            <EmptyState
              title="Vous n'avez pas encore effectué de vérification."
              description="Commencez dès maintenant à analyser une information ou réinitialisez les filtres de recherche."
              actionLabel="Nouvelle vérification"
              onAction={() => router.push('/new-check')}
            />
          ) : (
            <View style={styles.reportsList}>
              {filteredReports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <Pressable
                    onPress={() => router.push(`/reports/${report.id}` as any)}
                    style={styles.cardMainClickable}
                  >
                    <View style={styles.cardTopMetaRow}>
                      <View style={styles.metaBadgeGroup}>
                        <View style={styles.formatChip}>
                          {renderTypeIcon(report.inputType)}
                          <Text style={styles.formatChipText}>{formatTypeLabel(report.inputType)}</Text>
                        </View>
                        <Text style={styles.dateMetaText}>
                          {new Date(report.completedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.claimsMetaText}>
                          {report.claimsCount} affirmation{report.claimsCount > 1 ? 's' : ''}
                        </Text>
                      </View>

                      <Text style={styles.refCodeText}>{report.id}</Text>
                    </View>

                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportExcerpt} numberOfLines={2}>
                      {report.inputContent}
                    </Text>

                    {/* Verdicts badges row */}
                    <View style={styles.verdictBadgesRow}>
                      {report.confirmedCount > 0 && (
                        <VerdictBadge verdict="confirmed" variant="short" size="sm" />
                      )}
                      {report.contradictedCount > 0 && (
                        <VerdictBadge verdict="contradicted" variant="short" size="sm" />
                      )}
                      {report.unverifiableCount > 0 && (
                        <VerdictBadge verdict="unverifiable" variant="short" size="sm" />
                      )}
                    </View>
                  </Pressable>

                  {/* Bottom Actions Row */}
                  <View style={styles.cardBottomRow}>
                    <Pressable
                      onPress={() => router.push(`/reports/${report.id}` as any)}
                      style={styles.openReportBtn}
                    >
                      <Text style={styles.openReportBtnText}>Consulter les détails</Text>
                      <IconChevronRight size={14} color="#0F766E" />
                    </Pressable>

                    <Pressable
                      onPress={() => setDeleteTargetId(report.id)}
                      style={styles.deleteIconBtn}
                      accessibilityLabel="Supprimer de l'historique"
                    >
                      <IconTrash size={16} color="#94A3B8" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Modale de confirmation de suppression */}
          {deleteTargetId && (
            <Modal
              transparent
              visible={!!deleteTargetId}
              animationType="fade"
              onRequestClose={() => setDeleteTargetId(null)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <Text style={styles.modalTitle}>Supprimer cette vérification ?</Text>
                  <Text style={styles.modalText}>
                    Êtes-vous sûr de vouloir supprimer cette vérification de votre historique ? Cette action est définitive.
                  </Text>

                  <View style={styles.modalBtnRow}>
                    <Pressable
                      onPress={() => setDeleteTargetId(null)}
                      style={styles.modalCancelBtn}
                    >
                      <Text style={styles.modalCancelText}>Annuler</Text>
                    </Pressable>

                    <Pressable onPress={confirmDelete} style={styles.modalDeleteBtn}>
                      <Text style={styles.modalDeleteText}>Supprimer</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          )}

        </View>
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
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    gap: 18,
  },

  // Header
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    gap: 14,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerTextCol: {
    flex: 1,
    minWidth: 260,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#0F766E',
  },
  primaryCheckBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  totalBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalCountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDFA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  totalCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },

  // Summary Stats
  statsSummaryGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  summaryCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },

  // Toolbar
  toolbarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none' as any,
  },
  clearBtn: {
    padding: 4,
  },

  filtersBar: {
    flexDirection: 'column',
    gap: 12,
  },
  filterSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    alignSelf: 'center',
    marginRight: 4,
  },
  pillsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  pillItem: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillItemActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  pillItemActiveSecondary: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  sortGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sortLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  sortPillBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Reports List
  reportsList: {
    gap: 12,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
  },
  cardMainClickable: {
    gap: 6,
  },
  cardTopMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  formatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  formatChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  dateMetaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  claimsMetaText: {
    fontSize: 12,
    color: '#64748B',
  },
  refCodeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace' as any,
  },

  reportTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  reportExcerpt: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  verdictBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 4,
  },

  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  openReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0FDFA',
  },
  openReportBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  deleteIconBtn: {
    padding: 6,
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
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
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
  modalDeleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#B91C1C',
  },
  modalDeleteText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
