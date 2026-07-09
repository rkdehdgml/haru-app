import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '../BigButton';
import { createWordRecallRound, evaluateWordRecall } from '../../games/wordRecallGame';

const WORD_POOL = ['사과', '바나나', '우산', '시계', '안경', '모자', '신발', '컵'];
const SHOW_DURATION_MS = 3000;

export interface WordRecallBoardProps {
  onSubmit: (isCorrect: boolean) => void;
}

/** 단어 몇 개를 잠깐 보여준 뒤, 봤던 단어만 골라내는 단기기억 게임. */
export function WordRecallBoard({ onSubmit }: WordRecallBoardProps) {
  const [round] = useState(() => createWordRecallRound(WORD_POOL, 3, 3, Math.random));
  const [phase, setPhase] = useState<'showing' | 'choosing'>('showing');
  const [selected, setSelected] = useState<string[]>([]);
  const submittedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('choosing'), SHOW_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  const toggle = (word: string) => {
    setSelected((prev) => (prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]));
  };

  const handleConfirm = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(evaluateWordRecall(selected, round.shown));
  };

  if (phase === 'showing') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>잘 기억해두세요</Text>
        <View style={styles.wordList}>
          {round.shown.map((word) => (
            <Text key={word} style={styles.wordText}>
              {word}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>방금 본 단어를 모두 골라주세요</Text>
      <View style={styles.chipGrid}>
        {round.choices.map((word) => {
          const isSelected = selected.includes(word);
          return (
            <Pressable
              key={word}
              accessibilityRole="button"
              onPress={() => toggle(word)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{word}</Text>
            </Pressable>
          );
        })}
      </View>
      <BigButton label="확인" onPress={handleConfirm} disabled={selected.length === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  wordList: {
    alignItems: 'center',
    gap: 16,
  },
  wordText: {
    fontSize: 32,
    fontWeight: '700',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  chip: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#F5F7F8',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  chipText: {
    fontSize: 18,
    color: '#1B1B1B',
  },
  chipTextSelected: {
    color: '#2E7D32',
    fontWeight: '700',
  },
});
