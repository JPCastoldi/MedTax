import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/auth"
import { apiError, listNotifications } from "@/lib/repository"

export async function GET() {
  try {
    return NextResponse.json(await listNotifications(await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}
