import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { AnswerRevealCard } from './AnswerRevealCard';
import { BigButton } from './BigButton';

export interface TrainingSessionRunnerProps<T extends string> {
  types: T[];
  renderQuestion: (
    type: T,
    onSubmit: (isCorrect: boolean, correctAnswerLabel?: string) => void
  ) => React.ReactNode;
  onEachResult: (type: T, isCorrect: boolean) => void;
  completionTitle: string;
}

type Phase = 'question' | 'reveal' | 'complete';

/**
 * CognitiveTraining/MemoryTraining 화면이 공유하는 훈련 세션 진행 로직.
 * 문제 하나 풀기 → (오답이어도 부정적 피드백 없이) 정답 공개 → "다음 문제" 탭 → 반복,
 * 다 끝나면 정답 개수만 담백하게 보여주는 완료 화면으로 넘어간다.
 */
export function TrainingSessionRunner<T extends string>({
  types,
  renderQuestion,
  onEachResult,
  completionTitle,
}: TrainingSessionRunnerProps<T>) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(types.length > 0 ? 'question' : 'complete');
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    correctAnswerLabel?: string;
  } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSubmit = useCallback(
    (isCorrect: boolean, correctAnswerLabel?: string) => {
      onEachResult(types[index], isCorrect);
      if (isCorrect) setCorrectCount((count) => count + 1);
      setLastResult({ isCorrect, correctAnswerLabel });
      setPhase('reveal');
    },
    [index, onEachResult, types]
  );

  const handleNext = useCallback(() => {
    const nextIndex = index + 1;
    if (nextIndex >= types.length) {
      setPhase('complete');
    } else {
      setIndex(nextIndex);
      setPhase('question');
    }
  }, [index, types.length]);

  if (phase === 'complete') {
    return (
      <View style={styles.container}>
        <Text style={styles.completeIcon}>🎉</Text>
        <Text style={styles.completeTitle}>{completionTitle}</Text>
        <Text style={styles.completeSubtitle}>
          {types.length}문제 중 {correctCount}문제를 맞혔어요
        </Text>
        <BigButton
          label="홈으로"
          variant="secondary"
          onPress={() => navigation.popToTop()}
          style={styles.homeButton}
        />
      </View>
    );
  }

  if (phase === 'reveal' && lastResult) {
    return (
      <View style={styles.container}>
        <AnswerRevealCard
          isCorrect={lastResult.isCorrect}
          correctAnswerLabel={lastResult.correctAnswerLabel}
          onNext={handleNext}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.progress}>
        {index + 1} / {types.length}
      </Text>
      {renderQuestion(types[index], handleSubmit)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  progress: {
    fontSize: 14,
    color: '#78909C',
    marginBottom: 16,
  },
  completeIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  completeTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 18,
    color: '#455A64',
    textAlign: 'center',
  },
  homeButton: {
    marginTop: 32,
    minWidth: 160,
  },
});
