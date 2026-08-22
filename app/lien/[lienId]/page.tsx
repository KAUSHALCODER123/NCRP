import { LienNotice } from "@/components/LienNotice";

export default async function LienPage({
  params,
}: {
  params: Promise<{ lienId: string }>;
}) {
  const { lienId } = await params;
  return <LienNotice lienId={lienId} />;
}
