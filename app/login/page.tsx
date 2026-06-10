"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthBrand, AuthField, AuthPrimaryButton, AuthShell } from "@/components/auth-shell"
import { isValidEmail } from "@/lib/form-validation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const canSubmit = Boolean(isValidEmail(email) && password)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
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
    <AuthShell>
      <AuthBrand subtitle="Entre para acompanhar plantoes, notas e impostos." />
      <form onSubmit={submit} className="flex flex-col gap-4 flex-1">
        <AuthField label="E-mail" type="email" placeholder="voce@email.com" value={email} onChange={setEmail} />
        <AuthField label="Senha" type="password" placeholder="Sua senha" value={password} onChange={setPassword} />
        {email && !isValidEmail(email) && <p className="text-xs text-red-600">Digite um e-mail valido.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="mt-auto pt-6">
          <AuthPrimaryButton disabled={!canSubmit}>Entrar</AuthPrimaryButton>
          <p className="text-center text-[13px] text-slate-500 mt-4">Ainda nao tem conta? <Link className="font-medium text-emerald-600" href="/cadastro">Criar conta</Link></p>
        </div>
      </form>
    </AuthShell>
  )
}
