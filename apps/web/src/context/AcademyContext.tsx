import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { safeStorage } from '../utils/storage';
import { ACADEMY_MODULES, AcademyModule, AcademyLesson } from '../mocks/academyData';

interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  completedAt: string;
}

interface AcademyContextType {
  modules: AcademyModule[];
  completedLessons: Record<string, boolean>;
  quizResults: Record<number, QuizResult>;
  toggleLesson: (lessonId: string) => void;
  markLessonComplete: (lessonId: string) => void;
  saveQuizResult: (moduleId: number, score: number, total: number) => void;
  overallProgress: {
    completedLessonsCount: number;
    totalLessonsCount: number;
    completedModulesCount: number;
    totalModulesCount: number;
    percentCompleted: number;
    totalTimeSpentMinutes: number;
  };
  resetProgress: () => void;
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined);

const STORAGE_KEY_ACADEMY_LESSONS = 'vera_academy_lessons_v2';
const STORAGE_KEY_ACADEMY_QUIZZES = 'vera_academy_quizzes_v2';

const DEFAULT_COMPLETED_LESSONS: Record<string, boolean> = {
  '1.1': true,
  '1.2': true,
  '1.3': true,
  '2.1': true,
  '2.2': true,
  '2.3': true,
  '3.1': true,
  '3.2': true,
};

const DEFAULT_QUIZ_RESULTS: Record<number, QuizResult> = {
  1: { score: 3, total: 3, passed: true, completedAt: '2026-10-28' },
  2: { score: 3, total: 3, passed: true, completedAt: '2026-11-01' },
};

export const AcademyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [quizResults, setQuizResults] = useState<Record<number, QuizResult>>({});

  useEffect(() => {
    try {
      const storedLessons = safeStorage.getItem(STORAGE_KEY_ACADEMY_LESSONS);
      if (storedLessons) {
        setCompletedLessons(JSON.parse(storedLessons));
      } else {
        setCompletedLessons(DEFAULT_COMPLETED_LESSONS);
        safeStorage.setItem(STORAGE_KEY_ACADEMY_LESSONS, JSON.stringify(DEFAULT_COMPLETED_LESSONS));
      }

      const storedQuizzes = safeStorage.getItem(STORAGE_KEY_ACADEMY_QUIZZES);
      if (storedQuizzes) {
        setQuizResults(JSON.parse(storedQuizzes));
      } else {
        setQuizResults(DEFAULT_QUIZ_RESULTS);
        safeStorage.setItem(STORAGE_KEY_ACADEMY_QUIZZES, JSON.stringify(DEFAULT_QUIZ_RESULTS));
      }
    } catch {
      setCompletedLessons(DEFAULT_COMPLETED_LESSONS);
      setQuizResults(DEFAULT_QUIZ_RESULTS);
    }
  }, []);

  const saveLessonsState = (newState: Record<string, boolean>) => {
    setCompletedLessons(newState);
    safeStorage.setItem(STORAGE_KEY_ACADEMY_LESSONS, JSON.stringify(newState));
  };

  const saveQuizzesState = (newState: Record<number, QuizResult>) => {
    setQuizResults(newState);
    safeStorage.setItem(STORAGE_KEY_ACADEMY_QUIZZES, JSON.stringify(newState));
  };

  const toggleLesson = (lessonId: string) => {
    const next = { ...completedLessons, [lessonId]: !completedLessons[lessonId] };
    saveLessonsState(next);
  };

  const markLessonComplete = (lessonId: string) => {
    if (!completedLessons[lessonId]) {
      const next = { ...completedLessons, [lessonId]: true };
      saveLessonsState(next);
    }
  };

  const saveQuizResult = (moduleId: number, score: number, total: number) => {
    const passed = score / total >= 0.7;
    const next = {
      ...quizResults,
      [moduleId]: {
        score,
        total,
        passed,
        completedAt: new Date().toISOString().split('T')[0],
      },
    };
    saveQuizzesState(next);
  };

  const resetProgress = () => {
    saveLessonsState(DEFAULT_COMPLETED_LESSONS);
    saveQuizzesState(DEFAULT_QUIZ_RESULTS);
  };

  // Compute calculated modules with dynamic statuses and overall metrics
  const { modules, overallProgress } = useMemo(() => {
    let totalLessonsCount = 0;
    let completedLessonsCount = 0;
    let totalTimeSpentMinutes = 0;

    const updatedModules = ACADEMY_MODULES.map((mod) => {
      const modLessonsCount = mod.lessons.length;
      totalLessonsCount += modLessonsCount;

      let modCompletedCount = 0;
      mod.lessons.forEach((l) => {
        if (completedLessons[l.id]) {
          modCompletedCount++;
          completedLessonsCount++;
          // Rough parse duration min
          const mins = parseInt(l.duration, 10) || 10;
          totalTimeSpentMinutes += mins;
        }
      });

      const modProgressPercent = Math.round((modCompletedCount / modLessonsCount) * 100);

      let status: AcademyModule['status'] = 'locked';
      if (modCompletedCount === modLessonsCount) {
        status = 'completed';
      } else if (modCompletedCount > 0) {
        status = 'in-progress';
      } else if (mod.id === 1 || mod.id === 2 || mod.id === 3 || mod.id === 4) {
        // Unlocked for exploration
        status = 'in-progress';
      }

      return {
        ...mod,
        status,
        progress: modProgressPercent,
      };
    });

    const completedModulesCount = updatedModules.filter((m) => m.status === 'completed').length;
    const percentCompleted = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

    return {
      modules: updatedModules,
      overallProgress: {
        completedLessonsCount,
        totalLessonsCount,
        completedModulesCount,
        totalModulesCount: ACADEMY_MODULES.length,
        percentCompleted,
        totalTimeSpentMinutes,
      },
    };
  }, [completedLessons]);

  return (
    <AcademyContext.Provider
      value={{
        modules,
        completedLessons,
        quizResults,
        toggleLesson,
        markLessonComplete,
        saveQuizResult,
        overallProgress,
        resetProgress,
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
};

export const useAcademy = () => {
  const context = useContext(AcademyContext);
  if (!context) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
};
