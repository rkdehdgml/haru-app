import {
  ALL_COGNITIVE_TYPES,
  ALL_MEMORY_TYPES,
  EXERCISE_DIFFICULTY,
  reselectExercise,
  selectDailyExercises,
  type ExerciseExposureRecord,
} from './exerciseSelector';
import type { ExerciseAccuracyRecord, ExerciseType } from '../types/exercise';

/** 시드 기반 PRNG (mulberry32) — 테스트를 매번 같은 결과로 재현하기 위해 사용. */
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

const TODAY = '2026-07-09';

describe('selectDailyExercises', () => {
  it('인지훈련 2개, 기억력훈련 2개를 정확히, 중복 없이 뽑는다', () => {
    const result = selectDailyExercises({
      today: TODAY,
      recentExposures: [],
      accuracyRecords: [],
      random: createSeededRandom(1),
    });

    expect(result.cognitive).toHaveLength(2);
    expect(result.memory).toHaveLength(2);
    expect(new Set(result.cognitive).size).toBe(2);
    expect(new Set(result.memory).size).toBe(2);
    result.cognitive.forEach((t) => expect(ALL_COGNITIVE_TYPES).toContain(t));
    result.memory.forEach((t) => expect(ALL_MEMORY_TYPES).toContain(t));
  });

  it('최근 2~3일 안에 나온 유형은 대안이 있으면 오늘 뽑기에서 제외한다', () => {
    // 인지훈련 6개 중 4개를 어제/그저께 노출시켜, 남은 2개만 뽑히도록 만든다.
    const recentExposures: ExerciseExposureRecord[] = [
      { date: '2026-07-08', types: ['date_weekday_season', 'am_pm'] },
      { date: '2026-07-07', types: ['location', 'card_matching'] },
    ];

    const result = selectDailyExercises({
      today: TODAY,
      recentExposures,
      accuracyRecords: [],
      random: createSeededRandom(42),
    });

    expect(new Set(result.cognitive)).toEqual(new Set(['ordered_tap', 'spot_the_difference']));
  });

  it('최근 제외 규칙을 적용하면 후보가 모자랄 때는 최근 노출 유형으로 채워서라도 개수를 맞춘다', () => {
    // 인지훈련 6개 중 5개가 최근 노출 → 남은 1개로는 count(2)를 못 채우므로 최근 노출분으로 보충해야 한다.
    const recentExposures: ExerciseExposureRecord[] = [
      {
        date: '2026-07-08',
        types: ['date_weekday_season', 'am_pm', 'location', 'card_matching', 'ordered_tap'],
      },
    ];

    const result = selectDailyExercises({
      today: TODAY,
      recentExposures,
      accuracyRecords: [],
      random: createSeededRandom(7),
    });

    expect(result.cognitive).toHaveLength(2);
    expect(result.cognitive).toContain('spot_the_difference');
  });

  it('정답률이 낮은 유형일수록 더 자주 뽑힌다 (가중치 검증)', () => {
    const accuracyRecords: ExerciseAccuracyRecord[] = [
      { type: 'card_matching', correctCount: 0, totalCount: 10 }, // 정답률 0% → 가중치 최고
      { type: 'date_weekday_season', correctCount: 10, totalCount: 10 }, // 정답률 100% → 가중치 최저
    ];

    let lowAccuracyCount = 0;
    let highAccuracyCount = 0;
    const trials = 400;
    const random = createSeededRandom(123);

    for (let i = 0; i < trials; i += 1) {
      const result = selectDailyExercises({
        today: TODAY,
        recentExposures: [],
        accuracyRecords,
        random,
      });
      if (result.cognitive.includes('card_matching')) lowAccuracyCount += 1;
      if (result.cognitive.includes('date_weekday_season')) highAccuracyCount += 1;
    }

    expect(lowAccuracyCount).toBeGreaterThan(highAccuracyCount * 2);
  });

  it('선택된 4개 중 쉬운 유형이 하나도 없으면 최소 1개로 보정한다', () => {
    // 쉬운 유형을 전부 "최근 노출"시켜서, 1차 선택이 어려운 유형으로만 채워지게 만든다.
    const easyTypes = (Object.keys(EXERCISE_DIFFICULTY) as ExerciseType[]).filter(
      (t) => EXERCISE_DIFFICULTY[t] === 'easy'
    );
    const recentExposures: ExerciseExposureRecord[] = [{ date: '2026-07-08', types: easyTypes }];

    const result = selectDailyExercises({
      today: TODAY,
      recentExposures,
      accuracyRecords: [],
      random: createSeededRandom(99),
    });

    const allSelected = [...result.cognitive, ...result.memory];
    const easyCount = allSelected.filter((t) => EXERCISE_DIFFICULTY[t] === 'easy').length;
    expect(easyCount).toBeGreaterThanOrEqual(1);
    // 카테고리별 개수 규칙은 보정 후에도 유지돼야 한다.
    expect(result.cognitive).toHaveLength(2);
    expect(result.memory).toHaveLength(2);
  });
});

describe('reselectExercise', () => {
  it('대상 유형만 같은 카테고리 안에서 다른 유형으로 바꾼다', () => {
    const currentSelection = {
      cognitive: ['date_weekday_season', 'am_pm'] as const,
      memory: ['today_breakfast_recall', 'family_photo_naming'] as const,
    };

    const replacement = reselectExercise({
      currentSelection: {
        cognitive: [...currentSelection.cognitive],
        memory: [...currentSelection.memory],
      },
      targetType: 'date_weekday_season',
      today: TODAY,
      recentExposures: [],
      accuracyRecords: [],
      random: createSeededRandom(5),
    });

    expect(ALL_COGNITIVE_TYPES).toContain(replacement);
    expect(replacement).not.toBe('date_weekday_season');
    expect(currentSelection.cognitive).not.toContain(replacement);
  });

  it('바꿀 수 있는 다른 유형이 전혀 없으면 원래 유형을 그대로 반환한다', () => {
    const replacement = reselectExercise({
      currentSelection: {
        cognitive: [...ALL_COGNITIVE_TYPES], // 카테고리 전체가 이미 선택된 극단적 상황
        memory: ['today_breakfast_recall', 'family_photo_naming'],
      },
      targetType: 'am_pm',
      today: TODAY,
      recentExposures: [],
      accuracyRecords: [],
      random: createSeededRandom(5),
    });

    expect(replacement).toBe('am_pm');
  });
});
