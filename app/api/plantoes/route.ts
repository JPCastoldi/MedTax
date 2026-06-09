import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/auth"
import { apiError, listPlantoes, savePlantao } from "@/lib/repository"

export async function GET() {
  try {
    return NextResponse.json(await listPlantoes(await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await savePlantao(await request.json(), await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}
