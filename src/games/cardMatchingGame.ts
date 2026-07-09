import { shuffleItems } from './tapSequenceGame';

export interface CardMatchingCard {
  id: string;
  symbol: string;
}

/** pairSymbols 각각을 두 장씩 만들어 섞은 카드 덱을 만든다. */
export function createShuffledDeck(
  pairSymbols: readonly string[],
  random: () => number
): CardMatchingCard[] {
  const cards: CardMatchingCard[] = pairSymbols.flatMap((symbol, pairIndex) => [
    { id: `${pairIndex}-a`, symbol },
    { id: `${pairIndex}-b`, symbol },
  ]);
  return shuffleItems(cards, random);
}

/**
 * 완벽하게 기억하지 못해도, 틀린 시도가 짝 개수를 넘지 않으면 정답으로 인정하는
 * 관대한 기준 (인지저하 환자에게 지나치게 엄격한 기준을 적용하지 않기 위함).
 */
export function evaluateCardMatchingResult(mismatchCount: number, pairCount: number): boolean {
  return mismatchCount <= pairCount;
}
