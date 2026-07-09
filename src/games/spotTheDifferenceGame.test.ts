import { buildGridSymbols, createRound, evaluateSpotTheDifference } from './spotTheDifferenceGame';

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

describe('createRound', () => {
  it('differingIndex가 항상 그리드 범위 안에 있다', () => {
    const random = createSeededRandom(3);
    for (let i = 0; i < 50; i += 1) {
      const round = createRound('🍎', '🍌', 9, random);
      expect(round.differingIndex).toBeGreaterThanOrEqual(0);
      expect(round.differingIndex).toBeLessThan(9);
    }
  });
});

describe('buildGridSymbols', () => {
  it('differingIndex 칸만 다른 심볼이고 나머지는 동일하다', () => {
    const round = { baseSymbol: '🍎', differingSymbol: '🍌', differingIndex: 4, gridSize: 9 };
    const grid = buildGridSymbols(round);

    expect(grid).toHaveLength(9);
    grid.forEach((symbol, index) => {
      if (index === 4) {
        expect(symbol).toBe('🍌');
      } else {
        expect(symbol).toBe('🍎');
      }
    });
  });
});

describe('evaluateSpotTheDifference', () => {
  const round = { baseSymbol: '🍎', differingSymbol: '🍌', differingIndex: 4, gridSize: 9 };

  it('다른 칸을 정확히 탭하면 true', () => {
    expect(evaluateSpotTheDifference(4, round)).toBe(true);
  });

  it('다른 칸을 탭하지 않으면 false', () => {
    expect(evaluateSpotTheDifference(0, round)).toBe(false);
  });
});
