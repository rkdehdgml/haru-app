import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigButton } from './BigButton';

export interface AnswerRevealCardProps {
  isCorrect: boolean;
  correctAnswerLabel?: string;
  onNext: () => void;
}

/**
 * 오답이어도 부정적 피드백 없이 정답만 담백하게 보여준다.
 * "틀렸어요" 같은 표현은 쓰지 않고, 맞았을 때만 살짝 격려하는 정도로만 표현한다.
 */
export function AnswerRevealCard({ isCorrect, correctAnswerLabel, onNext }: AnswerRevealCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{isCorrect ? '✅' : '💡'}</Text>
      <Text style={styles.message}>
        {isCorrect
          ? '정답이에요!'
          : correctAnswerLabel
            ? `정답은 "${correctAnswerLabel}"예요`
            : '정답을 확인했어요'}
      </Text>
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
    marginBottom: 32,
  },
});
