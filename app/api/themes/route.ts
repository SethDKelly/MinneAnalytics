import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSelectableThemes, themeOptionFromRow } from "@/lib/themes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const conference = await prisma.conference.findUnique({ where: { slug } });
  if (!conference) {
    return NextResponse.json({ error: "Conference not found" }, { status: 404 });
  }

  const themes = await getSelectableThemes(conference.id);
  return NextResponse.json({
    themes: themes.map(themeOptionFromRow),
  });
}
