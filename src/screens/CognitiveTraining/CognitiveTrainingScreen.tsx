import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { CardMatchingBoard } from '../../components/games/CardMatchingBoard';
import { SpotTheDifferenceBoard } from '../../components/games/SpotTheDifferenceBoard';
import { TapSequenceBoard, type TapSequenceItem } from '../../components/games/TapSequenceBoard';
import { QuizQuestionCard } from '../../components/QuizQuestionCard';
import { TrainingSessionRunner } from '../../components/TrainingSessionRunner';
import { selectDailyExercises } from '../../data/exerciseSelector';
import {
  generateAmPmQuestion,
  generateDateWeekdaySeasonQuestion,
  generateLocationQuestion,
} from '../../data/questionBank';
import { syncExerciseAccuracySummary } from '../../services/exerciseAccuracySync';
import { getCarePreferences } from '../../services/storage/carePreferencesStorage';
import {
  getAccuracyRecords,
  getRecentExposures,
  recordExerciseResult,
} from '../../services/storage/exerciseResultStorage';
import type { CognitiveExerciseType } from '../../types/exercise';

const ORDERED_TAP_ITEMS: TapSequenceItem[] = [
  { id: 'red', label: '빨강', icon: '🔴' },
  { id: 'yellow', label: '노랑', icon: '🟡' },
  { id: 'blue', label: '파랑', icon: '🔵' },
];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CognitiveTrainingScreen() {
  const [types, setTypes] = useState<CognitiveExerciseType[] | null>(null);
  const [hospitalName, setHospitalName] = useState('');

  useEffect(() => {
    void (async () => {
      const today = todayKey();
      const [recentExposures, accuracyRecords, prefs] = await Promise.all([
        getRecentExposures(3),
        getAccuracyRecords(),
        getCarePreferences(),
      ]);
      setHospitalName(prefs.hospitalName);
      const selection = selectDailyExercises({ today, recentExposures, accuracyRecords });
      setTypes(selection.cognitive);
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
    type: CognitiveExerciseType,
    onSubmit: (isCorrect: boolean, correctAnswerLabel?: string) => void
  ) => {
    switch (type) {
      case 'date_weekday_season':
        return (
          <QuizQuestionCard
            question={generateDateWeekdaySeasonQuestion(new Date(), Math.random)}
            onSubmit={onSubmit}
          />
        );
      case 'am_pm':
        return (
          <QuizQuestionCard question={generateAmPmQuestion(new Date(), Math.random)} onSubmit={onSubmit} />
        );
      case 'location':
        return (
          <QuizQuestionCard
            question={generateLocationQuestion(hospitalName, Math.random)}
            onSubmit={onSubmit}
          />
        );
      case 'card_matching':
        return <CardMatchingBoard onSubmit={onSubmit} />;
      case 'ordered_tap':
        return (
          <TapSequenceBoard
            title="색깔 순서를 기억해서 눌러주세요"
            items={ORDERED_TAP_ITEMS}
            onSubmit={onSubmit}
          />
        );
      case 'spot_the_difference':
        return <SpotTheDifferenceBoard onSubmit={onSubmit} />;
      default:
        return null;
    }
  };

  return (
    <TrainingSessionRunner
      types={types}
      renderQuestion={renderQuestion}
      onEachResult={(type, isCorrect) => {
        void recordExerciseResult(type, 'cognitive', isCorrect).then(() => {
          void syncExerciseAccuracySummary();
        });
      }}
      completionTitle="오늘의 인지훈련을 마쳤어요"
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
