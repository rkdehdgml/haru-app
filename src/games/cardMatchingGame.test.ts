import { createShuffledDeck, evaluateCardMatchingResult } from './cardMatchingGame';

function createSeededRandom(seed: number): () => number {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('createShuffledDeck', () => {
  it('심볼마다 카드를 정확히 2장씩 만든다', () => {
    const deck = createShuffledDeck(['🍎', '🐶', '🌼'], createSeededRandom(1));
    expect(deck).toHaveLength(6);

    const counts = new Map<string, number>();
    deck.forEach((card) => counts.set(card.symbol, (counts.get(card.symbol) ?? 0) + 1));
    expect(counts.get('🍎')).toBe(2);
    expect(counts.get('🐶')).toBe(2);
    expect(counts.get('🌼')).toBe(2);
  });

  it('카드 id는 모두 고유하다', () => {
    const deck = createShuffledDeck(['🍎', '🐶', '🌼'], createSeededRandom(2));
    expect(new Set(deck.map((c) => c.id)).size).toBe(deck.length);
  });
});

describe('evaluateCardMatchingResult', () => {
  it('실수 횟수가 짝 개수 이하이면 정답으로 인정한다', () => {
    expect(evaluateCardMatchingResult(0, 3)).toBe(true);
    expect(evaluateCardMatchingResult(3, 3)).toBe(true);
  });

  it('실수 횟수가 짝 개수를 넘으면 오답으로 본다', () => {
    expect(evaluateCardMatchingResult(4, 3)).toBe(false);
  });
});
