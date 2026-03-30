export type Question = {
  id: string;
  statement: string;
  options?: string[];
  studyAnswer?: number;
  correctAnswerIndex: number;
  comment: string;
};

export interface QuestionGenerateDTO {
  statement: string;
  options: string[];
  correctAnswerIndex: number;
  comment: string;
}
  
export interface QuestionResponse {
  id: string;
  statement: string;
  options: string[];
  correctAnswerIndex: number;
  studyAnswer: number | null;
  comment: string;
}

export interface UserAnswerDTO {
  questionId: string;
  selectedOptionIndex: number;
}
