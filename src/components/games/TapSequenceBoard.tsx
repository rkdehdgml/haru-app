import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { evaluateTapSequence, shuffleItems } from '../../games/tapSequenceGame';
import { vibrateTap } from '../../services/haptics';

export interface TapSequenceItem {
  id: string;
  label: string;
  icon: string;
}

export interface TapSequenceBoardProps {
  title: string;
  /** 정답 순서대로 나열된 항목 목록 (화면에는 섞어서 보여준다) */
  items: TapSequenceItem[];
  onSubmit: (isCorrect: boolean) => void;
}

/**
 * "정해진 순서대로 눌러주세요" 계열의 공용 보드.
 * 색깔/모양 순서 터치(인지훈련)와 사진(하루 일과) 순서 배열(기억력훈련)이 공유한다.
 * 손 힘이 약한 환자를 위해 드래그 대신 "탭한 순서 = 답"으로 구성한다.
 */
export function TapSequenceBoard({ title, items, onSubmit }: TapSequenceBoardProps) {
  const correctOrder = useMemo(() => items.map((item) => item.id), [items]);
  const [shuffled] = useState(() => shuffleItems(items, Math.random));
  const [tappedOrder, setTappedOrder] = useState<string[]>([]);
  const submittedRef = useRef(false);

  const handleTap = (item: TapSequenceItem) => {
    if (submittedRef.current || tappedOrder.includes(item.id)) return;
    void vibrateTap();
    const next = [...tappedOrder, item.id];
    setTappedOrder(next);

    if (next.length === items.length) {
      submittedRef.current = true;
      onSubmit(evaluateTapSequence(next, correctOrder));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.orderHint}>{items.map((item) => item.label).join(' → ')} 순서로 눌러주세요</Text>
      <View style={styles.grid}>
        {shuffled.map((item) => {
          const tappedIndex = tappedOrder.indexOf(item.id);
          const isTapped = tappedIndex !== -1;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => handleTap(item)}
              style={[styles.tile, isTapped && styles.tileTapped]}
            >
              <Text style={styles.tileIcon}>{item.icon}</Text>
              <Text style={styles.tileLabel}>{item.label}</Text>
              {isTapped && <Text style={styles.orderBadge}>{tappedIndex + 1}</Text>}
            </Pressable>
          );
        })}
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
    marginBottom: 8,
    textAlign: 'center',
  },
  orderHint: {
    fontSize: 15,
    color: '#455A64',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  tile: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#F5F7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTapped: {
    backgroundColor: '#E8F5E9',
  },
  tileIcon: {
    fontSize: 32,
  },
  tileLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  orderBadge: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },
});
