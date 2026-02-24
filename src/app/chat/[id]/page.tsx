import AIQuizChat from "@/src/components/AIQuizChat/chat";

export default function Page({
  params,
}: {
  params: { id: string };
}) {
  return <AIQuizChat initialSessionId={params.id} />;
}