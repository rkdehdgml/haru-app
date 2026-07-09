export interface MultipleChoiceQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
  /** 가족 사진 회상처럼 프롬프트에 이미지가 필요한 경우 */
  imageUri?: string;
}
