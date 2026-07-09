import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  createShuffledDeck,
  evaluateCardMatchingResult,
  type CardMatchingCard,
} from '../../games/cardMatchingGame';
import { vibrateTap } from '../../services/haptics';

const PAIR_SYMBOLS = ['🍎', '🐶', '🌼'];
const FLIP_BACK_DELAY_MS = 700;

export interface CardMatchingBoardProps {
  onSubmit: (isCorrect: boolean) => void;
}

/** 같은 그림 두 장을 탭 한 번씩으로 찾는 카드 매칭 게임. 드래그/롱프레스는 쓰지 않는다. */
export function CardMatchingBoard({ onSubmit }: CardMatchingBoardProps) {
  const [deck] = useState<CardMatchingCard[]>(() => createShuffledDeck(PAIR_SYMBOLS, Math.random));
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedSymbols, setMatchedSymbols] = useState<Set<string>>(new Set());
  const [mismatchCount, setMismatchCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (matchedSymbols.size === PAIR_SYMBOLS.length && !submittedRef.current) {
      submittedRef.current = true;
      onSubmit(evaluateCardMatchingResult(mismatchCount, PAIR_SYMBOLS.length));
    }
  }, [matchedSymbols, mismatchCount, onSubmit]);

  const handleTap = (card: CardMatchingCard) => {
    if (busy || matchedSymbols.has(card.symbol) || flippedIds.includes(card.id)) return;
    void vibrateTap();

    if (flippedIds.length === 0) {
      setFlippedIds([card.id]);
      return;
    }

    const firstCard = deck.find((c) => c.id === flippedIds[0]);
    setFlippedIds([flippedIds[0], card.id]);
    setBusy(true);

    setTimeout(() => {
      if (firstCard && firstCard.symbol === card.symbol) {
        setMatchedSymbols((prev) => new Set(prev).add(card.symbol));
      } else {
        setMismatchCount((count) => count + 1);
      }
      setFlippedIds([]);
      setBusy(false);
    }, FLIP_BACK_DELAY_MS);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>같은 그림 두 장을 찾아 눌러주세요</Text>
      <View style={styles.grid}>
        {deck.map((card) => {
          const isFaceUp = flippedIds.includes(card.id) || matchedSymbols.has(card.symbol);
          return (
            <Pressable
              key={card.id}
              accessibilityRole="button"
              accessibilityLabel={isFaceUp ? card.symbol : '뒤집힌 카드'}
              onPress={() => handleTap(card)}
              style={[styles.card, isFaceUp && styles.cardFaceUp]}
            >
              <Text style={styles.cardSymbol}>{isFaceUp ? card.symbol : '❔'}</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: 260,
  },
  card: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#CFD8DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFaceUp: {
    backgroundColor: '#E8F5E9',
  },
  cardSymbol: {
    fontSize: 32,
  },
});
