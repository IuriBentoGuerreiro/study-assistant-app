import AIQuizChat from "@/src/components/AIQuizChat/chat";

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;

  return <AIQuizChat initialSessionId={id} />;
}