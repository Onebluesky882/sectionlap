import VisualPlanDetailPage from "@/pages/visual-plan/[id]/page";

export default async function Route({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VisualPlanDetailPage id={id} />;
}
