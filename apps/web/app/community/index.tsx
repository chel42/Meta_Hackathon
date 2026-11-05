import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/layout/AppShell';
import { THEME } from '../../src/theme/colors';
import {
  COMMUNITY_TABS,
  COMMUNITY_CATEGORIES,
  INITIAL_COMMUNITY_POSTS,
  COMMUNITY_STATS,
  COMMUNITY_RULES,
  CommunityPost,
} from '../../src/mocks/communityData';
import {
  IconUsers,
  IconHeart,
  IconShare2,
  IconCheckCircle,
  IconPlusCircle,
  IconShield,
  IconX,
  IconSend,
  IconArrowRight,
  IconClock,
} from '../../src/icons/Icons';

export default function CommunityScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [activeTab, setActiveTab] = useState<typeof COMMUNITY_TABS[number]>('Pour vous');
  const [selectedCategory, setSelectedCategory] = useState('Toutes catégories');
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  // New post modal form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Société');
  const [newContent, setNewContent] = useState('');
  const [newSource, setNewSource] = useState('');

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchCat =
        selectedCategory === 'Toutes catégories' || p.category === selectedCategory;
      const matchTab =
        activeTab === 'Pour vous' ? true : p.tab === activeTab;
      return matchCat && matchTab;
    });
  }, [posts, selectedCategory, activeTab]);

  const handleLike = (id: string) => {
    setLikedPosts((prev) => {
      const currentlyLiked = !!prev[id];
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === id
            ? { ...post, likes: post.likes + (currentlyLiked ? -1 : 1) }
            : post
        )
      );
      return { ...prev, [id]: !currentlyLiked };
    });
  };

  const handlePublish = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPostItem: CommunityPost = {
      id: `p-${Date.now()}`,
      authorName: 'Camille Laurent',
      authorInitials: 'CL',
      authorBadge: 'Membre Vérificateur',
      authorBadgeColor: '#0F766E',
      authorColor: '#0F766E',
      timeAgo: 'À l’instant',
      category: newCategory,
      categoryColor: '#0F766E',
      title: newTitle.trim(),
      content: newContent.trim(),
      sourceUrl: newSource.trim() || undefined,
      likes: 1,
      commentsCount: 0,
      sharesCount: 0,
      status: 'analyzing',
      statusLabel: 'En cours d’analyse',
      statusColor: '#475569',
      tab: 'Pour vous',
    };

    setPosts([newPostItem, ...posts]);
    setNewTitle('');
    setNewContent('');
    setNewSource('');
    setPublishModalOpen(false);
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
            <IconUsers size={16} color={THEME.colors.teal} />
            <Text style={styles.headerBadgeText}>Espace d’échange citoyen</Text>
          </View>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Communauté TRAUNES AI</Text>
              <Text style={styles.headerSubtitle}>
                Partagez des décryptages, signalez des infox émergentes et collaborez avec d’autres vérificateurs pour éclairer le débat public.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push('/community/publish')}
              style={styles.publishHeaderBtn}
            >
              <IconPlusCircle size={16} color="#FFFFFF" />
              <Text style={styles.publishHeaderBtnText}>Publier une analyse</Text>
            </Pressable>
          </View>
        </View>

        {/* Tab & Category Filters */}
        <View style={styles.filtersSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
            <View style={styles.tabGroup}>
              {COMMUNITY_TABS.map((tab) => {
                const active = activeTab === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[styles.tabBtn, active && styles.tabBtnActive]}
                  >
                    <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>
                      {tab}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            <View style={styles.catGroup}>
              {COMMUNITY_CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[styles.catChip, active && styles.catChipActive]}
                  >
                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Main Feed + Sidebar Layout */}
        <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
          {/* Posts Feed Column */}
          <View style={styles.feedCol}>
            {filteredPosts.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Aucune publication pour ce filtre</Text>
                <Text style={styles.emptyDesc}>
                  Soyez le premier à partager une analyse ou un signalement dans cette catégorie !
                </Text>
                <Pressable
                  onPress={() => setPublishModalOpen(true)}
                  style={styles.emptyPublishBtn}
                >
                  <Text style={styles.emptyPublishText}>Rédiger un post</Text>
                </Pressable>
              </View>
            ) : (
              filteredPosts.map((post) => {
                const isLiked = !!likedPosts[post.id];
                return (
                  <View key={post.id} style={styles.postCard}>
                    {/* Post Author Bar */}
                    <View style={styles.authorRow}>
                      <View style={[styles.avatarCircle, { backgroundColor: post.authorColor }]}>
                        <Text style={styles.avatarInitials}>{post.authorInitials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.authorNameRow}>
                          <Text style={styles.authorName}>{post.authorName}</Text>
                          <View
                            style={[
                              styles.authorBadgePill,
                              { backgroundColor: post.authorBadgeColor + '18' },
                            ]}
                          >
                            <Text style={[styles.authorBadgeText, { color: post.authorBadgeColor }]}>
                              {post.authorBadge}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.postTime}>{post.timeAgo}</Text>
                      </View>

                      <View
                        style={[
                          styles.categoryPill,
                          { backgroundColor: post.categoryColor + '14' },
                        ]}
                      >
                        <Text style={[styles.categoryPillText, { color: post.categoryColor }]}>
                          {post.category}
                        </Text>
                      </View>
                    </View>

                    {/* Post Content */}
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postContent}>{post.content}</Text>

                    {/* Optional Image */}
                    {post.imageUrl && (
                      <View style={styles.imageWrapper}>
                        <Image
                          source={{ uri: post.imageUrl }}
                          style={styles.postImage}
                          resizeMode="cover"
                        />
                      </View>
                    )}

                    {/* Source Link */}
                    {post.sourceUrl && (
                      <View style={styles.sourceBox}>
                        <Text style={styles.sourceLabel}>Source primaire référencée :</Text>
                        <Text style={styles.sourceLink} numberOfLines={1}>
                          {post.sourceUrl}
                        </Text>
                      </View>
                    )}

                    {/* Status Badge */}
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: post.statusColor + '14' },
                        ]}
                      >
                        <IconCheckCircle size={12} color={post.statusColor} />
                        <Text style={[styles.statusBadgeText, { color: post.statusColor }]}>
                          {post.statusLabel}
                        </Text>
                      </View>
                    </View>

                    {/* Bottom Actions Row */}
                    <View style={styles.postFooter}>
                      <Pressable
                        onPress={() => handleLike(post.id)}
                        style={[styles.actionBtn, isLiked && styles.actionBtnLiked]}
                      >
                        <IconHeart size={16} color={isLiked ? '#E11D48' : '#64748B'} />
                        <Text style={[styles.actionBtnText, isLiked && styles.actionBtnTextLiked]}>
                          {post.likes}
                        </Text>
                      </Pressable>

                      <View style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>💬 {post.commentsCount} avis</Text>
                      </View>

                      <View style={[styles.actionBtn, { marginLeft: 'auto' }]}>
                        <IconShare2 size={16} color="#64748B" />
                        <Text style={styles.actionBtnText}>Partager</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Right Column: Community Stats & Charter */}
          <View style={[styles.sidebarCol, isDesktop && styles.sidebarColDesktop]}>
            {/* Quick Publish Box */}
            <View style={styles.quickShareBox}>
              <Text style={styles.quickShareTitle}>Une rumeur à signaler ?</Text>
              <Text style={styles.quickShareSub}>
                Soumettez une affirmation douteuse ou apportez vos éléments de preuve.
              </Text>
              <Pressable
                onPress={() => setPublishModalOpen(true)}
                style={styles.quickShareBtn}
              >
                <Text style={styles.quickShareBtnText}>Créer un nouveau post</Text>
              </Pressable>
            </View>

            {/* Stats Card */}
            <View style={styles.communityStatsCard}>
              <Text style={styles.sideCardHeading}>Activité citoyenne</Text>
              <View style={styles.statLine}>
                <Text style={styles.statLineLabel}>Vérificateurs actifs</Text>
                <Text style={styles.statLineValue}>{COMMUNITY_STATS.activeMembers}</Text>
              </View>
              <View style={styles.statLine}>
                <Text style={styles.statLineLabel}>Analyses partagées</Text>
                <Text style={styles.statLineValue}>{COMMUNITY_STATS.reportsShared}</Text>
              </View>
              <View style={styles.statLine}>
                <Text style={styles.statLineLabel}>Taux de fiabilité</Text>
                <Text style={[styles.statLineValue, { color: '#0F766E' }]}>
                  {COMMUNITY_STATS.reliabilityRate}
                </Text>
              </View>
            </View>

            {/* Rules / Charter Card */}
            <View style={styles.charterCard}>
              <View style={styles.charterHeader}>
                <IconShield size={16} color="#0F766E" />
                <Text style={styles.charterHeading}>Charte de la communauté</Text>
              </View>
              {COMMUNITY_RULES.map((rule, idx) => (
                <View key={idx} style={styles.ruleItem}>
                  <Text style={styles.ruleBullet}>•</Text>
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Quick Publish Modal */}
        {publishModalOpen && (
          <Modal
            transparent
            visible={publishModalOpen}
            animationType="fade"
            onRequestClose={() => setPublishModalOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeading}>Publier dans la communauté</Text>
                  <Pressable
                    onPress={() => setPublishModalOpen(false)}
                    style={styles.modalCloseBtn}
                  >
                    <IconX size={20} color="#64748B" />
                  </Pressable>
                </View>

                <ScrollView style={{ maxHeight: 420 }}>
                  <Text style={styles.inputLabel}>Titre de l’affirmation ou du décryptage *</Text>
                  <TextInput
                    value={newTitle}
                    onChangeText={setNewTitle}
                    placeholder="Ex: Rumeur virale sur le gel record en Antarctique..."
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput}
                  />

                  <Text style={styles.inputLabel}>Catégorie</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {COMMUNITY_CATEGORIES.slice(1).map((cat) => (
                        <Pressable
                          key={cat}
                          onPress={() => setNewCategory(cat)}
                          style={[
                            styles.catModalPill,
                            newCategory === cat && styles.catModalPillActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.catModalPillText,
                              newCategory === cat && styles.catModalPillTextActive,
                            ]}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>

                  <Text style={styles.inputLabel}>Votre analyse / décryptage *</Text>
                  <TextInput
                    value={newContent}
                    onChangeText={setNewContent}
                    placeholder="Expliquez pourquoi l'affirmation est fausse, trompeuse ou vérifiée, avec les faits..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={4}
                    style={[styles.textInput, styles.textArea]}
                  />

                  <Text style={styles.inputLabel}>Lien vers la source primaire (facultatif)</Text>
                  <TextInput
                    value={newSource}
                    onChangeText={setNewSource}
                    placeholder="https://..."
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput}
                  />
                </ScrollView>

                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => setPublishModalOpen(false)}
                    style={styles.modalCancelBtn}
                  >
                    <Text style={styles.modalCancelText}>Annuler</Text>
                  </Pressable>

                  <Pressable
                    onPress={handlePublish}
                    style={[
                      styles.modalSubmitBtn,
                      (!newTitle.trim() || !newContent.trim()) && styles.modalSubmitBtnDisabled,
                    ]}
                    disabled={!newTitle.trim() || !newContent.trim()}
                  >
                    <IconSend size={16} color="#FFFFFF" />
                    <Text style={styles.modalSubmitText}>Publier maintenant</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
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
    maxWidth: 700,
  },
  publishHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F766E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  publishHeaderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filtersSection: {
    marginBottom: 24,
  },
  tabScroll: {
    marginBottom: 10,
  },
  tabGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#102A43',
    borderColor: '#102A43',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  catScroll: {},
  catGroup: {
    flexDirection: 'row',
    gap: 6,
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
  mainLayout: {
    flexDirection: 'column',
    gap: 24,
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  feedCol: {
    flex: 1,
    gap: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102A43',
  },
  authorBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  authorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  postTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102A43',
    lineHeight: 22,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
  imageWrapper: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  sourceBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  sourceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  sourceLink: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '600',
  },
  statusRow: {
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionBtnLiked: {},
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  actionBtnTextLiked: {
    color: '#E11D48',
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102A43',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 18,
  },
  emptyPublishBtn: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyPublishText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sidebarCol: {
    width: '100%',
    gap: 16,
  },
  sidebarColDesktop: {
    width: 320,
  },
  quickShareBox: {
    backgroundColor: '#102A43',
    borderRadius: 16,
    padding: 20,
  },
  quickShareTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  quickShareSub: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 16,
  },
  quickShareBtn: {
    backgroundColor: '#0F766E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickShareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  communityStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sideCardHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102A43',
    marginBottom: 12,
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  statLineLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statLineValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#102A43',
  },
  charterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  charterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  charterHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102A43',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  ruleBullet: {
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '800',
  },
  ruleText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    flex: 1,
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
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#102A43',
  },
  modalCloseBtn: {
    padding: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 14,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  catModalPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  catModalPillActive: {
    backgroundColor: '#0F766E',
  },
  catModalPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  catModalPillTextActive: {
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F766E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSubmitBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
