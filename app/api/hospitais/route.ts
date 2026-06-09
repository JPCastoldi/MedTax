import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/auth"
import { apiError, listHospitals, saveHospital } from "@/lib/repository"

export async function GET() {
  try {
    return NextResponse.json(await listHospitals(await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await saveHospital(await request.json(), await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}
