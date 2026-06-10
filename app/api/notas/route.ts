import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/auth"
import { apiError, gerarNotaPorHospital, listNotas } from "@/lib/repository"

export async function GET() {
  try {
    return NextResponse.json(await listNotas(await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const { hospitalId, competencia, plantaoIds, dataEmissao } = await request.json()
    return NextResponse.json(await gerarNotaPorHospital(hospitalId, competencia, await getSessionUserId(), { plantaoIds, dataEmissao }))
  } catch (error) {
    return apiError(error)
  }
}
