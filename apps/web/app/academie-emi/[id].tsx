import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppShell } from '../../src/components/layout/AppShell';
import { THEME } from '../../src/theme/colors';
import { getAcademyModuleById } from '../../src/mocks/academyData';
import { useAcademy } from '../../src/context/AcademyContext';
import {
  IconArrowLeft,
  IconClock,
  IconCheckCircle,
  IconLock,
  IconArrowRight,
  IconLightbulb,
  IconAlertTriangle,
  IconShield,
  IconAward,
  IconCheck,
  IconZap,
  IconBookOpen,
} from '../../src/icons/Icons';

export default function ModuleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const moduleId = Number(id) || 1;
  const mod = getAcademyModuleById(moduleId);

  const { completedLessons, toggleLesson, saveQuizResult, quizResults } = useAcademy();

  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [activeMode, setActiveMode] = useState<'lesson' | 'quiz'>('lesson');

  // Interactive Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  if (!mod) {
    return (
      <AppShell>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Module introuvable</Text>
          <Pressable onPress={() => router.push('/academie-emi')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Retour à l’Académie EMI</Text>
          </Pressable>
        </View>
      </AppShell>
    );
  }

  const currentLesson = mod.lessons[activeLessonIdx] || mod.lessons[0];
  const lessonContent = currentLesson?.content;

  // Calculate module stats
  const completedInModule = mod.lessons.filter((l) => completedLessons[l.id]).length;
  const progressPercent = Math.round((completedInModule / mod.lessons.length) * 100);

  const isCurrentLessonDone = !!completedLessons[currentLesson.id];

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (submittedQuiz) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!lessonContent?.quiz) return;
    let correctCount = 0;
    lessonContent.quiz.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    setSubmittedQuiz(true);
    saveQuizResult(mod.id, correctCount, lessonContent.quiz.length);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuiz(false);
  };

  return (
    <AppShell>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Navigation Back Link */}
        <Pressable onPress={() => router.push('/academie-emi')} style={styles.navBack}>
          <IconArrowLeft size={16} color="#0F766E" />
          <Text style={styles.navBackText}>Retour aux modules de l'Académie</Text>
        </Pressable>

        {/* Module Header Header Card */}
        <View style={styles.moduleHeaderCard}>
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{mod.category}</Text>
            </View>

            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{mod.level}</Text>
            </View>

            <View style={styles.durationBadge}>
              <IconClock size={13} color="#64748B" />
              <Text style={styles.durationText}>{mod.duration}</Text>
            </View>
          </View>

          <Text style={styles.moduleTitle}>{mod.title}</Text>
          <Text style={styles.moduleDesc}>{mod.description}</Text>

          {/* Module Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progression du module</Text>
              <Text style={styles.progressValue}>
                {completedInModule} / {mod.lessons.length} leçons terminées ({progressPercent} %)
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        </View>

        {/* Lesson Navigation Strip / Selector */}
        <View style={styles.lessonTabStrip}>
          {mod.lessons.map((lesson, idx) => {
            const isDone = !!completedLessons[lesson.id];
            const isActive = activeMode === 'lesson' && activeLessonIdx === idx;

            return (
              <Pressable
                key={lesson.id}
                onPress={() => {
                  setActiveLessonIdx(idx);
                  setActiveMode('lesson');
                }}
                style={[
                  styles.lessonTabItem,
                  isActive && styles.lessonTabItemActive,
                  isDone && styles.lessonTabItemDone,
                ]}
              >
                <View style={[styles.lessonTabNumCircle, isDone && styles.numCircleDone]}>
                  {isDone ? (
                    <IconCheck size={12} color="#15803D" />
                  ) : (
                    <Text style={[styles.numText, isActive && styles.numTextActive]}>
                      {idx + 1}
                    </Text>
                  )}
                </View>
                <Text style={[styles.lessonTabTitle, isActive && styles.tabTitleActive]} numberOfLines={1}>
                  {lesson.title}
                </Text>
              </Pressable>
            );
          })}

          {/* Quiz Tab Button if quiz exists */}
          {lessonContent?.quiz && (
            <Pressable
              onPress={() => setActiveMode('quiz')}
              style={[
                styles.lessonTabItem,
                styles.quizTabItem,
                activeMode === 'quiz' && styles.lessonTabItemActive,
              ]}
            >
              <IconAward size={16} color={activeMode === 'quiz' ? '#FFFFFF' : '#F59E0B'} />
              <Text style={[styles.lessonTabTitle, activeMode === 'quiz' && styles.tabTitleActive]}>
                Quiz de validation
              </Text>
            </Pressable>
          )}
        </View>

        {/* LESSON MODE VIEW */}
        {activeMode === 'lesson' && lessonContent && (
          <View style={styles.lessonContentCard}>
            {/* Lesson Title Bar */}
            <View style={styles.lessonTitleBar}>
              <View>
                <Text style={styles.lessonKicker}>Leçon {activeLessonIdx + 1} sur {mod.lessons.length}</Text>
                <Text style={styles.lessonHeadingTitle}>{currentLesson.title}</Text>
              </View>

              <Pressable
                onPress={() => toggleLesson(currentLesson.id)}
                style={[styles.markDoneBtn, isCurrentLessonDone && styles.markDoneBtnCompleted]}
              >
                {isCurrentLessonDone ? (
                  <>
                    <IconCheckCircle size={16} color="#15803D" />
                    <Text style={styles.markDoneTextCompleted}>Leçon terminée</Text>
                  </>
                ) : (
                  <>
                    <IconCheck size={16} color="#FFFFFF" />
                    <Text style={styles.markDoneText}>Marquer comme lu</Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Pedagogical Objectives Box */}
            <View style={styles.objectivesBox}>
              <Text style={styles.objectivesHeading}>🎯 Objectifs pédagogiques de cette leçon :</Text>
              <View style={styles.objectivesList}>
                {lessonContent.objectives.map((obj, i) => (
                  <View key={i} style={styles.objectiveItem}>
                    <IconCheckCircle size={14} color="#0F766E" />
                    <Text style={styles.objectiveText}>{obj}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Summary Intro */}
            <Text style={styles.summaryText}>{lessonContent.summary}</Text>

            {/* Content Sections */}
            {lessonContent.sections.map((sec, i) => (
              <View key={i} style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>{sec.title}</Text>
                <Text style={styles.sectionBody}>{sec.body}</Text>

                {sec.example && (
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleTitle}>💡 Cas pratique concret :</Text>
                    <Text style={styles.exampleBody}>{sec.example}</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Warning Box if present */}
            {lessonContent.warningBox && (
              <View style={styles.warningBoxCallout}>
                <View style={styles.warningHeaderRow}>
                  <IconAlertTriangle size={18} color="#B45309" />
                  <Text style={styles.warningTitle}>Piège à éviter</Text>
                </View>
                <Text style={styles.warningBody}>{lessonContent.warningBox}</Text>
              </View>
            )}

            {/* Key Takeaways Box (À retenir) */}
            <View style={styles.keyTakeawaysBox}>
              <Text style={styles.takeawaysTitle}>📌 À retenir absolument :</Text>
              <View style={styles.takeawaysList}>
                {lessonContent.keyTakeaways.map((item, i) => (
                  <View key={i} style={styles.takeawayItem}>
                    <Text style={styles.takeawayBullet}>•</Text>
                    <Text style={styles.takeawayText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* TRAUNES AI Pro Tip */}
            <View style={styles.proTipCard}>
              <View style={styles.proTipHeader}>
                <IconLightbulb size={20} color="#F59E0B" />
                <Text style={styles.proTipTitle}>Conseil pratique TRAUNES AI</Text>
              </View>
              <Text style={styles.proTipBody}>{lessonContent.proTip}</Text>
            </View>

            {/* Bottom Lesson Navigation Bar */}
            <View style={styles.bottomNavRow}>
              <Pressable
                disabled={activeLessonIdx === 0}
                onPress={() => setActiveLessonIdx((prev) => Math.max(0, prev - 1))}
                style={[styles.prevLessonBtn, activeLessonIdx === 0 && styles.disabledBtn]}
              >
                <IconArrowLeft size={16} color={activeLessonIdx === 0 ? '#94A3B8' : '#1E293B'} />
                <Text style={[styles.prevLessonText, activeLessonIdx === 0 && styles.disabledBtnText]}>
                  Leçon précédente
                </Text>
              </Pressable>

              {activeLessonIdx < mod.lessons.length - 1 ? (
                <Pressable
                  onPress={() => {
                    toggleLesson(currentLesson.id);
                    setActiveLessonIdx((prev) => prev + 1);
                  }}
                  style={styles.nextLessonBtn}
                >
                  <Text style={styles.nextLessonText}>Leçon suivante</Text>
                  <IconArrowRight size={16} color="#FFFFFF" />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    toggleLesson(currentLesson.id);
                    setActiveMode('quiz');
                  }}
                  style={styles.startQuizBtn}
                >
                  <IconAward size={16} color="#FFFFFF" />
                  <Text style={styles.nextLessonText}>Passer au Quiz du module</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* QUIZ MODE VIEW */}
        {activeMode === 'quiz' && lessonContent?.quiz && (
          <View style={styles.quizCardContainer}>
            <View style={styles.quizCardHeader}>
              <IconAward size={24} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.quizCardTitle}>Quiz de validation : {mod.title}</Text>
                <Text style={styles.quizCardSub}>
                  Testez vos connaissances et vérifiez votre compréhension avant de valider le module.
                </Text>
              </View>
            </View>

            {/* Questions List */}
            <View style={styles.questionsList}>
              {lessonContent.quiz.map((q, qIdx) => {
                const selected = selectedAnswers[q.id];
                const isCorrect = selected === q.correctIndex;

                return (
                  <View key={q.id} style={styles.questionItemBox}>
                    <Text style={styles.questionNumberText}>Question {qIdx + 1}</Text>
                    <Text style={styles.questionTitleText}>{q.question}</Text>

                    {/* Options */}
                    <View style={styles.optionsGroup}>
                      {q.options.map((opt, optIdx) => {
                        const isSelectedOption = selected === optIdx;
                        let optionStyle = styles.optionBtn;
                        let optionTextStyle = styles.optionBtnText;

                        if (submittedQuiz) {
                          if (optIdx === q.correctIndex) {
                            optionStyle = [styles.optionBtn, styles.optionBtnCorrect] as any;
                            optionTextStyle = [styles.optionBtnText, styles.optionTextCorrect] as any;
                          } else if (isSelectedOption && !isCorrect) {
                            optionStyle = [styles.optionBtn, styles.optionBtnWrong] as any;
                            optionTextStyle = [styles.optionBtnText, styles.optionTextWrong] as any;
                          }
                        } else if (isSelectedOption) {
                          optionStyle = [styles.optionBtn, styles.optionBtnSelected] as any;
                          optionTextStyle = [styles.optionBtnText, styles.optionTextSelected] as any;
                        }

                        return (
                          <Pressable
                            key={optIdx}
                            onPress={() => handleSelectAnswer(q.id, optIdx)}
                            style={optionStyle}
                          >
                            <View style={styles.optionLetterBadge}>
                              <Text style={styles.optionLetterText}>
                                {String.fromCharCode(65 + optIdx)}
                              </Text>
                            </View>
                            <Text style={optionTextStyle}>{opt}</Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {/* Explanation Feedback after submission */}
                    {submittedQuiz && (
                      <View style={[styles.explanationBox, isCorrect ? styles.explanationBoxSuccess : styles.explanationBoxError]}>
                        <Text style={styles.explanationHeading}>
                          {isCorrect ? '✅ Bonne réponse !' : '❌ Réponse incorrecte'}
                        </Text>
                        <Text style={styles.explanationBody}>{q.explanation}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Quiz Action Bar */}
            <View style={styles.quizActionBar}>
              {!submittedQuiz ? (
                <Pressable
                  disabled={Object.keys(selectedAnswers).length < lessonContent.quiz.length}
                  onPress={handleSubmitQuiz}
                  style={[
                    styles.submitQuizBtn,
                    Object.keys(selectedAnswers).length < lessonContent.quiz.length && styles.disabledBtn,
                  ]}
                >
                  <IconCheckCircle size={18} color="#FFFFFF" />
                  <Text style={styles.submitQuizText}>Valider mes réponses</Text>
                </Pressable>
              ) : (
                <View style={styles.submittedResultRow}>
                  <Pressable onPress={handleResetQuiz} style={styles.retryQuizBtn}>
                    <Text style={styles.retryQuizText}>Recommencer le Quiz</Text>
                  </Pressable>

                  <Pressable onPress={() => router.push('/academie-emi')} style={styles.finishModuleBtn}>
                    <Text style={styles.finishModuleText}>Retour à l'Académie</Text>
                    <IconArrowRight size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              )}
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
    maxWidth: 960,
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
    fontWeight: '700',
    color: '#0F766E',
  },

  // Module Header Card
  moduleHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  levelBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#64748B',
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: -0.4,
  },
  moduleDesc: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },

  progressContainer: {
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0F766E',
    borderRadius: 4,
  },

  // Lesson Tab Strip
  lessonTabStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  lessonTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  lessonTabItemActive: {
    backgroundColor: '#0F766E',
  },
  lessonTabItemDone: {
    backgroundColor: '#F0FDF4',
  },
  quizTabItem: {
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FEF3C7',
  },
  lessonTabNumCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numCircleDone: {
    backgroundColor: '#DCFCE7',
  },
  numText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  numTextActive: {
    color: '#1E293B',
  },
  lessonTabTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tabTitleActive: {
    color: '#FFFFFF',
  },

  // Lesson Content View
  lessonContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 20,
  },
  lessonTitleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lessonKicker: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
    textTransform: 'uppercase',
  },
  lessonHeadingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    marginTop: 2,
  },

  markDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F766E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  markDoneBtnCompleted: {
    backgroundColor: '#DCFCE7',
  },
  markDoneText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  markDoneTextCompleted: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
  },

  // Objectives Box
  objectivesBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  objectivesHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F766E',
  },
  objectivesList: {
    gap: 6,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  objectiveText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },

  summaryText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    fontWeight: '500',
  },

  sectionBlock: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionBody: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },

  exampleBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#0F766E',
    borderRadius: 8,
    padding: 14,
    marginTop: 6,
    gap: 4,
  },
  exampleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  exampleBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },

  warningBoxCallout: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  warningHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  warningBody: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 19,
  },

  keyTakeawaysBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  takeawaysTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  takeawaysList: {
    gap: 6,
  },
  takeawayItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  takeawayBullet: {
    color: '#0F766E',
    fontWeight: '900',
  },
  takeawayText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    flex: 1,
  },

  proTipCard: {
    backgroundColor: '#0F2537',
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  proTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proTipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  proTipBody: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 20,
  },

  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  prevLessonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  prevLessonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  nextLessonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F766E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  startQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  nextLessonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  disabledBtn: {
    opacity: 0.5,
  },
  disabledBtnText: {
    color: '#94A3B8',
  },

  // Quiz Mode View
  quizCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 20,
  },
  quizCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  quizCardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  quizCardSub: {
    fontSize: 13,
    color: '#64748B',
  },

  questionsList: {
    gap: 24,
  },
  questionItemBox: {
    gap: 10,
  },
  questionNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
    textTransform: 'uppercase',
  },
  questionTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },

  optionsGroup: {
    gap: 8,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionBtnSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0F766E',
  },
  optionBtnCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  optionBtnWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  optionLetterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  optionBtnText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
  },
  optionTextSelected: {
    color: '#0F766E',
    fontWeight: '800',
  },
  optionTextCorrect: {
    color: '#15803D',
    fontWeight: '800',
  },
  optionTextWrong: {
    color: '#B91C1C',
    fontWeight: '800',
  },

  explanationBox: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
    marginTop: 6,
  },
  explanationBoxSuccess: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  explanationBoxError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  explanationHeading: {
    fontSize: 13,
    fontWeight: '800',
  },
  explanationBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },

  quizActionBar: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F766E',
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitQuizText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  submittedResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  retryQuizBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  retryQuizText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  finishModuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F766E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  finishModuleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  errorContainer: {
    padding: 32,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
