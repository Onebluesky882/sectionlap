import LiveClassPreload from "@/preload/sections/[id]/live/page";

export default function LiveClassPage({ id }: { id: string }) {
  return <LiveClassPreload id={id} />;
}
