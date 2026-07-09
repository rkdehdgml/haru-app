import React, { useState } from 'react';
import { QuizQuestionCard } from '../QuizQuestionCard';
import { generateFamilyPhotoQuestion } from '../../data/questionBank';
import type { FamilyMember } from '../../types/familyMember';

export interface FamilyPhotoQuizCardProps {
  member: FamilyMember;
  otherMembers: FamilyMember[];
  onSubmit: (isCorrect: boolean, correctAnswerLabel: string) => void;
}

/**
 * 가족 사진 회상은 사진이라는 별도 인터랙션이 필요해 서브 컴포넌트로 분리했지만,
 * 실제 보기 UI는 공용 QuizQuestionCard를 그대로 재사용한다.
 */
export function FamilyPhotoQuizCard({ member, otherMembers, onSubmit }: FamilyPhotoQuizCardProps) {
  const [question] = useState(() => generateFamilyPhotoQuestion(member, otherMembers, Math.random));
  return <QuizQuestionCard question={question} onSubmit={onSubmit} />;
}
