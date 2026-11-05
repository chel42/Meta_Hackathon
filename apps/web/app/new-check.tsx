import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../src/components/layout/AppShell';
import { THEME } from '../src/theme/colors';
import {
  IconFileText,
  IconLink,
  IconImage,
  IconShield,
  IconSearch,
  IconChevronRight,
  IconAlertCircle,
  IconCheck,
} from '../src/icons/Icons';
import { useTraunesAIData } from '../src/context/TraunesAIDataContext';
import { PRESET_EXAMPLES } from '../src/mocks/mockData';

export default function NewCheckScreen() {
  const router = useRouter();
  const { startVerification } = useTraunesAIData();

  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'image'>('text');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('Français');
  const [depth, setDepth] = useState<'standard' | 'deep' | 'rapid'>('standard');
  const [selectedImage, setSelectedImage] = useState<{ name: string; size: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MAX_CHARS = 8000;
  const currentChars = content.length;
  const isOverLimit = currentChars > MAX_CHARS;

  const handleApplyPreset = (preset: (typeof PRESET_EXAMPLES)[0]) => {
    setActiveTab(preset.type);
    setContent(preset.content);
    setError(null);
  };

  const handleSimulateImageUpload = () => {
    setSelectedImage({
      name: 'infographie_virale_climat_2026.png',
      size: '2.1 Mo',
    });
    setContent('Analyse de l’infographie virale prétendant une chute de production d’énergie renouvelable.');
    setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    if (activeTab === 'image' && !selectedImage && !content.trim()) {
      setError('Veuillez sélectionner une image ou décrire le média à vérifier.');
      return;
    }

    if (activeTab === 'url') {
      if (!content.trim() || (!content.startsWith('http://') && !content.startsWith('https://'))) {
        setError('Veuillez saisir une URL valide commençant par https:// ou http://');
        return;
      }
    } else {
      if (!content.trim() || content.trim().length < 15) {
        setError('Le texte soumis doit comporter au moins 15 caractères pour permettre l’extraction d’affirmations.');
        return;
      }
    }

    if (isOverLimit) {
      setError(`Le texte dépasse la limite autorisée de ${MAX_CHARS} caractères.`);
      return;
    }

    const runId = startVerification(
      content,
      activeTab,
      depth,
      language,
      selectedImage || undefined
    );
    router.push(`/runs/${runId}` as any);
  };

  return (
    <AppShell>
      <View style={styles.container}>
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Instruire une nouvelle vérification</Text>
          <Text style={styles.subtitle}>
            Soumettez une déclaration, un lien d’actualité ou un visuel pour décomposer ses affirmations
            et confronter les preuves documentaires disponibles.
          </Text>
        </View>

        {/* Input Type Tabs */}
        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => {
              setActiveTab('text');
              setError(null);
            }}
            style={[styles.tabButton, activeTab === 'text' && styles.tabButtonActive]}
          >
            <IconFileText size={18} color={activeTab === 'text' ? '#FFFFFF' : THEME.colors.navy} />
            <Text style={[styles.tabButtonText, activeTab === 'text' && styles.tabButtonTextActive]}>
              Texte brut
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setActiveTab('url');
              setError(null);
            }}
            style={[styles.tabButton, activeTab === 'url' && styles.tabButtonActive]}
          >
            <IconLink size={18} color={activeTab === 'url' ? '#FFFFFF' : THEME.colors.navy} />
            <Text style={[styles.tabButtonText, activeTab === 'url' && styles.tabButtonTextActive]}>
              Lien web / Article
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setActiveTab('image');
              setError(null);
            }}
            style={[styles.tabButton, activeTab === 'image' && styles.tabButtonActive]}
          >
            <IconImage size={18} color={activeTab === 'image' ? '#FFFFFF' : THEME.colors.navy} />
            <Text style={[styles.tabButtonText, activeTab === 'image' && styles.tabButtonTextActive]}>
              Média & Image
            </Text>
          </Pressable>
        </View>

        {/* Main Input Form Card */}
        <View style={styles.formCard}>
          {error && (
            <View style={styles.errorBanner}>
              <IconAlertCircle size={18} color="#B91C1C" />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {activeTab === 'text' && (
            <View style={styles.fieldSection}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldLabel}>Contenu textuel à soumettre</Text>
                <Text
                  style={[
                    styles.counterText,
                    isOverLimit && styles.counterOverLimit,
                  ]}
                >
                  {currentChars.toLocaleString()} / {MAX_CHARS.toLocaleString()} caractères
                </Text>
              </View>

              <TextInput
                style={styles.textArea}
                value={content}
                onChangeText={(t) => {
                  setContent(t);
                  setError(null);
                }}
                placeholder="Collez ici le communiqué, l’extrait d’article, le fil de discussion ou l’allégation à examiner..."
                placeholderTextColor={THEME.colors.textMuted}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>
          )}

          {activeTab === 'url' && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Adresse URL de la publication</Text>
              <TextInput
                style={styles.singleInput}
                value={content}
                onChangeText={(t) => {
                  setContent(t);
                  setError(null);
                }}
                placeholder="https://exemple.org/article-ou-post-a-verifier"
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={styles.urlHelpText}>
                TRAUNES AI extraira le contenu textuel principal, les métadonnées de l’auteur et les citations.
              </Text>
            </View>
          )}

          {activeTab === 'image' && (
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Document visuel ou capture d’écran</Text>
              <Pressable
                onPress={handleSimulateImageUpload}
                style={styles.imageDropZone}
              >
                <View style={styles.imageDropIcon}>
                  <IconImage size={32} color={THEME.colors.primary} />
                </View>
                <Text style={styles.imageDropTitle}>
                  {selectedImage ? selectedImage.name : 'Cliquez pour sélectionner un fichier ou capture'}
                </Text>
                <Text style={styles.imageDropSub}>
                  {selectedImage
                    ? `Fichier prêt (${selectedImage.size}) • Cliquez pour remplacer`
                    : 'Formats acceptés : PNG, JPEG, WebP jusqu’à 15 Mo'}
                </Text>
              </Pressable>

              {selectedImage && (
                <View style={styles.imageNoteBox}>
                  <IconShield size={16} color="#0F766E" />
                  <Text style={styles.imageNoteText}>
                    Analyse visuelle : vérification des artefacts de modification, cohérence des polices et recherche inversée d’antériorité.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Configuration Options */}
          <View style={styles.optionsRow}>
            {/* Investigation Language */}
            <View style={styles.optionCol}>
              <Text style={styles.optionLabel}>Langue d’analyse</Text>
              <View style={styles.pillsGroup}>
                {['Français', 'Anglais', 'Espagnol', 'Arabe'].map((lang) => (
                  <Pressable
                    key={lang}
                    onPress={() => setLanguage(lang)}
                    style={[
                      styles.optionPill,
                      language === lang && styles.optionPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionPillText,
                        language === lang && styles.optionPillTextActive,
                      ]}
                    >
                      {lang}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Depth Level */}
            <View style={styles.optionCol}>
              <Text style={styles.optionLabel}>Profondeur de recoupement</Text>
              <View style={styles.pillsGroup}>
                {[
                  { id: 'rapid', label: 'Synthétique' },
                  { id: 'standard', label: 'Standard' },
                  { id: 'deep', label: 'Approfondie' },
                ].map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setDepth(item.id as any)}
                    style={[
                      styles.optionPill,
                      depth === item.id && styles.optionPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionPillText,
                        depth === item.id && styles.optionPillTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Submit Action */}
          <View style={styles.submitRow}>
            <View style={styles.charWarning}>
              <Text style={styles.charWarningText}>
                Tous les dossiers produits incluent la traçabilité des requêtes et les limites méthodologiques.
              </Text>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={isOverLimit}
              style={({ hovered }: any) => [
                styles.submitButton,
                hovered && !isOverLimit && styles.submitButtonHovered,
                isOverLimit && styles.submitButtonDisabled,
              ]}
            >
              <IconSearch size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Lancer la vérification</Text>
            </Pressable>
          </View>
        </View>

        {/* 3 Clickable Preset Examples */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsHeaderTitle}>
            Ou pré-remplir avec un exemple d’investigation :
          </Text>

          <View style={styles.presetButtonsRow}>
            {PRESET_EXAMPLES.map((preset) => (
              <Pressable
                key={preset.id}
                onPress={() => handleApplyPreset(preset)}
                style={({ hovered }: any) => [
                  styles.presetBtn,
                  hovered && styles.presetBtnHovered,
                ]}
              >
                <View style={styles.presetBtnBadge}>
                  <Text style={styles.presetBtnBadgeText}>{preset.category}</Text>
                </View>
                <Text style={styles.presetBtnTitle}>{preset.title}</Text>
                <Text style={styles.presetBtnSnippet} numberOfLines={2}>
                  {preset.content}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.navy,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    lineHeight: 21,
    marginTop: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: THEME.radii.lg,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    minHeight: 44,
  },
  tabButtonActive: {
    backgroundColor: THEME.colors.navy,
    borderColor: THEME.colors.navy,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.navy,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.xl,
    padding: 24,
    ...THEME.shadows.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: THEME.radii.md,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  fieldSection: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.navy,
  },
  counterText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  counterOverLimit: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.lg,
    padding: 14,
    fontSize: 14,
    lineHeight: 22,
    color: THEME.colors.text,
    backgroundColor: '#FAFAFA',
    minHeight: 180,
    outlineStyle: 'none' as any,
  },
  singleInput: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radii.lg,
    padding: 14,
    fontSize: 14,
    color: THEME.colors.text,
    backgroundColor: '#FAFAFA',
    marginTop: 8,
    outlineStyle: 'none' as any,
  },
  urlHelpText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 8,
  },
  imageDropZone: {
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: THEME.radii.xl,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    marginTop: 8,
  },
  imageDropIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  imageDropTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.navy,
  },
  imageDropSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
  },
  imageNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
    borderWidth: 1,
    padding: 10,
    borderRadius: THEME.radii.md,
    marginTop: 12,
  },
  imageNoteText: {
    fontSize: 12,
    color: '#0F766E',
    flex: 1,
    lineHeight: 17,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    flexWrap: 'wrap',
  },
  optionCol: {
    flex: 1,
    minWidth: 240,
    gap: 8,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.navy,
  },
  pillsGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: '#F8FAFC',
  },
  optionPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  optionPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    gap: 16,
    flexWrap: 'wrap',
  },
  charWarning: {
    flex: 1,
    minWidth: 240,
  },
  charWarningText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: THEME.radii.lg,
    minHeight: 48,
    ...THEME.shadows.sm,
  },
  submitButtonHovered: {
    backgroundColor: THEME.colors.primaryDark,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  presetsSection: {
    marginTop: 24,
  },
  presetsHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.navy,
    marginBottom: 12,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  presetBtn: {
    flex: 1,
    minWidth: 240,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.lg,
    padding: 14,
  },
  presetBtnHovered: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#F0FDFA',
  },
  presetBtnBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  presetBtnBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.navy,
  },
  presetBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.navy,
    marginBottom: 4,
  },
  presetBtnSnippet: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
});
