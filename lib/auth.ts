import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { hasDatabaseUrl, prisma } from "@/lib/prisma"

export const SESSION_COOKIE = "medtax_user_id"

export async function getSessionUserId() {
  if (!hasDatabaseUrl()) return null
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null
}

export async function getCurrentUser() {
  const userId = await getSessionUserId()
  if (!userId) return null

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, crm: true },
  })
}

export async function requireUserId() {
  const userId = await getSessionUserId()
  if (!userId) {
    throw new Error("Usuario nao autenticado.")
  }
  return userId
}

export function setSessionCookie(response: NextResponse, userId: string) {
  response.cookies.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}
