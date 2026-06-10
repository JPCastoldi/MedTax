"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Building2, CalendarDays, ChevronRight, FileText, Wallet } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { DashboardData } from "@/lib/types"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch("/api/dashboard").then((response) => response.json()).then(setData)
  }, [])

  if (!data) return <p>Carregando dashboard...</p>

  const { kpis } = data
  const faturadoPercent = kpis.valorFaturado > 0 ? 100 : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={CalendarDays} title="Plantoes do mes" value={String(kpis.plantoesMes)} />
        <Metric icon={Wallet} title="A receber no mes" value={`R$ ${kpis.valorRecebido.toLocaleString("pt-BR")}`} />
        <Metric icon={Wallet} title="Pendente de nota" value={`R$ ${kpis.pendenteNota.toLocaleString("pt-BR")}`} />
        <Metric icon={FileText} title="Impostos estimados" value={`R$ ${kpis.impostosEstimados.toLocaleString("pt-BR")}`} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Previsao tributaria do mes</h2>
            <p className="text-sm text-muted-foreground">Calculada sobre notas emitidas/recebidas no mes.</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <strong>Impostos: R$ {kpis.impostosEstimados.toLocaleString("pt-BR")}</strong>
            <strong>Liquido: R$ {kpis.liquidoEstimado.toLocaleString("pt-BR")}</strong>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Status financeiro</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.pieData} dataKey="value" innerRadius={50} outerRadius={80}>
                    {data.pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <Progress value={faturadoPercent} />
            <p className="mt-2 text-sm text-muted-foreground">Valores reconhecidos pela data de emissão/recebimento da nota</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Proximos plantoes</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/dashboard/plantoes">Agenda <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
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
