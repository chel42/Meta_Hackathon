import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '../../src/components/layout/AppShell';
import { THEME } from '../../src/theme/colors';
import { COMMUNITY_CATEGORIES } from '../../src/mocks/communityData';
import {
  IconArrowLeft,
  IconSend,
  IconShield,
  IconCheckCircle,
} from '../../src/icons/Icons';

export default function PublishCommunityScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Politique');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    setIsSuccess(true);
    setTimeout(() => {
      router.push('/community');
    }, 1200);
  };

  return (
    <AppShell>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.push('/community')} style={styles.navBack}>
          <IconArrowLeft size={16} color={THEME.colors.teal} />
          <Text style={styles.navBackText}>Retour à la communauté</Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.heading}>Nouvelle publication citoyenne</Text>
          <Text style={styles.subheading}>
            Partagez une information décryptée ou soumettez une affirmation douteuse pour analyse collaborative.
          </Text>

          {isSuccess ? (
            <View style={styles.successBox}>
              <IconCheckCircle size={32} color="#15803D" />
              <Text style={styles.successTitle}>Publication partagée avec succès !</Text>
              <Text style={styles.successText}>Redirection vers le fil communautaire...</Text>
            </View>
          ) : (
            <View style={styles.formArea}>
              <Text style={styles.label}>Titre clair de l’affirmation ou de l’enquête *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ex : Prétendue suppression des subventions agricoles en Europe..."
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />

              <Text style={styles.label}>Catégorie thématique</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {COMMUNITY_CATEGORIES.slice(1).map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[styles.catBtn, category === cat && styles.catBtnActive]}
                    >
                      <Text
                        style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.label}>Contenu explicatif et preuves factuelles *</Text>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Décrivez les faits vérifiés, le contexte d’origine, les déclarations officielles..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                style={[styles.input, styles.textArea]}
              />

              <Text style={styles.label}>Lien URL de la source primaire vérifiable</Text>
              <TextInput
                value={sourceUrl}
                onChangeText={setSourceUrl}
                placeholder="https://..."
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />

              <View style={styles.ruleReminder}>
                <IconShield size={16} color="#0F766E" />
                <Text style={styles.ruleReminderText}>
                  En publiant, vous vous engagez à respecter la charte éthique TRAUNES AI : bienveillance, traçabilité des affirmations et absence de diffamation.
                </Text>
              </View>

              <View style={styles.btnRow}>
                <Pressable
                  onPress={() => router.push('/community')}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </Pressable>

                <Pressable
                  onPress={handleSubmit}
                  disabled={!title.trim() || !content.trim()}
                  style={[
                    styles.submitBtn,
                    (!title.trim() || !content.trim()) && styles.submitBtnDisabled,
                  ]}
                >
                  <IconSend size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Publier la contribution</Text>
                </Pressable>
              </View>
            </View>
          )}
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
    maxWidth: 760,
    alignSelf: 'center',
    width: '100%',
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  navBackText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F766E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#102A43',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 18,
  },
  formArea: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  catBtnActive: {
    backgroundColor: '#0F766E',
  },
  catBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  catBtnTextActive: {
    color: '#FFFFFF',
  },
  ruleReminder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    marginBottom: 20,
  },
  ruleReminderText: {
    fontSize: 12,
    color: '#134E4A',
    flex: 1,
    lineHeight: 17,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F766E',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successBox: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
  },
  successText: {
    fontSize: 13,
    color: '#64748B',
  },
});
