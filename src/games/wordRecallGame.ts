import { shuffleItems } from './tapSequenceGame';

export interface WordRecallRound {
  shown: string[];
  choices: string[];
}

/** wordPool에서 showCount개는 "잠깐 보여줄 단어", distractorCount개는 오답 보기로 뽑는다. */
export function createWordRecallRound(
  wordPool: readonly string[],
  showCount: number,
  distractorCount: number,
  random: () => number
): WordRecallRound {
  const shuffledPool = shuffleItems(wordPool, random);
  const shown = shuffledPool.slice(0, showCount);
  const distractors = shuffledPool.slice(showCount, showCount + distractorCount);
  const choices = shuffleItems([...shown, ...distractors], random);
  return { shown, choices };
}

/**
 * 완벽하게 다 맞히지 못해도(하나 정도 놓쳐도) 정답으로 인정하는 관대한 기준.
 * 오답을 여러 개 고르면 그때는 오답으로 처리한다.
 */
export function evaluateWordRecall(selected: readonly string[], shown: readonly string[]): boolean {
  const correctSelected = selected.filter((word) => shown.includes(word)).length;
  const wrongSelected = selected.length - correctSelected;
  return correctSelected >= shown.length - 1 && wrongSelected <= 1;
}
