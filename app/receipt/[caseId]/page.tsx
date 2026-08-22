import { FreezeReceipt } from "@/components/FreezeReceipt";

// Next 16: params is a Promise.
export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <FreezeReceipt caseId={caseId} />;
}
