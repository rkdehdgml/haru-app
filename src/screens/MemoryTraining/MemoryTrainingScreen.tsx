import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { FamilyPhotoQuizCard } from '../../components/games/FamilyPhotoQuizCard';
import { TapSequenceBoard, type TapSequenceItem } from '../../components/games/TapSequenceBoard';
import { WordRecallBoard } from '../../components/games/WordRecallBoard';
import { QuizQuestionCard } from '../../components/QuizQuestionCard';
import { TrainingSessionRunner } from '../../components/TrainingSessionRunner';
import { selectDailyExercises } from '../../data/exerciseSelector';
import {
  generateBreakfastQuestion,
  generateMedicalStaffQuestion,
  generateYesterdayEventQuestion,
} from '../../data/questionBank';
import { syncExerciseAccuracySummary } from '../../services/exerciseAccuracySync';
import { getMemoryPrompt } from '../../services/memoryPromptSync';
import { getCarePreferences } from '../../services/storage/carePreferencesStorage';
import {
  getAccuracyRecords,
  getRecentExposures,
  recordExerciseResult,
} from '../../services/storage/exerciseResultStorage';
import { getFamilyMembers } from '../../services/storage/familyMemberStorage';
import type { FamilyMember } from '../../types/familyMember';
import type { MemoryExerciseType } from '../../types/exercise';
import type { MemoryPromptInput } from '../../types/memoryPrompt';

// 보호자가 아직 입력하지 않은 콘텐츠(아침 식사/어제 일/가족사진/담당의)가 걸리면
// 이 두 유형(항상 콘텐츠가 준비돼 있음)으로 대신 채운다.
const ALWAYS_AVAILABLE_TYPES: MemoryExerciseType[] = ['short_term_word_recall', 'photo_sequence_ordering'];

const PHOTO_SEQUENCE_ITEMS: TapSequenceItem[] = [
  { id: 'morning', label: '아침', icon: '🌅' },
  { id: 'meal', label: '식사', icon: '🍚' },
  { id: 'walk', label: '산책', icon: '🚶' },
  { id: 'night', label: '밤', icon: '🌙' },
];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function hasContentFor(
  type: MemoryExerciseType,
  context: { prompt: MemoryPromptInput | null; memberCount: number; doctorName: string }
): boolean {
  switch (type) {
    case 'today_breakfast_recall':
      return Boolean(context.prompt?.breakfast);
    case 'yesterday_event_quiz':
      return Boolean(context.prompt?.yesterdayEvent);
    case 'family_photo_naming':
      return context.memberCount > 0;
    case 'medical_staff_recall':
      return Boolean(context.doctorName);
    default:
      return true;
  }
}

export function MemoryTrainingScreen() {
  const [types, setTypes] = useState<MemoryExerciseType[] | null>(null);
  const [memoryPrompt, setMemoryPrompt] = useState<MemoryPromptInput | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    void (async () => {
      const today = todayKey();
      const [recentExposures, accuracyRecords, prompt, members, prefs] = await Promise.all([
        getRecentExposures(3),
        getAccuracyRecords(),
        getMemoryPrompt(today),
        getFamilyMembers(),
        getCarePreferences(),
      ]);
      setMemoryPrompt(prompt);
      setFamilyMembers(members);
      setDoctorName(prefs.doctorName);

      const selection = selectDailyExercises({ today, recentExposures, accuracyRecords });
      const context = { prompt, memberCount: members.length, doctorName: prefs.doctorName };

      const resolved = [...selection.memory];
      resolved.forEach((type, index) => {
        if (hasContentFor(type, context)) return;
        const fallback = ALWAYS_AVAILABLE_TYPES.find((t) => !resolved.includes(t));
        if (fallback) resolved[index] = fallback;
      });

      setTypes(resolved);
    })();
  }, []);

  if (!types) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderQuestion = (
    type: MemoryExerciseType,
    onSubmit: (isCorrect: boolean, correctAnswerLabel?: string) => void
  ) => {
    switch (type) {
      case 'today_breakfast_recall':
        return (
          <QuizQuestionCard
            question={generateBreakfastQuestion(memoryPrompt?.breakfast ?? '', Math.random)}
            onSubmit={onSubmit}
          />
        );
      case 'yesterday_event_quiz':
        return (
          <QuizQuestionCard
            question={generateYesterdayEventQuestion(memoryPrompt?.yesterdayEvent ?? '', Math.random)}
            onSubmit={onSubmit}
          />
        );
      case 'medical_staff_recall':
        return (
          <QuizQuestionCard
            question={generateMedicalStaffQuestion(doctorName, Math.random)}
            onSubmit={onSubmit}
          />
        );
      case 'family_photo_naming': {
        const member = familyMembers[Math.floor(Math.random() * familyMembers.length)];
        return (
          <FamilyPhotoQuizCard member={member} otherMembers={familyMembers} onSubmit={onSubmit} />
        );
      }
      case 'short_term_word_recall':
        return <WordRecallBoard onSubmit={onSubmit} />;
      case 'photo_sequence_ordering':
        return (
          <TapSequenceBoard
            title="하루 일과 순서대로 눌러주세요"
            items={PHOTO_SEQUENCE_ITEMS}
            onSubmit={onSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <TrainingSessionRunner
      types={types}
      renderQuestion={renderQuestion}
      onEachResult={(type, isCorrect) => {
        void recordExerciseResult(type, 'memory', isCorrect).then(() => {
          void syncExerciseAccuracySummary();
        });
      }}
      completionTitle="오늘의 기억력훈련을 마쳤어요"
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
