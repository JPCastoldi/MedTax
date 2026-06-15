import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/auth"
import { apiError, dashboardData } from "@/lib/repository"

export async function GET(request: Request) {
  try {
    const month = new URL(request.url).searchParams.get("month")
    return NextResponse.json(await dashboardData(await getSessionUserId(), month))
  } catch (error) {
    return apiError(error)
  }
}
