import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/auth"
import { apiError, listEmpresas, saveEmpresa } from "@/lib/repository"

export async function GET() {
  try {
    return NextResponse.json(await listEmpresas(await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await saveEmpresa(await request.json(), await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}
