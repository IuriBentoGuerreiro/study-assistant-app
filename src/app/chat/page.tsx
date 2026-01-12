import AIQuizChat from '@/src/components/AIQuizChat/chat';
import { Suspense } from 'react';

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AIQuizChat />
    </Suspense>
  );
}