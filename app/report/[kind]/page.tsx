import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReportFlow } from "@/components/ReportFlow";
import { kindConfig, REPORT_KINDS } from "@/lib/report-kinds";

export function generateStaticParams() {
  return Object.keys(REPORT_KINDS).map((kind) => ({ kind }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kind: string }>;
}): Promise<Metadata> {
  const { kind } = await params;
  const c = kindConfig(kind);
  return c
    ? { title: c.title + " — Sahaay", description: c.lede }
    : { title: "Report — Sahaay" };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  const config = kindConfig(kind);
  if (!config) notFound();

  return <ReportFlow config={config} />;
}
