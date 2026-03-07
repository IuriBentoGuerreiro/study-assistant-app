import { Question, QuestionResponse, QuestionType } from "./Question";

export type StudySession = {
    id: string
    sessionName: string
    questions: Question[]
    completed: boolean
}
export interface PromptRequest {
    prompt: string;
    banca: string;
    quantidade: number;
    type: QuestionType;
    orgao: string;
    cargo: string;
    cidade: string;
    estado: string;
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