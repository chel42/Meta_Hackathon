import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../../theme/colors';
import {
  IconSearch,
  IconLink2,
  IconFileText,
  IconShield,
  IconArrowRight,
  IconZap,
  IconChevronRight,
  IconSparkles,
} from '../../icons/Icons';
import { useTraunesAIData } from '../../context/TraunesAIDataContext';

export const TraunesAIHeroEngine: React.FC = () => {
  const router = useRouter();
  const { startVerification, activeRuns } = useTraunesAIData();

  const [inputMode, setInputMode] = useState<'text' | 'url'>('text');
  const [content, setContent] = useState('');
  const [depth, setDepth] = useState<'standard' | 'deep' | 'rapid'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if there is an active run in progress
  const latestRunId = Object.keys(activeRuns).pop();
  const activeRun = latestRunId ? activeRuns[latestRunId] : undefined;

  const samplePrompts = [
    'Une nouvelle loi sur le climat adoptée en 2025 ?',
    'Rupture statistique sur la hausse des températures annuelles',
    'Analyse de fiabilité d’un rapport épidémiologique récent',
  ];

  const handleLaunch = () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    const runId = startVerification(content.trim(), inputMode, depth);
    setIsSubmitting(false);
    setContent('');
    router.push(`/runs/${runId}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Title & Description Header */}
      <View style={styles.headerArea}>
        <View style={styles.badgeRow}>
          <IconShield size={14} color="#14B8A6" />
          <Text style={styles.badgeText}>TRAUNES AI Investigation Engine</Text>
        </View>
        <Text style={styles.title}>L'information mérite des preuves.</Text>
        <Text style={styles.subtitle}>
          Analysez les informations, vérifiez les affirmations et découvrez les preuves avec l'intelligence de TRAUNES AI.
        </Text>
      </View>

      {/* Main Input Box Card */}
      <View style={styles.inputCard}>
        {/* Mode Selector Tabs */}
        <View style={styles.modeTabsRow}>
          <Pressable
            onPress={() => setInputMode('text')}
            style={[styles.modeTab, inputMode === 'text' && styles.modeTabActive]}
          >
            <IconFileText size={15} color={inputMode === 'text' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.modeTabText, inputMode === 'text' && styles.modeTabTextActive]}>
              Texte / Affirmation
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setInputMode('url')}
            style={[styles.modeTab, inputMode === 'url' && styles.modeTabActive]}
          >
            <IconLink2 size={15} color={inputMode === 'url' ? '#FFFFFF' : '#94A3B8'} />
            <Text style={[styles.modeTabText, inputMode === 'url' && styles.modeTabTextActive]}>
              Adresse URL
            </Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={setContent}
          placeholder={
            inputMode === 'text'
              ? 'Saisissez ou collez une affirmation à analyser...'
              : 'Collez le lien de l’article ou de la publication (https://...)'
          }
          placeholderTextColor="#64748B"
          multiline={inputMode === 'text'}
          numberOfLines={inputMode === 'text' ? 3 : 1}
        />

        {/* Action Controls Row */}
        <View style={styles.controlsRow}>
          <View style={styles.depthSelectorGroup}>
            <Text style={styles.depthLabel}>Profondeur :</Text>
            <Pressable
              onPress={() =>
                setDepth(depth === 'standard' ? 'deep' : depth === 'deep' ? 'rapid' : 'standard')
              }
              style={styles.depthPill}
            >
              <Text style={styles.depthPillText}>
                {depth === 'standard' ? 'Standard' : depth === 'deep' ? 'Approfondie' : 'Rapide'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleLaunch}
            disabled={!content.trim() || isSubmitting}
            style={({ hovered }: any) => [
              styles.launchBtn,
              hovered && content.trim() && styles.launchBtnHovered,
              !content.trim() && styles.launchBtnDisabled,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <IconSearch size={16} color="#FFFFFF" />
                <Text style={styles.launchBtnText}>Vérifier l'information</Text>
                <IconArrowRight size={15} color="#FFFFFF" />
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Subtext under input */}
      <Text style={styles.subtextNotice}>
        Analysez une information et consultez les éléments qui permettent d'évaluer sa fiabilité.
      </Text>

      {/* Quick Clickable Examples */}
      <View style={styles.samplesRow}>
        <Text style={styles.samplesLabel}>Exemples rapides :</Text>
        <View style={styles.samplesList}>
          {samplePrompts.map((prompt, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                setContent(prompt);
                setInputMode('text');
              }}
              style={({ hovered }: any) => [
                styles.sampleChip,
                hovered && styles.sampleChipHovered,
              ]}
            >
              <Text style={styles.sampleChipText} numberOfLines={1}>
                {prompt}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Live Active Run Indicator Banner if any analysis is actively running */}
      {activeRun && activeRun.status === 'running' && (
        <View style={styles.activeRunBanner}>
          <View style={styles.activeRunStatusCol}>
            <View style={styles.activeRunHeader}>
              <ActivityIndicator size="small" color="#14B8A6" />
              <Text style={styles.activeRunTitle}>
                Investigation TRAUNES AI en cours (#{activeRun.id.slice(-6)})
              </Text>
            </View>
            <Text style={styles.activeRunContent} numberOfLines={1}>
              « {activeRun.inputContent} »
            </Text>
          </View>

          <Pressable
            onPress={() => router.push(`/runs/${activeRun.id}` as any)}
            style={styles.activeRunLinkBtn}
          >
            <Text style={styles.activeRunLinkText}>Suivre en direct</Text>
            <IconChevronRight size={14} color="#14B8A6" />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A1826',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  headerArea: {
    alignItems: 'center',
    textAlign: 'center' as any,
    marginBottom: 28,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5EEAD4',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: 10,
    textAlign: 'center' as any,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 24,
    maxWidth: 620,
    textAlign: 'center' as any,
  },
  inputCard: {
    backgroundColor: '#07131F',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#1E3A5F',
    padding: 20,
    marginBottom: 12,
  },
  modeTabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modeTabActive: {
    backgroundColor: '#0F766E',
    borderColor: '#14B8A6',
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInput: {
    fontSize: 15,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
    outlineStyle: 'none' as any,
    lineHeight: 22,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    flexWrap: 'wrap',
    gap: 12,
  },
  depthSelectorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  depthLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  depthPill: {
    backgroundColor: '#0F2537',
    borderWidth: 1,
    borderColor: '#1E3A5F',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  depthPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#14B8A6',
  },
  launchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  launchBtnHovered: {
    backgroundColor: '#0F766E',
  },
  launchBtnDisabled: {
    opacity: 0.5,
  },
  launchBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtextNotice: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center' as any,
    marginBottom: 20,
    lineHeight: 18,
  },
  samplesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  samplesLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  samplesList: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  sampleChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    maxWidth: 280,
  },
  sampleChipHovered: {
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderColor: '#14B8A6',
  },
  sampleChipText: {
    fontSize: 12,
    color: '#E2E8F0',
  },
  activeRunBanner: {
    marginTop: 24,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  activeRunStatusCol: {
    flex: 1,
  },
  activeRunHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  activeRunTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5EEAD4',
  },
  activeRunContent: {
    fontSize: 12,
    color: '#94A3B8',
  },
  activeRunLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F2537',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E3A5F',
  },
  activeRunLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#14B8A6',
  },
});
