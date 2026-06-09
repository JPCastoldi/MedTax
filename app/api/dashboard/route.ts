import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/auth"
import { apiError, dashboardData } from "@/lib/repository"

export async function GET() {
  try {
    return NextResponse.json(await dashboardData(await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}
