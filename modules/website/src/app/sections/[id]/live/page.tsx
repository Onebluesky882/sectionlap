import LiveClassPage from "@/pages/sections/[id]/live/page";

export default function Page({ params }: { params: { id: string } }) {
  return <LiveClassPage id={params.id} />;
}
