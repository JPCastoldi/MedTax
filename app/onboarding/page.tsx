"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AuthBrand, AuthField, AuthPrimaryButton, AuthShell, OnboardingProgress } from "@/components/auth-shell"
import { formatCnpj, formatPhone, formatUf, isValidCnpj, isValidCrm } from "@/lib/form-validation"

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    nome: "",
    email: "",
    telefone: "",
    crm: "",
    endereco: "",
    especialidade: "clinica",
    atuacao: "plantao",
    darkMode: false,
    notifications: {
      email: true,
      push: true,
      sms: false,
      vencimentos: true,
      relatorios: true,
      alertas: true,
    },
  })
  const [empresa, setEmpresa] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    regimeTributario: "Simples Nacional",
    cnae: "8630-5/03",
    fatorR: 28,
    situacao: "ativa",
    dataAbertura: new Date().toISOString().slice(0, 10),
  })
  const [hospital, setHospital] = useState({
    nome: "",
    cnpj: "",
    cidade: "",
    estado: "SP",
    contatoFinanceiro: "",
    telefone: "",
    prazoMedioPagamento: 30,
    cor: "#2563eb",
  })

  useEffect(() => {
    fetch("/api/configuracoes")
      .then((response) => response.json())
      .then((data) => setProfile((current) => ({ ...current, ...data })))
  }, [])

  async function finish() {
    setSaving(true)
    await fetch("/api/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
    if (empresa.cnpj && empresa.razaoSocial) {
      await fetch("/api/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empresa),
      })
    }
    if (hospital.nome && hospital.cnpj) {
      await fetch("/api/hospitais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hospital),
      })
    }
    router.push("/dashboard")
  }

  const canContinueProfile = Boolean(profile.nome.trim().length >= 3 && isValidCrm(profile.crm))
  const canContinueEmpresa = Boolean(isValidCnpj(empresa.cnpj) && empresa.razaoSocial.trim().length >= 3 && empresa.nomeFantasia.trim().length >= 2)
  const canFinish = Boolean(hospital.nome.trim().length >= 3 && isValidCnpj(hospital.cnpj) && hospital.cidade.trim().length >= 2 && hospital.estado.length === 2)

  return (
    <AuthShell>
      <AuthBrand subtitle="Vamos configurar o essencial antes de abrir o app." />
      <OnboardingProgress step={step} total={3} />

      {step === 1 && (
        <form className="flex flex-col gap-4 flex-1" onSubmit={(event) => { event.preventDefault(); setStep(2) }}>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Seu perfil medico</h2>
            <p className="text-sm text-slate-500 mt-1">Usamos esses dados para personalizar o painel e as notas.</p>
          </div>
          <AuthField label="Nome completo" value={profile.nome} onChange={(nome) => setProfile({ ...profile, nome })} />
          <AuthField label="CRM" value={profile.crm} onChange={(crm) => setProfile({ ...profile, crm: crm.toUpperCase().replace(/[^0-9A-Z-]/g, "").slice(0, 11) })} />
          <AuthField label="Telefone" value={profile.telefone} onChange={(telefone) => setProfile({ ...profile, telefone: formatPhone(telefone) })} />
          <AuthField label="Endereco profissional" value={profile.endereco} onChange={(endereco) => setProfile({ ...profile, endereco })} />
          {profile.crm && !isValidCrm(profile.crm) && <p className="text-xs text-red-600">Use um CRM como 123456-SP.</p>}
          <div className="mt-auto pt-6"><AuthPrimaryButton disabled={!canContinueProfile}>Continuar</AuthPrimaryButton></div>
        </form>
      )}

      {step === 2 && (
        <form className="flex flex-col gap-4 flex-1" onSubmit={(event) => { event.preventDefault(); setStep(3) }}>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Seu CNPJ</h2>
            <p className="text-sm text-slate-500 mt-1">Cadastre a empresa que emite suas notas fiscais.</p>
          </div>
          <AuthField label="CNPJ" placeholder="00.000.000/0001-00" value={empresa.cnpj} onChange={(cnpj) => setEmpresa({ ...empresa, cnpj: formatCnpj(cnpj) })} />
          <AuthField label="Razao social" value={empresa.razaoSocial} onChange={(razaoSocial) => setEmpresa({ ...empresa, razaoSocial })} />
          <AuthField label="Nome fantasia" value={empresa.nomeFantasia} onChange={(nomeFantasia) => setEmpresa({ ...empresa, nomeFantasia })} />
          <AuthField label="Fator R (%)" type="number" value={String(empresa.fatorR)} onChange={(fatorR) => setEmpresa({ ...empresa, fatorR: Math.min(100, Math.max(0, Number(fatorR) || 0)) })} />
          {empresa.cnpj && !isValidCnpj(empresa.cnpj) && <p className="text-xs text-red-600">Digite um CNPJ com 14 numeros.</p>}
          <div className="mt-auto flex gap-3 pt-6">
            <button type="button" className="h-12 flex-1 rounded-full border border-slate-200 bg-white font-semibold text-slate-700" onClick={() => setStep(1)}>Voltar</button>
            <button type="submit" disabled={!canContinueEmpresa} className="h-12 flex-1 rounded-full bg-emerald-600 font-semibold text-white disabled:opacity-50">Continuar</button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form className="flex flex-col gap-4 flex-1" onSubmit={(event) => { event.preventDefault(); finish() }}>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Primeiro hospital</h2>
            <p className="text-sm text-slate-500 mt-1">Depois voce pode adicionar outros hospitais e plantões.</p>
          </div>
          <AuthField label="Nome do hospital" value={hospital.nome} onChange={(nome) => setHospital({ ...hospital, nome })} />
          <AuthField label="CNPJ do hospital" value={hospital.cnpj} onChange={(cnpj) => setHospital({ ...hospital, cnpj: formatCnpj(cnpj) })} />
          <AuthField label="Cidade" value={hospital.cidade} onChange={(cidade) => setHospital({ ...hospital, cidade })} />
          <AuthField label="UF" value={hospital.estado} onChange={(estado) => setHospital({ ...hospital, estado: formatUf(estado) })} />
          <AuthField label="Prazo medio de pagamento" type="number" value={String(hospital.prazoMedioPagamento)} onChange={(prazoMedioPagamento) => setHospital({ ...hospital, prazoMedioPagamento: Math.min(180, Math.max(0, Number(prazoMedioPagamento) || 0)) })} />
          {hospital.cnpj && !isValidCnpj(hospital.cnpj) && <p className="text-xs text-red-600">Digite um CNPJ com 14 numeros.</p>}
          <div className="mt-auto flex gap-3 pt-6">
            <button type="button" className="h-12 flex-1 rounded-full border border-slate-200 bg-white font-semibold text-slate-700" onClick={() => setStep(2)}>Voltar</button>
            <button type="submit" disabled={saving || !canFinish} className="h-12 flex-1 rounded-full bg-emerald-600 font-semibold text-white disabled:opacity-50">{saving ? "Salvando..." : "Entrar no app"}</button>
          </div>
        </form>
      )}
    </AuthShell>
  )
}
