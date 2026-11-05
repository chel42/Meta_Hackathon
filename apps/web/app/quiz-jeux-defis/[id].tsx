import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppShell } from '../../src/components/layout/AppShell';
import { THEME } from '../../src/theme/colors';
import { getQuizSessionById } from '../../src/mocks/quizData';
import {
  IconArrowLeft,
  IconCheckCircle,
  IconXCircle,
  IconTrophy,
  IconZap,
  IconArrowRight,
  IconGamepad,
} from '../../src/icons/Icons';

export default function InteractiveQuizScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const quizId = Number(id) || 1;
  const session = getQuizSessionById(quizId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = session.questions[currentIndex];
  const totalQuestions = session.questions.length;

  const handleSelectChoice = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerChecked(true);
    if (selectedAnswer === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <AppShell>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation back */}
        <Pressable
          onPress={() => router.push('/quiz-jeux-defis')}
          style={styles.navBack}
        >
          <IconArrowLeft size={16} color={THEME.colors.teal} />
          <Text style={styles.navBackText}>Retour aux Quiz & Jeux</Text>
        </Pressable>

        {!isFinished ? (
          <View style={styles.quizCard}>
            {/* Header info */}
            <View style={styles.quizHeader}>
              <View>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.progressCounter}>
                  Question {currentIndex + 1} sur {totalQuestions}
                </Text>
              </View>
              <View style={styles.xpBadge}>
                <IconZap size={14} color="#0F766E" />
                <Text style={styles.xpBadgeText}>+{session.xp} XP</Text>
              </View>
            </View>

            {/* Stepper bar */}
            <View style={styles.stepperBar}>
              {session.questions.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.stepperDot,
                    idx <= currentIndex && styles.stepperDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Question prompt */}
            <Text style={styles.questionPrompt}>{currentQ.prompt}</Text>

            {/* Choices list */}
            <View style={styles.choicesList}>
              {currentQ.choices.map((choice, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = isAnswerChecked && idx === currentQ.correctIndex;
                const isWrong = isAnswerChecked && isSelected && idx !== currentQ.correctIndex;

                return (
                  <Pressable
                    key={idx}
                    onPress={() => handleSelectChoice(idx)}
                    style={({ hovered }: any) => [
                      styles.choiceItem,
                      isSelected && styles.choiceItemSelected,
                      isCorrect && styles.choiceItemCorrect,
                      isWrong && styles.choiceItemWrong,
                      hovered && !isAnswerChecked && styles.choiceItemHovered,
                    ]}
                  >
                    <View
                      style={[
                        styles.choiceLetter,
                        isSelected && styles.choiceLetterSelected,
                        isCorrect && styles.choiceLetterCorrect,
                        isWrong && styles.choiceLetterWrong,
                      ]}
                    >
                      <Text
                        style={[
                          styles.choiceLetterText,
                          (isSelected || isCorrect || isWrong) && styles.choiceLetterTextActive,
                        ]}
                      >
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>

                    <Text style={styles.choiceText}>{choice}</Text>

                    {isCorrect && (
                      <View style={{ marginLeft: 'auto' }}>
                        <IconCheckCircle size={18} color="#15803D" />
                      </View>
                    )}
                    {isWrong && (
                      <View style={{ marginLeft: 'auto' }}>
                        <IconXCircle size={18} color="#DC2626" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Explanation card after check */}
            {isAnswerChecked && (
              <View
                style={[
                  styles.explanationBox,
                  selectedAnswer === currentQ.correctIndex
                    ? styles.explanationBoxSuccess
                    : styles.explanationBoxError,
                ]}
              >
                <Text
                  style={[
                    styles.explanationTitle,
                    selectedAnswer === currentQ.correctIndex
                      ? styles.explanationTitleSuccess
                      : styles.explanationTitleError,
                  ]}
                >
                  {selectedAnswer === currentQ.correctIndex ? 'Bravo ! Bonne réponse' : 'Pas tout à fait...'}
                </Text>
                <Text style={styles.explanationText}>{currentQ.explanation}</Text>
              </View>
            )}

            {/* Action Bottom */}
            <View style={styles.footerAction}>
              {!isAnswerChecked ? (
                <Pressable
                  onPress={handleCheckAnswer}
                  disabled={selectedAnswer === null}
                  style={[
                    styles.submitBtn,
                    selectedAnswer === null && styles.submitBtnDisabled,
                  ]}
                >
                  <Text style={styles.submitBtnText}>Valider la réponse</Text>
                </Pressable>
              ) : (
                <Pressable onPress={handleNext} style={styles.submitBtn}>
                  <Text style={styles.submitBtnText}>
                    {currentIndex + 1 < totalQuestions ? 'Question suivante' : 'Voir mon score final'}
                  </Text>
                  <IconArrowRight size={16} color="#FFFFFF" />
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          /* Finished Screen */
          <View style={styles.finishedCard}>
            <View style={styles.trophyWrapper}>
              <IconTrophy size={40} color="#F59E0B" />
            </View>
            <Text style={styles.finishedTitle}>Quiz terminé !</Text>
            <Text style={styles.finishedSubtitle}>
              Félicitations pour avoir complété « {session.title} ».
            </Text>

            <View style={styles.scoreRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Score</Text>
                <Text style={styles.scoreNumber}>
                  {score} / {totalQuestions}
                </Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Gain XP</Text>
                <Text style={[styles.scoreNumber, { color: '#0F766E' }]}>
                  +{Math.round((score / totalQuestions) * session.xp)} XP
                </Text>
              </View>
            </View>

            <View style={styles.finishActions}>
              <Pressable onPress={handleRestart} style={styles.restartBtn}>
                <Text style={styles.restartBtnText}>Rejouer ce quiz</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/quiz-jeux-defis')}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>Retour aux Défis</Text>
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
    backgroundColor: '#F5F8FA',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 60,
    maxWidth: 780,
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
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#102A43',
  },
  progressCounter: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  stepperBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  stepperDot: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  stepperDotActive: {
    backgroundColor: '#0F766E',
  },
  questionPrompt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102A43',
    lineHeight: 22,
    marginBottom: 20,
  },
  choicesList: {
    gap: 10,
    marginBottom: 20,
  },
  choiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  choiceItemHovered: {
    borderColor: '#0F766E',
  },
  choiceItemSelected: {
    borderColor: '#0F766E',
    backgroundColor: '#F0FDFA',
  },
  choiceItemCorrect: {
    borderColor: '#15803D',
    backgroundColor: '#F0FDF4',
  },
  choiceItemWrong: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  choiceLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceLetterSelected: {
    backgroundColor: '#0F766E',
  },
  choiceLetterCorrect: {
    backgroundColor: '#15803D',
  },
  choiceLetterWrong: {
    backgroundColor: '#DC2626',
  },
  choiceLetterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  choiceLetterTextActive: {
    color: '#FFFFFF',
  },
  choiceText: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    lineHeight: 19,
  },
  explanationBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  explanationBoxSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  explanationBoxError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  explanationTitleSuccess: {
    color: '#15803D',
  },
  explanationTitleError: {
    color: '#DC2626',
  },
  explanationText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  footerAction: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F766E',
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  finishedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  trophyWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  finishedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#102A43',
    marginBottom: 6,
  },
  finishedSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 28,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#102A43',
  },
  finishActions: {
    flexDirection: 'row',
    gap: 12,
  },
  restartBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  restartBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  doneBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0F766E',
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
