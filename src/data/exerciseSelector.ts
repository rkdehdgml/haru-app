import type {
  CognitiveExerciseType,
  DailyExerciseSelection,
  ExerciseAccuracyRecord,
  ExerciseType,
  MemoryExerciseType,
} from '../types/exercise';

export const ALL_COGNITIVE_TYPES: readonly CognitiveExerciseType[] = [
  'date_weekday_season',
  'am_pm',
  'location',
  'card_matching',
  'ordered_tap',
  'spot_the_difference',
];

export const ALL_MEMORY_TYPES: readonly MemoryExerciseType[] = [
  'today_breakfast_recall',
  'yesterday_event_quiz',
  'family_photo_naming',
  'medical_staff_recall',
  'short_term_word_recall',
  'photo_sequence_ordering',
];

/**
 * "같은 날 연속으로 어려운 유형만 나오지 않도록" 규칙을 적용하기 위한 난이도 분류.
 * 인지 부하가 낮은 인지/재인 위주 문제를 easy로, 순서·회상·세밀한 주의력이 필요한
 * 문제를 hard로 분류했다. 실제 난이도는 환자 반응을 보며 조정될 수 있다.
 */
export const EXERCISE_DIFFICULTY: Record<ExerciseType, 'easy' | 'hard'> = {
  date_weekday_season: 'easy',
  am_pm: 'easy',
  location: 'easy',
  card_matching: 'hard',
  ordered_tap: 'hard',
  spot_the_difference: 'hard',
  today_breakfast_recall: 'easy',
  yesterday_event_quiz: 'hard',
  family_photo_naming: 'easy',
  medical_staff_recall: 'hard',
  short_term_word_recall: 'hard',
  photo_sequence_ordering: 'hard',
};

/** 최근 이 기간(일) 안에 나왔던 유형은 오늘 뽑기에서 제외한다. */
const RECENT_EXCLUSION_DAYS = 3;
/** 정답률 기록이 없는 유형에 부여하는 기본 정답률 (너무 자주도, 너무 적게도 뽑히지 않도록 중립값) */
const NEUTRAL_ACCURACY = 0.5;
/** 정답률이 100%여도 가중치가 0이 되지 않도록 하는 최소값 */
const MIN_WEIGHT = 0.1;

/** 특정 날짜에 노출됐던 문제 유형 이력 (최근 제외 규칙에 사용) */
export interface ExerciseExposureRecord {
  date: string; // ISO 날짜 (YYYY-MM-DD)
  types: ExerciseType[];
}

export interface SelectDailyExercisesParams {
  today: string; // ISO 날짜 (YYYY-MM-DD)
  recentExposures: ExerciseExposureRecord[];
  accuracyRecords: ExerciseAccuracyRecord[];
  /** 테스트에서 결과를 재현하기 위한 난수 함수 주입 (기본값 Math.random) */
  random?: () => number;
}

export interface ReselectExerciseParams {
  currentSelection: DailyExerciseSelection;
  targetType: ExerciseType; // "다른 문제로 바꿔주세요" 대상 유형
  today: string;
  recentExposures: ExerciseExposureRecord[];
  accuracyRecords: ExerciseAccuracyRecord[];
  random?: () => number;
}

function accuracyOf(type: ExerciseType, accuracyRecords: ExerciseAccuracyRecord[]): number {
  const record = accuracyRecords.find((r) => r.type === type);
  if (!record || record.totalCount === 0) return NEUTRAL_ACCURACY;
  return record.correctCount / record.totalCount;
}

/** 정답률이 낮을수록 가중치가 커진다. */
function weightOf(type: ExerciseType, accuracyRecords: ExerciseAccuracyRecord[]): number {
  const accuracy = accuracyOf(type, accuracyRecords);
  return 1 - accuracy + MIN_WEIGHT;
}

