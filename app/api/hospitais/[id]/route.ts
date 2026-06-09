import { NextResponse } from "next/server"
import { getSessionUserId } from "@/lib/auth"
import { apiError, deleteHospital, saveHospital } from "@/lib/repository"

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    return NextResponse.json(await saveHospital({ ...(await request.json()), id }, await getSessionUserId()))
  } catch (error) {
    return apiError(error)
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    await deleteHospital(id, await getSessionUserId())
    return NextResponse.json({ ok: true })
  } catch (error) {
    return apiError(error)
  }
}
