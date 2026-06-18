import SectionDetailPage from "@/pages/sections/[id]/page";

export default async function Route({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SectionDetailPage id={id} />;
}
