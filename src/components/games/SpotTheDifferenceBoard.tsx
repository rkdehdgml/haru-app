import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  buildGridSymbols,
  createRound,
  evaluateSpotTheDifference,
} from '../../games/spotTheDifferenceGame';
import { vibrateTap } from '../../services/haptics';

const BASE_SYMBOL = '🍎';
const DIFFERING_SYMBOL = '🍌';
const GRID_SIZE = 9;

export interface SpotTheDifferenceBoardProps {
  onSubmit: (isCorrect: boolean) => void;
}

/** 똑같아 보이는 칸들 중 하나만 다른 그림을 탭 한 번으로 찾는 게임. */
export function SpotTheDifferenceBoard({ onSubmit }: SpotTheDifferenceBoardProps) {
  const [round] = useState(() => createRound(BASE_SYMBOL, DIFFERING_SYMBOL, GRID_SIZE, Math.random));
  const grid = useMemo(() => buildGridSymbols(round), [round]);
  const submittedRef = useRef(false);

  const handleTap = (index: number) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    void vibrateTap();
    onSubmit(evaluateSpotTheDifference(index, round));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>다른 그림 하나를 찾아 눌러주세요</Text>
      <View style={styles.grid}>
        {grid.map((symbol, index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            onPress={() => handleTap(index)}
            style={styles.cell}
          >
            <Text style={styles.cellSymbol}>{symbol}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 260,
    gap: 8,
  },
  cell: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: '#F5F7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSymbol: {
    fontSize: 36,
  },
});
