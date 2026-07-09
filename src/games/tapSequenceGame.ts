/**
 * "정해진 순서대로 눌러주세요" 계열 게임의 공용 로직.
 * 색깔/모양 순서 터치(인지훈련)와 사진(하루 일과) 순서 배열(기억력훈련)이 이 로직을 공유한다.
 * 손 힘이 약한 환자를 위해 드래그가 아니라 "탭한 순서 = 답"으로 구성한다.
 */
export function evaluateTapSequence(userOrder: readonly string[], correctOrder: readonly string[]): boolean {
  if (userOrder.length !== correctOrder.length) return false;
  return userOrder.every((id, index) => id === correctOrder[index]);
}

/** Fisher-Yates 셔플. random을 주입받아 테스트에서 재현 가능하게 한다. */
export function shuffleItems<T>(items: readonly T[], random: () => number): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
