export const dynamic = "force-dynamic";

export async function POST() {
  return Response.json(
    {
      ok: false,
      disabled: true,
      reports: 0,
      reason: "This prototype does not accept or publish visitor accusations.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return Response.json(
    {
      disabled: true,
      reports: 0,
      reason: "Only clearly fictional seeded examples are shown in the UI.",
    },
    { status: 410 },
  );
}
