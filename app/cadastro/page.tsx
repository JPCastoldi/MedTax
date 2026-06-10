"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AuthBrand, AuthField, AuthPrimaryButton, AuthShell } from "@/components/auth-shell"
import { isValidCrm, isValidEmail } from "@/lib/form-validation"

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [crm, setCrm] = useState("")
  const [error, setError] = useState("")
  const canSubmit = Boolean(name.trim().length >= 3 && isValidEmail(email) && password.length >= 6 && isValidCrm(crm))

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, crm }),
    })
    const data = await response.json()
    if (!response.ok) {
      setError(data.error ?? "Nao foi possivel criar a conta.")
      return
    }
    router.push(data.next)
  }

  return (
    <AuthShell>
      <AuthBrand />
      <form onSubmit={submit} className="flex flex-col gap-4 flex-1">
        <AuthField label="Nome completo" placeholder="Ex.: Joao Silva" value={name} onChange={setName} />
        <AuthField label="E-mail" type="email" placeholder="voce@email.com" value={email} onChange={setEmail} />
        <AuthField label="Senha" type="password" placeholder="Crie uma senha" value={password} onChange={setPassword} />
        <AuthField label="CRM" placeholder="123456-SP" value={crm} onChange={(value) => setCrm(value.toUpperCase().replace(/[^0-9A-Z-]/g, "").slice(0, 11))} />
        {email && !isValidEmail(email) && <p className="text-xs text-red-600">Digite um e-mail valido.</p>}
        {password && password.length < 6 && <p className="text-xs text-red-600">A senha precisa ter pelo menos 6 caracteres.</p>}
        {crm && !isValidCrm(crm) && <p className="text-xs text-red-600">Use um CRM como 123456-SP.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="mt-auto pt-6">
          <AuthPrimaryButton disabled={!canSubmit}>Criar conta</AuthPrimaryButton>
          <p className="text-center text-[12px] text-slate-400 mt-4">Ao continuar, voce concorda com os termos do Med Tax.</p>
          <p className="text-center text-[13px] text-slate-500 mt-4">Ja tem conta? <Link className="font-medium text-emerald-600" href="/login">Entrar</Link></p>
        </div>
      </form>
    </AuthShell>
  )
}
