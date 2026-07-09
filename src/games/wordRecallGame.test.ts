import { createWordRecallRound, evaluateWordRecall } from './wordRecallGame';

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

const WORD_POOL = ['사과', '바나나', '우산', '시계', '안경', '모자', '신발', '컵'];

describe('createWordRecallRound', () => {
  it('shown과 distractor 개수를 정확히 지키고, choices는 그 합집합이다', () => {
    const round = createWordRecallRound(WORD_POOL, 3, 3, createSeededRandom(1));

    expect(round.shown).toHaveLength(3);
    expect(round.choices).toHaveLength(6);
    round.shown.forEach((word) => expect(round.choices).toContain(word));
    expect(new Set(round.shown).size).toBe(3);
    expect(new Set(round.choices).size).toBe(6);
  });
});

describe('evaluateWordRecall', () => {
  const shown = ['사과', '바나나', '우산'];

  it('전부 정확히 골랐으면 true', () => {
    expect(evaluateWordRecall(['사과', '바나나', '우산'], shown)).toBe(true);
  });

  it('하나 놓쳐도(정답 2개, 오답 0개) 관대하게 true', () => {
    expect(evaluateWordRecall(['사과', '바나나'], shown)).toBe(true);
  });

  it('오답을 2개 이상 고르면 false', () => {
    expect(evaluateWordRecall(['사과', '시계', '안경'], shown)).toBe(false);
  });

  it('아무것도 고르지 않으면 false', () => {
    expect(evaluateWordRecall([], shown)).toBe(false);
  });
});
