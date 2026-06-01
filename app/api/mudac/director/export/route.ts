import { NextResponse } from "next/server";
import { requireDirector } from "@/lib/mudac/auth";
import { buildDivisionRankings, presentationsToCsv } from "@/lib/mudac/aggregation";
import { getMudacAggregationBundle } from "@/lib/mudac/aggregation-data";
import { MUDAC_DIVISIONS } from "@/lib/mudac/constants";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const director = await requireDirector(token);
  if (!director) {
    return NextResponse.json({ error: "Director access required" }, { status: 403 });
  }

  const bundle = await getMudacAggregationBundle(director.eventId);
  if (!bundle) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const rankings = buildDivisionRankings(
    bundle.presentations,
    bundle.criteriaForScoring,
    bundle.event.panelAggregateMode,
    bundle.event.judgesPerPanel,
    "PANEL",
    MUDAC_DIVISIONS
  );

  const csv = presentationsToCsv(rankings, bundle.event.panelAggregateMode);
  const filename = `${bundle.event.slug}-rankings.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
