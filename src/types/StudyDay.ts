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
  id: string;
  userId: string;
  description: string;
  studyDate: string;
  studiedSeconds: number;
  startTime: string;
  endTime: string | null;
  active: boolean;
  totalPausedSeconds: number;
  activePause?: { 
    id: string;
    startTime: string; 
  } | null;
}