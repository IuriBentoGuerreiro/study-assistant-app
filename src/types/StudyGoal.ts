export interface StudyGoalRequest {
  dailyStudyMinutes: number;
}

export interface StudyGoalResponse {
  id: number;
  userId: number;
  dailyStudyMinutes: number;
}
