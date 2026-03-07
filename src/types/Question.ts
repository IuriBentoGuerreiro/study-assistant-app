export type Question = {
  id: string;
  type: QuestionType;
  statement: string;
  options?: string[];
  studyAnswer?: number;
  correctAnswerIndex: number;
  comment: string;
};

export interface QuestionGenerateDTO {
  type: QuestionType;
  statement: string;
  options: string[];
  correctAnswerIndex: number;
  comment: string;
}
  
export interface QuestionResponse {
  id: string;
  statement: string;
  type: QuestionType;
  options: string[];
  correctAnswerIndex: number;
  studyAnswer: number | null;
  comment: string;
}

export interface UserAnswerDTO {
  questionId: string;
  selectedOptionIndex: number;
}
export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
}