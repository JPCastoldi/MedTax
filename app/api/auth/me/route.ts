import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({
      id: "demo",
      name: "Usuario Demo",
      email: "demo@medtax.com",
      crm: null,
    })
  }

  return NextResponse.json(user)
}