function daysBetween(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T00:00:00`).getTime();
  const to = new Date(`${toDate}T00:00:00`).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

function isRecentlyUsed(
  type: ExerciseType,
  today: string,
  recentExposures: ExerciseExposureRecord[]
): boolean {
  return recentExposures.some((exposure) => {
    if (!exposure.types.includes(type)) return false;
    const diff = daysBetween(exposure.date, today);
    return diff >= 1 && diff <= RECENT_EXCLUSION_DAYS;
  });
}

interface WeightedCandidate<T> {
  item: T;
  weight: number;
}

/** 가중치 기반 비복원 추출. count가 후보 수보다 많으면 있는 만큼만 뽑는다. */
function weightedSampleWithoutReplacement<T>(
  candidates: WeightedCandidate<T>[],
  count: number,
  random: () => number
): T[] {
  const remaining = [...candidates];
  const picked: T[] = [];

  for (let i = 0; i < count && remaining.length > 0; i += 1) {
    const totalWeight = remaining.reduce((sum, c) => sum + c.weight, 0);
    let r = random() * totalWeight;
    let index = remaining.length - 1;
    for (let j = 0; j < remaining.length; j += 1) {
      r -= remaining[j].weight;
      if (r <= 0) {
        index = j;
        break;
      }
    }
    picked.push(remaining[index].item);
    remaining.splice(index, 1);
  }

  return picked;
}

/**
 * 한 카테고리(인지/기억력)에서 count개를 규칙에 따라 뽑는다.
 * 1순위: 최근 노출되지 않은 유형 중에서 정답률 가중치로 추출.
 * 후보가 count보다 적으면, 부족한 만큼만 최근 노출된 유형 중에서 마저 채운다.
 */
function pickCategory<T extends ExerciseType>(
  allTypes: readonly T[],
  count: number,
  today: string,
  recentExposures: ExerciseExposureRecord[],
  accuracyRecords: ExerciseAccuracyRecord[],
  random: () => number
): T[] {
  const notRecent = allTypes.filter((t) => !isRecentlyUsed(t, today, recentExposures));

  const primary = weightedSampleWithoutReplacement(
    notRecent.map((item) => ({ item, weight: weightOf(item, accuracyRecords) })),
    Math.min(count, notRecent.length),
    random
  );

  if (primary.length >= count) {
    return primary;
  }

  const fallbackPool = allTypes.filter((t) => !primary.includes(t));
  const fallback = weightedSampleWithoutReplacement(
    fallbackPool.map((item) => ({ item, weight: weightOf(item, accuracyRecords) })),
    count - primary.length,
    random
  );

  return [...primary, ...fallback];
}

/**
 * 선택된 4개 중 쉬운 유형이 하나도 없으면, 마지막으로 뽑힌 항목 하나를
 * 쉬운 유형으로 교체한다. 최근 노출되지 않은 쉬운 유형을 우선하되,
 * 그런 유형이 전혀 없을 때만(예: 쉬운 유형이 전부 최근 노출) 노출 이력을 무시하고 채운다.
 */
function ensureEasyTypeIncluded(
  selection: DailyExerciseSelection,
  params: SelectDailyExercisesParams,
  random: () => number
): DailyExerciseSelection {
  const allSelected: ExerciseType[] = [...selection.cognitive, ...selection.memory];
  if (allSelected.some((t) => EXERCISE_DIFFICULTY[t] === 'easy')) {
    return selection;
  }

  const swapOptionsFor = <T extends ExerciseType>(selected: T[], allTypes: readonly T[]) => {
    const isEasyAndUnselected = (t: T) => EXERCISE_DIFFICULTY[t] === 'easy' && !selected.includes(t);
    return {
      notRecentEasy: allTypes.filter(
        (t) => isEasyAndUnselected(t) && !isRecentlyUsed(t, params.today, params.recentExposures)
      ),
      anyEasy: allTypes.filter(isEasyAndUnselected),
    };
  };

  const pickReplacement = <T extends ExerciseType>(candidates: T[]): T => {
    const [replacement] = weightedSampleWithoutReplacement(
      candidates.map((item) => ({ item, weight: weightOf(item, params.accuracyRecords) })),
      1,
      random
    );
    return replacement;
  };

  const applySwap = <T extends ExerciseType>(selected: T[], replacement: T): T[] => {
    const next = [...selected];
    next[next.length - 1] = replacement;
    return next;
  };

  const cognitiveOptions = swapOptionsFor(selection.cognitive, ALL_COGNITIVE_TYPES);
  const memoryOptions = swapOptionsFor(selection.memory, ALL_MEMORY_TYPES);

  // 1순위: 최근 노출 규칙을 침범하지 않고 바꿀 수 있는 카테고리를 우선한다 (카테고리 우선순위는 인지 → 기억력).
  if (cognitiveOptions.notRecentEasy.length > 0) {
    return {
      cognitive: applySwap(selection.cognitive, pickReplacement(cognitiveOptions.notRecentEasy)),
      memory: selection.memory,
    };
  }
  if (memoryOptions.notRecentEasy.length > 0) {
    return {
      cognitive: selection.cognitive,
      memory: applySwap(selection.memory, pickReplacement(memoryOptions.notRecentEasy)),
    };
  }

  // 2순위: 그런 후보가 정말 없으면 최근 노출 이력을 무시하고서라도 쉬운 유형을 채운다.
  if (cognitiveOptions.anyEasy.length > 0) {
    return {
      cognitive: applySwap(selection.cognitive, pickReplacement(cognitiveOptions.anyEasy)),
      memory: selection.memory,
    };
  }
  if (memoryOptions.anyEasy.length > 0) {
    return {
      cognitive: selection.cognitive,
      memory: applySwap(selection.memory, pickReplacement(memoryOptions.anyEasy)),
    };
  }

  // 쉬운 유형 후보가 정말 하나도 없는 극단적인 경우 (문제은행이 아주 작을 때) 그대로 반환.
  return selection;
}

/**
 * 오늘의 인지훈련 2개 + 기억력훈련 2개를 규칙 있는 랜덤으로 선택한다.
 * - 최근 2~3일 안에 나왔던 유형은 우선 제외
 * - 정답률이 낮은 유형일수록 가중치를 높여 약한 영역을 보강
 * - 선택된 4개 중 쉬운 유형이 하나도 없으면 최소 1개로 보정
 */
export function selectDailyExercises(params: SelectDailyExercisesParams): DailyExerciseSelection {
  const random = params.random ?? Math.random;

  const cognitive = pickCategory(
    ALL_COGNITIVE_TYPES,
    2,
    params.today,
    params.recentExposures,
    params.accuracyRecords,
    random
  );
  const memory = pickCategory(
    ALL_MEMORY_TYPES,
    2,
    params.today,
    params.recentExposures,
    params.accuracyRecords,
    random
  );

  return ensureEasyTypeIncluded({ cognitive, memory }, params, random);
}

/**
 * "다른 문제로 바꿔주세요" 요청 시 targetType 하나만 같은 카테고리 안에서 재선택한다.
 * 최근 노출되지 않고 현재 선택되지 않은 유형을 우선하며, 없으면 노출 이력을 무시하고 고른다.
 * 바꿀 다른 유형이 정말 없으면 원래 유형을 그대로 반환한다.
 */
export function reselectExercise(params: ReselectExerciseParams): ExerciseType {
  const random = params.random ?? Math.random;
  const { currentSelection, targetType } = params;

  const isCognitive = (ALL_COGNITIVE_TYPES as readonly ExerciseType[]).includes(targetType);
  const allTypes: readonly ExerciseType[] = isCognitive ? ALL_COGNITIVE_TYPES : ALL_MEMORY_TYPES;
  const currentlySelected: readonly ExerciseType[] = isCognitive
    ? currentSelection.cognitive
    : currentSelection.memory;

  const isSelectable = (t: ExerciseType) => t !== targetType && !currentlySelected.includes(t);
  const notRecent = allTypes.filter(
    (t) => isSelectable(t) && !isRecentlyUsed(t, params.today, params.recentExposures)
  );
  const pool = notRecent.length > 0 ? notRecent : allTypes.filter(isSelectable);

  if (pool.length === 0) {
    return targetType;
  }

  const [replacement] = weightedSampleWithoutReplacement(
    pool.map((item) => ({ item, weight: weightOf(item, params.accuracyRecords) })),
    1,
    random
  );
  return replacement;
}
