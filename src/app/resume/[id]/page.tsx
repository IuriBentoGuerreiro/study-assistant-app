import AIResumeChat from "@/src/components/resume/resume";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AIResumeChat initialResumeId={id} />;
}