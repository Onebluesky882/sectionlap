import VisualPlanDetailPreload from "@/preload/visual-plan/[id]/page";

export default function VisualPlanDetailPage({ params }: { params: { id: string } }) {
  return <VisualPlanDetailPreload id={params.id} />;
}
