export interface StudyDayRequest {
  description: string;
  studyDate: string;
  studiedSeconds: number;
  completed: boolean;
  startTime: string;
  endTime: string | null;
  active: boolean;
}

export interface StudyDayResponse {
  id: number;
  userId: number;
  description: string;
  studyDate: string;
  studiedSeconds: number;
  startTime: string;
  endTime: string | null;
  active: boolean;
}