import { Question, QuestionResponse } from "./Question";

export type StudySession = {
    id: string
    sessionName: string
    questions: Question[]
    completed: boolean
}
export interface PromptRequest {
    prompt: string;
    quantidade: number;
    nivel: string;
}

export interface StudySessionNameDTO {
    id: string;
    sessionName: string;
    createdAt: string;
}

export interface StudySessionResponseDTO {
    id: string;
    sessionName: string;
    questions: QuestionResponse[];
}