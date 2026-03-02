import AIResumeChat from "@/src/components/summary/summary";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AIResumeChat initialSummaryId={id} />;
}