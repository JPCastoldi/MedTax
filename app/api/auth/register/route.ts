import { NextResponse } from "next/server"
import { setSessionCookie } from "@/lib/auth"
import { hashPassword } from "@/lib/password"
import { hasDatabaseUrl, prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const body = await request.json()

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email e senha sao obrigatorios." }, { status: 400 })
  }

  if (hasDatabaseUrl()) {
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } })

    if (existingUser) {
      return NextResponse.json({ error: "Email ja cadastrado." }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        name: body.name || "Medico",
        email: body.email,
        password: hashPassword(body.password),
        crm: body.crm || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    const response = NextResponse.json({
      ok: true,
      user,
      next: "/onboarding",
    })
    setSessionCookie(response, user.id)
    return response
  }

  return NextResponse.json({
    ok: true,
    mode: "demo",
    user: { name: body.name ?? "Medico", email: body.email },
    next: "/onboarding",
  })
}
