export type Question = {
  id: string;
  type: QuestionType;
  statement: string;
  options?: string[];
  userAnswerIndex?: number;
  correctAnswerIndex: number;
};

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
}