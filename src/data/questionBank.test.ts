import {
  generateAmPmQuestion,
  generateBreakfastQuestion,
  generateDateWeekdaySeasonQuestion,
  generateFamilyPhotoQuestion,
  generateLocationQuestion,
  generateMedicalStaffQuestion,
  generateYesterdayEventQuestion,
} from './questionBank';
import type { FamilyMember } from '../types/familyMember';
import type { MultipleChoiceQuestion } from '../types/quiz';

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

function expectValidQuestion(question: MultipleChoiceQuestion, expectedCorrectAnswer: string) {
  expect(question.choices[question.correctIndex]).toBe(expectedCorrectAnswer);
  expect(new Set(question.choices).size).toBe(question.choices.length); // 중복 보기 없음
  expect(question.choices.length).toBeGreaterThanOrEqual(2);
}

describe('generateDateWeekdaySeasonQuestion', () => {
  it('오늘 날짜 기준으로 항상 정답이 보기 안에 있고 중복이 없다', () => {
    const today = new Date('2026-07-09T09:00:00');
    for (let seed = 0; seed < 20; seed += 1) {
      const question = generateDateWeekdaySeasonQuestion(today, createSeededRandom(seed));
      expect(question.choices).toHaveLength(4);
      expect(question.choices[question.correctIndex]).toBeTruthy();
      expect(new Set(question.choices).size).toBe(4);
    }
  });
});

describe('generateAmPmQuestion', () => {
  it('오전 시각이면 정답은 오전', () => {
    const question = generateAmPmQuestion(new Date('2026-07-09T09:00:00'), createSeededRandom(1));
    expectValidQuestion(question, '오전');
  });

  it('오후 시각이면 정답은 오후', () => {
    const question = generateAmPmQuestion(new Date('2026-07-09T15:00:00'), createSeededRandom(1));
    expectValidQuestion(question, '오후');
  });
});

describe('generateLocationQuestion', () => {
  it('병원 이름이 설정돼 있으면 그 이름이 정답이다', () => {
    const question = generateLocationQuestion('서울아산병원', createSeededRandom(5));
    expectValidQuestion(question, '서울아산병원');
    expect(question.choices).toHaveLength(4);
  });

  it('병원 이름이 비어 있으면 기본 문항으로 대체한다', () => {
    const question = generateLocationQuestion('', createSeededRandom(5));
    expectValidQuestion(question, '병원');
  });
});

describe('generateBreakfastQuestion / generateYesterdayEventQuestion', () => {
  it('보호자가 입력한 내용이 정답 보기로 들어간다', () => {
    const breakfast = generateBreakfastQuestion('흰죽과 계란찜', createSeededRandom(2));
    expectValidQuestion(breakfast, '흰죽과 계란찜');

    const event = generateYesterdayEventQuestion('손녀가 병문안을 왔어요', createSeededRandom(2));
    expectValidQuestion(event, '손녀가 병문안을 왔어요');
  });
});

describe('generateMedicalStaffQuestion', () => {
  it('설정된 담당의 이름이 정답이다', () => {
    const question = generateMedicalStaffQuestion('김도윤', createSeededRandom(3));
    expectValidQuestion(question, '김도윤');
  });
});

describe('generateFamilyPhotoQuestion', () => {
  const members: FamilyMember[] = [
    { id: '1', name: '큰딸', photoUri: 'file://a.jpg', createdAt: '2026-01-01' },
    { id: '2', name: '작은딸', photoUri: 'file://b.jpg', createdAt: '2026-01-01' },
  ];

  it('사진 속 인물 이름이 정답이고, 등록된 다른 가족이 부족하면 기본 이름 풀로 채운다', () => {
    const question = generateFamilyPhotoQuestion(members[0], members, createSeededRandom(4));
    expectValidQuestion(question, '큰딸');
    expect(question.imageUri).toBe('file://a.jpg');
    // 본인 이름이 오답 후보로 다시 섞여 들어가지 않아야 한다.
    expect(question.choices.filter((c) => c === '큰딸')).toHaveLength(1);
  });
});
