import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BigButton } from './BigButton';
import type { MultipleChoiceQuestion } from '../types/quiz';

export interface QuizQuestionCardProps {
  question: MultipleChoiceQuestion;
  onSubmit: (isCorrect: boolean, correctAnswerLabel: string) => void;
}

/** 문제 유형 대부분이 재사용하는 공통 4지선다 UI (문항에 따라 2~4개 보기). */
export function QuizQuestionCard({ question, onSubmit }: QuizQuestionCardProps) {
  const correctLabel = question.choices[question.correctIndex];

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
            variant="secondary"
            onPress={() => onSubmit(index === question.correctIndex, correctLabel)}
          />
        ))}
      </View>
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
});
