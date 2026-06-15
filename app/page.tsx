import Link from "next/link"
import { Building2, CalendarDays, FileText, ShieldCheck, Wallet } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-50">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">M</span>
            MedTax para medicos PJ
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Controle plantoes, notas e impostos sem perder o fio financeiro.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              O MedTax organiza a rotina do medico plantonista: hospitais, plantoes, faturamento por tomador, notas fiscais, recebimentos e previsao de impostos em um painel simples.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/cadastro" className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-600 px-6 font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              Criar conta
            </Link>
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-full border border-emerald-200 bg-white px-6 font-semibold text-emerald-700 transition hover:bg-emerald-50">
              Entrar
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Feature icon={CalendarDays} title="Agenda clara" text="Veja plantoes por mes, hospital e status." />
            <Feature icon={FileText} title="Notas por hospital" text="Gere faturamento quando o plantao estiver faturado." />
            <Feature icon={Wallet} title="Recebimentos" text="Separe recebido, a receber e imposto a pagar." />
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-900/10">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-200">Dashboard mensal</p>
                <h2 className="mt-1 text-2xl font-semibold">Junho 2026</h2>
              </div>
              <ShieldCheck className="h-8 w-8 text-emerald-300" />
            </div>

            <div className="mt-6 grid gap-3">
              <PreviewCard label="Recebido no mes" value="R$ 12.400" tone="emerald" />
              <PreviewCard label="A receber" value="R$ 4.800" tone="amber" />
              <PreviewCard label="Imposto a pagar" value="R$ 744" tone="slate" />
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 p-4">
              <Building2 className="mb-3 h-5 w-5 text-emerald-600" />
              <p className="font-semibold text-slate-950">Hospitais separados</p>
              <p className="mt-1 text-sm text-slate-500">Cada medico visualiza apenas seus hospitais, empresas e plantoes.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <FileText className="mb-3 h-5 w-5 text-emerald-600" />
              <p className="font-semibold text-slate-950">Fluxo fiscal</p>
              <p className="mt-1 text-sm text-slate-500">Nota emitida, valor a receber e pagamento ficam em etapas diferentes.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function Feature({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <Icon className="mb-3 h-5 w-5 text-emerald-600" />
      <p className="font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  )
}

function PreviewCard({ label, value, tone }: { label: string; value: string; tone: "emerald" | "amber" | "slate" }) {
  const toneClass = {
    emerald: "bg-emerald-500/15 text-emerald-100",
    amber: "bg-amber-500/15 text-amber-100",
    slate: "bg-white/10 text-slate-100",
  }[tone]

  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClass}`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}
