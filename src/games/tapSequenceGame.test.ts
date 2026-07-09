import { evaluateTapSequence, shuffleItems } from './tapSequenceGame';

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

describe('evaluateTapSequence', () => {
  it('순서가 완전히 일치하면 true', () => {
    expect(evaluateTapSequence(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
  });

  it('순서가 다르면 false', () => {
    expect(evaluateTapSequence(['b', 'a', 'c'], ['a', 'b', 'c'])).toBe(false);
  });

  it('길이가 다르면 false', () => {
    expect(evaluateTapSequence(['a', 'b'], ['a', 'b', 'c'])).toBe(false);
  });
});

describe('shuffleItems', () => {
  it('원소 구성은 그대로 유지한 채 순서만 섞는다', () => {
    const original = ['a', 'b', 'c', 'd', 'e'];
    const shuffled = shuffleItems(original, createSeededRandom(1));

    expect(shuffled).toHaveLength(original.length);
    expect(new Set(shuffled)).toEqual(new Set(original));
  });

  it('원본 배열을 변형하지 않는다', () => {
    const original = ['a', 'b', 'c'];
    shuffleItems(original, createSeededRandom(2));
    expect(original).toEqual(['a', 'b', 'c']);
  });
});
