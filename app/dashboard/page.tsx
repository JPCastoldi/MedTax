"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Building2, CalendarDays, ChevronRight, FileText, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { DashboardData } from "@/lib/types"

function currentMonth() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  useEffect(() => {
    setData(null)
    fetch(`/api/dashboard?month=${selectedMonth}`).then((response) => response.json()).then(setData)
  }, [selectedMonth])

  if (!data) return <p>Carregando dashboard...</p>

  const { kpis } = data

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visualize recebimentos, notas e impostos por mes.</p>
        </div>
        <Input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="w-full sm:w-44" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={Wallet} title="Recebido no mes" value={`R$ ${kpis.valorRecebido.toLocaleString("pt-BR")}`} />
        <Metric icon={Wallet} title="A receber no mes" value={`R$ ${kpis.valorAReceber.toLocaleString("pt-BR")}`} />
        <Metric icon={FileText} title="Imposto a pagar" value={`R$ ${kpis.impostosEstimados.toLocaleString("pt-BR")}`} />
      </div>

      <Card className="border-emerald-100 bg-emerald-50/60">
        <CardContent className="grid gap-5 py-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-semibold text-emerald-950">Guia rapido do mes piloto</h2>
            <div className="mt-3 grid gap-3 text-sm text-emerald-900 md:grid-cols-4">
              <PilotStep step="1" text="Cadastre hospitais." />
              <PilotStep step="2" text="Lance os plantoes no calendario." />
              <PilotStep step="3" text="Mude para faturado e gere nota." />
              <PilotStep step="4" text="Marque recebido quando cair o pagamento." />
            </div>
            <p className="mt-3 text-xs text-emerald-800">
              Imposto a pagar e calculado apenas sobre recebidos com nota vinculada. Recebido direto sem nota aparece no caixa, mas nao entra no imposto.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm"><Link href="/dashboard/plantoes"><CalendarDays className="mr-2 h-4 w-4" />Abrir agenda</Link></Button>
            <Button asChild size="sm" variant="outline"><Link href="/dashboard/notas"><FileText className="mr-2 h-4 w-4" />Ver notas</Link></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Previsao tributaria do mes</h2>
            <p className="text-sm text-muted-foreground">Calculada apenas sobre recebidos com nota vinculada no mes selecionado.</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <strong>{kpis.tributoLabel}: R$ {kpis.impostosEstimados.toLocaleString("pt-BR")}</strong>
            <strong>Liquido: R$ {kpis.liquidoEstimado.toLocaleString("pt-BR")}</strong>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader><CardTitle>Liquido estimado</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-700">
              R$ {kpis.liquidoEstimado.toLocaleString("pt-BR")}
            </div>
            <p className="mt-3 text-sm text-emerald-800">
              Recebido no mes menos {kpis.tributoLabel.toLowerCase()}.
            </p>
            <div className="mt-5 grid gap-2 text-sm">
              <div className="flex justify-between"><span>Recebido</span><strong>R$ {kpis.valorRecebido.toLocaleString("pt-BR")}</strong></div>
              <div className="flex justify-between"><span>Imposto a pagar</span><strong>R$ {kpis.impostosEstimados.toLocaleString("pt-BR")}</strong></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Plantoes pendentes</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard/plantoes">Agenda <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.proximosPlantoes.length === 0 && <p className="text-sm text-muted-foreground">Nenhum plantao pendente.</p>}
            {data.proximosPlantoes.map((plantao) => (
              <div key={plantao.id} className="rounded-md border p-3">
                <p className="font-medium">{plantao.hospitalNome}</p>
                <p className="text-sm text-muted-foreground">{plantao.data} as {plantao.horaInicio} | R$ {plantao.valor.toLocaleString("pt-BR")}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ranking de hospitais</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.hospitalRanking.map((hospital, index) => (
              <div key={hospital.nome} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: hospital.cor }}>{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium">{hospital.nome}</p>
                  <p className="text-sm text-muted-foreground">{hospital.plantoes} plantoes</p>
                </div>
                <strong>R$ {hospital.faturado.toLocaleString("pt-BR")}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Button asChild><Link href="/dashboard/hospitais"><Building2 className="mr-2 h-4 w-4" />Gerenciar hospitais</Link></Button>
    </div>
  )
}

function Metric({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="text-2xl font-bold">{value}</CardContent>
    </Card>
  )
}

function PilotStep({ step, text }: { step: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">{step}</span>
      <span>{text}</span>
    </div>
  )
}
