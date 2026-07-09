import { shuffleItems } from '../games/tapSequenceGame';
import type { FamilyMember } from '../types/familyMember';
import type { MultipleChoiceQuestion } from '../types/quiz';

const WEEKDAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const SEASON_NAMES = ['봄', '여름', '가을', '겨울'];
const HOSPITAL_DISTRACTOR_POOL = ['서울재활병원', '국립재활원', '한사랑병원', '푸른요양병원'];
const BREAKFAST_DISTRACTOR_POOL = ['흰죽', '토스트', '계란후라이', '미음', '누룽지', '바나나', '요거트', '시리얼'];
const EVENT_DISTRACTOR_POOL = [
  '가족과 통화했어요',
  'TV를 봤어요',
  '산책을 했어요',
  '병원 검사를 받았어요',
  '친구가 병문안을 왔어요',
  '책을 읽었어요',
];
const NAME_DISTRACTOR_POOL = ['김민수', '이영희', '박지훈', '최수진', '정다은', '한서준'];

function seasonOf(month: number): string {
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
}

function pickDistractors(
  pool: readonly string[],
  exclude: string,
  count: number,
  random: () => number
): string[] {
  const candidates = pool.filter((item) => item !== exclude);
  return shuffleItems(candidates, random).slice(0, count);
}

function buildChoices(
  correct: string,
  distractors: readonly string[],
  random: () => number
): { choices: string[]; correctIndex: number } {
  const choices = shuffleItems([correct, ...distractors], random);
  return { choices, correctIndex: choices.indexOf(correct) };
}

/** 오늘 요일 또는 계절 중 하나를 무작위로 물어본다 (날짜 숫자 맞히기는 난이도가 너무 높아 제외). */
export function generateDateWeekdaySeasonQuestion(
  today: Date,
  random: () => number
): MultipleChoiceQuestion {
  const askWeekday = random() < 0.5;

  if (askWeekday) {
    const correct = WEEKDAY_NAMES[today.getDay()];
    const distractors = pickDistractors(WEEKDAY_NAMES, correct, 3, random);
    const { choices, correctIndex } = buildChoices(correct, distractors, random);
    return { prompt: '오늘은 무슨 요일일까요?', choices, correctIndex };
  }

  const correct = seasonOf(today.getMonth() + 1);
  const distractors = pickDistractors(SEASON_NAMES, correct, 3, random);
  const { choices, correctIndex } = buildChoices(correct, distractors, random);
  return { prompt: '지금은 어느 계절일까요?', choices, correctIndex };
}

export function generateAmPmQuestion(now: Date, random: () => number): MultipleChoiceQuestion {
  const isAm = now.getHours() < 12;
  const correct = isAm ? '오전' : '오후';
  const wrong = isAm ? '오후' : '오전';
  const choices = shuffleItems([correct, wrong], random);
  return { prompt: '지금은 오전일까요, 오후일까요?', choices, correctIndex: choices.indexOf(correct) };
}

export function generateLocationQuestion(
  hospitalName: string,
  random: () => number
): MultipleChoiceQuestion {
  if (!hospitalName) {
    const { choices, correctIndex } = buildChoices('병원', ['집', '학교', '공원'], random);
    return { prompt: '지금 계신 곳은 어디일까요?', choices, correctIndex };
  }
  const distractors = pickDistractors(HOSPITAL_DISTRACTOR_POOL, hospitalName, 3, random);
  const { choices, correctIndex } = buildChoices(hospitalName, distractors, random);
  return { prompt: '지금 계신 병원 이름은 무엇일까요?', choices, correctIndex };
}

export function generateBreakfastQuestion(
  correctAnswer: string,
  random: () => number
): MultipleChoiceQuestion {
  const distractors = pickDistractors(BREAKFAST_DISTRACTOR_POOL, correctAnswer, 3, random);
  const { choices, correctIndex } = buildChoices(correctAnswer, distractors, random);
  return { prompt: '오늘 아침에 무엇을 드셨을까요?', choices, correctIndex };
}

export function generateYesterdayEventQuestion(
  correctAnswer: string,
  random: () => number
): MultipleChoiceQuestion {
  const distractors = pickDistractors(EVENT_DISTRACTOR_POOL, correctAnswer, 3, random);
  const { choices, correctIndex } = buildChoices(correctAnswer, distractors, random);
  return { prompt: '어제 있었던 일은 무엇일까요?', choices, correctIndex };
}

export function generateMedicalStaffQuestion(
  doctorName: string,
  random: () => number
): MultipleChoiceQuestion {
  const distractors = pickDistractors(NAME_DISTRACTOR_POOL, doctorName, 3, random);
  const { choices, correctIndex } = buildChoices(doctorName, distractors, random);
  return { prompt: '담당 의사 선생님 성함은 무엇일까요?', choices, correctIndex };
}

export function generateFamilyPhotoQuestion(
  member: FamilyMember,
  otherMembers: readonly FamilyMember[],
  random: () => number
): MultipleChoiceQuestion {
  const otherNames = otherMembers.filter((m) => m.id !== member.id).map((m) => m.name);
  const pool = otherNames.length >= 3 ? otherNames : [...otherNames, ...NAME_DISTRACTOR_POOL];
  const distractors = pickDistractors(pool, member.name, 3, random);
  const { choices, correctIndex } = buildChoices(member.name, distractors, random);
  return {
    prompt: '사진 속 이 사람은 누구일까요?',
    choices,
    correctIndex,
    imageUri: member.photoUri,
  };
}
