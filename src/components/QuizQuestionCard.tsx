import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BigButton } from './BigButton';
import type { MultipleChoiceQuestion } from '../types/quiz';

export interface QuizQuestionCardProps {
  question: MultipleChoiceQuestion;
  onSubmit: (isCorrect: boolean, correctAnswerLabel: string) => void;
}

/**
 * 문제 유형 대부분이 재사용하는 공통 4지선다 UI (문항에 따라 2~4개 보기).
 * 보기를 탭하면 선택되고(같은 보기를 다시 탭하면 선택 해제), "확인"을 눌러야 제출된다 —
 * 실수로 잘못 누른 보기를 바로잡을 여지를 준다.
 */
export function QuizQuestionCard({ question, onSubmit }: QuizQuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const correctLabel = question.choices[question.correctIndex];

  const toggleChoice = (index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  const handleConfirm = () => {
    if (selectedIndex === null) return;
    onSubmit(selectedIndex === question.correctIndex, correctLabel);
  };

  return (
    <View style={styles.container}>
      {question.imageUri && (
        <Image source={{ uri: question.imageUri }} style={styles.image} resizeMode="cover" />
      )}
      <Text style={styles.prompt}>{question.prompt}</Text>
      <View style={styles.choices}>
        {question.choices.map((choice, index) => (
          <BigButton
            key={choice}
            label={choice}
            variant={selectedIndex === index ? 'primary' : 'secondary'}
            onPress={() => toggleChoice(index)}
          />
        ))}
      </View>
      <BigButton
        label="확인"
        onPress={handleConfirm}
        disabled={selectedIndex === null}
        style={styles.confirmButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  prompt: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  choices: {
    gap: 16,
  },
  confirmButton: {
    marginTop: 24,
  },
});
