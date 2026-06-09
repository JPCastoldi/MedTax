import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/auth"
import { apiError, reportData } from "@/lib/repository"

export async function GET() {
  try {
    return NextResponse.json(await reportData(await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}
