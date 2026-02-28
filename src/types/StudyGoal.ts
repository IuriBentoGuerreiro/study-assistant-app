export interface StudyGoalRequest {
  dailyStudySeconds: number;
}

export interface StudyGoalResponse {
  id: string;
  userId: string;
  dailyStudySeconds: number;
}
