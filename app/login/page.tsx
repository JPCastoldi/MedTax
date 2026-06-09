"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("demo@medtax.com")
  const [password, setPassword] = useState("demo123")
  const [error, setError] = useState("")

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) {
      setError(data.error ?? "Nao foi possivel entrar.")
      return
    }
    router.push(data.next)
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Entrar no MedTax</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-2"><Label>Senha</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full">Entrar</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">Ainda nao tem conta? <Link className="text-primary" href="/cadastro">Criar conta</Link></p>
        </CardContent>
      </Card>
    </main>
  )
}
