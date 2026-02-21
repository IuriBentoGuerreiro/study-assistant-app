export interface StudyGoalRequest {
  dailyStudySeconds: number;
}

export interface StudyGoalResponse {
  id: number;
  userId: number;
  dailyStudySeconds: number;
}
