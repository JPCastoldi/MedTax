import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/auth"
import { apiError, getSettings, saveSettings } from "@/lib/repository"

export async function GET() {
  try {
    return NextResponse.json(await getSettings(await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}

export async function PUT(request: Request) {
  try {
    return NextResponse.json(await saveSettings(await request.json(), await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}
