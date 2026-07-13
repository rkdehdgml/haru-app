import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from './BigButton';

export interface AnswerRevealCardProps {
  isCorrect: boolean;
  correctAnswerLabel?: string;
  onNext: () => void;
}

/** 맞았는지 틀렸는지 분명히 보여주고, 틀렸을 때는 정답을 함께 알려준다. */
export function AnswerRevealCard({ isCorrect, correctAnswerLabel, onNext }: AnswerRevealCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{isCorrect ? '✅' : '❌'}</Text>
      <Text style={styles.message}>{isCorrect ? '정답이에요!' : '틀렸어요'}</Text>
      {!isCorrect && (
        <Text style={styles.correctAnswer}>
          {correctAnswerLabel ? `정답은 "${correctAnswerLabel}"예요` : '정답을 확인했어요'}
        </Text>
      )}
      <BigButton label="다음 문제" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  correctAnswer: {
    fontSize: 16,
    color: '#455A64',
    textAlign: 'center',
    marginBottom: 32,
  },
});
