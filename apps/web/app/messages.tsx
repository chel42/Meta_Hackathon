import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { AppShell } from '../src/components/layout/AppShell';
import { THEME } from '../src/theme/colors';
import {
  INITIAL_CONVERSATIONS,
  Conversation,
  ChatMessage,
} from '../src/mocks/messagesData';
import {
  IconMessageSquare,
  IconSend,
  IconSearch,
  IconShield,
  IconCheckCircle,
  IconUser,
  IconGraduationCap,
  IconClock,
  IconArrowLeft,
} from '../src/icons/Icons';

export default function MessagesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState('coach-traunes-ai');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const activeConv = useMemo(() => {
    return conversations.find((c) => c.id === activeId) || conversations[0];
  }, [conversations, activeId]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      time: 'À l’instant',
      status: 'sent',
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              lastMessage: text,
              time: 'À l’instant',
              messages: [...c.messages, userMsg],
            }
          : c
      )
    );

    setInputText('');

    // If talking to Coach IA TRAUNES AI, simulate auto-reply!
    if (activeConv.isCoach) {
      setIsTyping(true);
      setTimeout(() => {
        const coachReply: ChatMessage = {
          id: `reply-${Date.now()}`,
          sender: 'other',
          content: getCoachResponse(text),
          time: 'À l’instant',
          status: 'read',
        };

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  lastMessage: coachReply.content,
                  time: 'À l’instant',
                  messages: [...c.messages, coachReply],
                }
              : c
          )
        );
        setIsTyping(false);
      }, 900);
    }
  };

  const getCoachResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('image') || q.includes('photo')) {
      return 'Pour analyser une image suspecte : 1. Effectuez une recherche inversée (Google Images / TinEye). 2. Examinez les ombres et les raccords. 3. Vérifiez si l’image n’a pas été prise il y a plusieurs années lors d’un autre événement.';
    }
    if (q.includes('source') || q.includes('fiable')) {
      return 'La règle d’or TRAUNES AI : identifiez qui publie (auteur, affiliation), quel est le modèle économique du site, et croisez avec au moins deux sources indépendantes reconnues (agences de presse certifiées, revues à comité de lecture).';
    }
    if (q.includes('ia') || q.includes('deepfake')) {
      return 'Les deepfakes laissent des traces : asymétrie des reflets oculaires, contours flous autour des cheveux et des doigts, décalage audio-visuel. Notre module "IA générative" dans l’Académie vous apprend à les détecter facilement.';
    }
    return `Bien reçu ! Face à cette affirmation, commencez par vous poser les 3 questions TRAUNES AI : Qui parle ? Quelle est la preuve originale ? Existe-t-il une source primaire certifiée ? Je peux également vous aider à formuler une recherche ciblée.`;
  };

  const handleSelectConv = (id: string) => {
    setActiveId(id);
    setMobileChatOpen(true);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  return (
    <AppShell>
      <View style={styles.container}>
        {/* Main Messenger Panel */}
        <View style={styles.messengerCard}>
          {/* Left Pane: Conversations List */}
          <View
            style={[
              styles.leftPane,
              (!isDesktop && mobileChatOpen) && styles.leftPaneHiddenMobile,
            ]}
          >
            <View style={styles.leftPaneHeader}>
              <View style={styles.headerTitleRow}>
                <IconMessageSquare size={18} color="#0F766E" />
                <Text style={styles.leftPaneTitle}>Messagerie & Coach</Text>
              </View>
              <Text style={styles.leftPaneSub}>Échangez avec les vérificateurs et le Coach TRAUNES AI</Text>

              {/* Search Bar */}
              <View style={styles.searchBar}>
                <IconSearch size={14} color="#94A3B8" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Rechercher..."
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                />
              </View>
            </View>

            {/* List */}
            <ScrollView style={styles.convList} showsVerticalScrollIndicator={false}>
              {filteredConversations.map((c: Conversation) => {
                const isSelected = c.id === activeId;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => handleSelectConv(c.id)}
                    style={({ hovered }: any) => [
                      styles.convItem,
                      isSelected && styles.convItemSelected,
                      hovered && !isSelected && styles.convItemHovered,
                    ]}
                  >
                    <View style={styles.convAvatarWrapper}>
                      <View style={[styles.convAvatar, { backgroundColor: c.avatarColor }]}>
                        <Text style={styles.convAvatarText}>{c.avatarLetter}</Text>
                      </View>
                      {c.isOnline && <View style={styles.onlineBadge} />}
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={styles.convNameRow}>
                        <Text style={[styles.convName, isSelected && styles.convNameSelected]}>
                          {c.name}
                        </Text>
                        <Text style={styles.convTime}>{c.time}</Text>
                      </View>
                      <Text style={styles.convRole} numberOfLines={1}>
                        {c.role}
                      </Text>
                      <Text
                        style={[
                          styles.convLastMsg,
                          c.unreadCount ? styles.convLastMsgUnread : null,
                        ]}
                        numberOfLines={1}
                      >
                        {c.lastMessage}
                      </Text>
                    </View>

                    {c.unreadCount ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{c.unreadCount}</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Center Pane: Active Chat Area */}
          <View
            style={[
              styles.chatPane,
              (!isDesktop && !mobileChatOpen) && styles.chatPaneHiddenMobile,
            ]}
          >
            {/* Chat Top Header */}
            <View style={styles.chatTopBar}>
              {!isDesktop && (
                <Pressable
                  onPress={() => setMobileChatOpen(false)}
                  style={styles.backToConvsBtn}
                >
                  <IconArrowLeft size={18} color="#0F766E" />
                </Pressable>
              )}

              <View
                style={[
                  styles.convAvatar,
                  { backgroundColor: activeConv.avatarColor, width: 36, height: 36, borderRadius: 18 },
                ]}
              >
                <Text style={styles.convAvatarText}>{activeConv.avatarLetter}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.chatTopName}>{activeConv.name}</Text>
                  {activeConv.isCoach && (
                    <View style={styles.coachTag}>
                      <Text style={styles.coachTagText}>Coach IA Officiel</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.chatTopRole}>
                  {activeConv.isOnline ? '🟢 En ligne • ' : '⚪ Hors ligne • '}
                  {activeConv.role}
                </Text>
              </View>
            </View>

            {/* Quick Prompts Bar for Coach */}
            {activeConv.isCoach && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.quickPromptsScroll}
                contentContainerStyle={styles.quickPromptsContainer}
              >
                <Pressable
                  onPress={() => setInputText('Comment vérifier si une image a été manipulée ?')}
                  style={styles.promptChip}
                >
                  <Text style={styles.promptChipText}>📸 Vérifier une image</Text>
                </Pressable>
                <Pressable
                  onPress={() => setInputText('Quels sont les indices d’un deepfake audio ou vidéo ?')}
                  style={styles.promptChip}
                >
                  <Text style={styles.promptChipText}>🤖 Repérer un deepfake IA</Text>
                </Pressable>
                <Pressable
                  onPress={() => setInputText('Comment reconnaître une source médicale douteuse ?')}
                  style={styles.promptChip}
                >
                  <Text style={styles.promptChipText}>🩺 Évaluer une source santé</Text>
                </Pressable>
              </ScrollView>
            )}

            {/* Messages Scroll Feed */}
            <ScrollView style={styles.messagesFeed} showsVerticalScrollIndicator={false}>
              {activeConv.messages.map((msg: ChatMessage) => {
                const isUser = msg.sender === 'user';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageRow,
                      isUser ? styles.messageRowUser : styles.messageRowOther,
                    ]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        isUser ? styles.bubbleUser : styles.bubbleOther,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          isUser ? styles.bubbleTextUser : styles.bubbleTextOther,
                        ]}
                      >
                        {msg.content}
                      </Text>
                      <View style={styles.bubbleMeta}>
                        <Text
                          style={[
                            styles.bubbleTime,
                            isUser ? styles.bubbleTimeUser : styles.bubbleTimeOther,
                          ]}
                        >
                          {msg.time}
                        </Text>
                        {isUser && <IconCheckCircle size={10} color="#CCFBF1" />}
                      </View>
                    </View>
                  </View>
                );
              })}

              {isTyping && (
                <View style={[styles.messageRow, styles.messageRowOther]}>
                  <View style={[styles.bubble, styles.bubbleOther, { paddingVertical: 10 }]}>
                    <Text style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic' }}>
                      Le Coach TRAUNES AI analyse votre question... ✍️
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Message Input Bar */}
            <View style={styles.inputContainer}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder={
                  activeConv.isCoach
                    ? 'Posez une question méthodologique au Coach IA...'
                    : 'Écrivez votre message...'
                }
                placeholderTextColor="#94A3B8"
                style={styles.chatInput}
                onSubmitEditing={handleSendMessage}
              />
              <Pressable
                onPress={handleSendMessage}
                disabled={!inputText.trim()}
                style={[
                  styles.sendBtn,
                  !inputText.trim() && styles.sendBtnDisabled,
                ]}
              >
                <IconSend size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F8FA',
  },
  messengerCard: {
    flex: 1,
    minHeight: 640,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  leftPane: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    backgroundColor: '#FAFCFD',
  },
  leftPaneHiddenMobile: {
    display: 'none',
  },
  leftPaneHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leftPaneTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#102A43',
  },
  leftPaneSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#102A43',
    padding: 0,
  },
  convList: {
    flex: 1,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  convItemSelected: {
    backgroundColor: '#F0FDFA',
    borderLeftWidth: 3,
    borderLeftColor: '#0F766E',
  },
  convItemHovered: {
    backgroundColor: '#F1F5F9',
  },
  convAvatarWrapper: {
    position: 'relative',
  },
  convAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  convNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  convName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#102A43',
  },
  convNameSelected: {
    color: '#0F766E',
  },
  convTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  convRole: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  convLastMsg: {
    fontSize: 11,
    color: '#94A3B8',
  },
  convLastMsgUnread: {
    color: '#102A43',
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatPane: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  chatPaneHiddenMobile: {
    display: 'none',
  },
  chatTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backToConvsBtn: {
    padding: 6,
  },
  chatTopName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#102A43',
  },
  chatTopRole: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  coachTag: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coachTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F766E',
  },
  quickPromptsScroll: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  quickPromptsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  promptChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  promptChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  messagesFeed: {
    flex: 1,
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 14,
    padding: 12,
  },
  bubbleUser: {
    backgroundColor: '#0F766E',
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 2,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 19,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  bubbleTextOther: {
    color: '#1E293B',
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  bubbleTime: {
    fontSize: 10,
  },
  bubbleTimeUser: {
    color: '#CCFBF1',
  },
  bubbleTimeOther: {
    color: '#94A3B8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1E293B',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
