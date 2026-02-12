export interface StudyDayRequest {
  studyDate: string;
  studiedMinutes: number;
  completed: boolean;
  startTime: string;
  endTime: string | null;
  active: boolean;
}

export interface StudyDayResponse {
  id: number;
  userId: number;
  studyDate: string;
  studiedMinutes: number;
  startTime: string;
  endTime: string | null;
  active: boolean;
}