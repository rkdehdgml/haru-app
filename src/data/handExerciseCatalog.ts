import type { HandExerciseDefinition } from '../types/handExercise';

// 저강도 표준 손 힘 훈련 동작. 실제 촬영된 안내 영상이 준비되면 videoUri를 채워 넣으면 된다
// (담당 치료사 확인 후 종류/횟수 자체는 보호자 대시보드에서 조정 가능, 하드코딩된 값은 초기 기본값일 뿐).
export const HAND_EXERCISE_CATALOG: HandExerciseDefinition[] = [
  {
    id: 'squeeze_ball',
    name: '스퀴즈볼 쥐기',
    description: '말랑한 공을 5초간 꽉 쥐었다가 천천히 펴세요',
    defaultTargetReps: 10,
    icon: '🖐️',
    videoUri: null,
  },
  {
    id: 'finger_bend',
    name: '손가락 하나씩 굽히기',
    description: '엄지부터 새끼손가락까지 순서대로 천천히 굽혔다 펴세요',
    defaultTargetReps: 10,
    icon: '☝️',
    videoUri: null,
  },
  {
    id: 'wrist_rotate',
    name: '손목 돌리기',
    description: '손목에 힘을 빼고 시계 방향으로 천천히 돌리세요',
    defaultTargetReps: 8,
    icon: '🔄',
    videoUri: null,
  },
];
