export interface SpotTheDifferenceRound {
  baseSymbol: string;
  differingSymbol: string;
  differingIndex: number;
  gridSize: number;
}

/** gridSize개 칸 중 하나만 다른 심볼로 채워지는 라운드를 만든다. */
export function createRound(
  baseSymbol: string,
  differingSymbol: string,
  gridSize: number,
  random: () => number
): SpotTheDifferenceRound {
  const differingIndex = Math.floor(random() * gridSize);
  return { baseSymbol, differingSymbol, differingIndex, gridSize };
}

export function buildGridSymbols(round: SpotTheDifferenceRound): string[] {
  return Array.from({ length: round.gridSize }, (_, index) =>
    index === round.differingIndex ? round.differingSymbol : round.baseSymbol
  );
}

export function evaluateSpotTheDifference(tappedIndex: number, round: SpotTheDifferenceRound): boolean {
  return tappedIndex === round.differingIndex;
}
