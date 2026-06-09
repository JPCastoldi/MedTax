import { NextResponse } from "next/server"
import { setSessionCookie } from "@/lib/auth"
import { verifyPassword } from "@/lib/password"
import { hasDatabaseUrl, prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email e senha sao obrigatorios." }, { status: 400 })
  }

  if (hasDatabaseUrl()) {
    const user = await prisma.user.findUnique({ where: { email: body.email } })

    if (!user || !verifyPassword(body.password, user.password)) {
      return NextResponse.json({ error: "Email ou senha invalidos." }, { status: 401 })
    }

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      next: "/dashboard",
    })
    setSessionCookie(response, user.id)
    return response
  }

  return NextResponse.json({
    ok: true,
    mode: "demo",
    user: { email: body.email },
    next: "/dashboard",
  })
}
