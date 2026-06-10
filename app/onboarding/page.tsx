"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AuthBrand, AuthField, AuthPrimaryButton, AuthShell, OnboardingProgress } from "@/components/auth-shell"

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
          <AuthField label="CRM" value={profile.crm} onChange={(crm) => setProfile({ ...profile, crm })} />
          <AuthField label="Telefone" value={profile.telefone} onChange={(telefone) => setProfile({ ...profile, telefone })} />
          <AuthField label="Endereco profissional" value={profile.endereco} onChange={(endereco) => setProfile({ ...profile, endereco })} />
          <div className="mt-auto pt-6"><AuthPrimaryButton>Continuar</AuthPrimaryButton></div>
        </form>
      )}

      {step === 2 && (
        <form className="flex flex-col gap-4 flex-1" onSubmit={(event) => { event.preventDefault(); setStep(3) }}>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Seu CNPJ</h2>
            <p className="text-sm text-slate-500 mt-1">Cadastre a empresa que emite suas notas fiscais.</p>
          </div>
          <AuthField label="CNPJ" placeholder="00.000.000/0001-00" value={empresa.cnpj} onChange={(cnpj) => setEmpresa({ ...empresa, cnpj })} />
          <AuthField label="Razao social" value={empresa.razaoSocial} onChange={(razaoSocial) => setEmpresa({ ...empresa, razaoSocial })} />
          <AuthField label="Nome fantasia" value={empresa.nomeFantasia} onChange={(nomeFantasia) => setEmpresa({ ...empresa, nomeFantasia })} />
          <AuthField label="Fator R (%)" type="number" value={String(empresa.fatorR)} onChange={(fatorR) => setEmpresa({ ...empresa, fatorR: Number(fatorR) })} />
          <div className="mt-auto flex gap-3 pt-6">
            <button type="button" className="h-12 flex-1 rounded-full border border-slate-200 bg-white font-semibold text-slate-700" onClick={() => setStep(1)}>Voltar</button>
            <button type="submit" className="h-12 flex-1 rounded-full bg-blue-600 font-semibold text-white">Continuar</button>
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
          <AuthField label="CNPJ do hospital" value={hospital.cnpj} onChange={(cnpj) => setHospital({ ...hospital, cnpj })} />
          <AuthField label="Cidade" value={hospital.cidade} onChange={(cidade) => setHospital({ ...hospital, cidade })} />
          <AuthField label="UF" value={hospital.estado} onChange={(estado) => setHospital({ ...hospital, estado })} />
          <AuthField label="Prazo medio de pagamento" type="number" value={String(hospital.prazoMedioPagamento)} onChange={(prazoMedioPagamento) => setHospital({ ...hospital, prazoMedioPagamento: Number(prazoMedioPagamento) })} />
          <div className="mt-auto flex gap-3 pt-6">
            <button type="button" className="h-12 flex-1 rounded-full border border-slate-200 bg-white font-semibold text-slate-700" onClick={() => setStep(2)}>Voltar</button>
            <button type="submit" disabled={saving} className="h-12 flex-1 rounded-full bg-blue-600 font-semibold text-white disabled:opacity-50">{saving ? "Salvando..." : "Entrar no app"}</button>
          </div>
        </form>
      )}
    </AuthShell>
  )
}
