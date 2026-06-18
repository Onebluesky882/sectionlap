import SectionDetailPreload from "@/preload/sections/[id]/page";

export default function SectionDetailPage({ id }: { id: string }) {
  return <SectionDetailPreload id={id} />;
}
