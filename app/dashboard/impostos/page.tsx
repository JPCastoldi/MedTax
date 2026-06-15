"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Calculator, CheckCircle2, Info, Lightbulb, TrendingDown, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

type SimulacaoResult = {
  regime: string
  aliquotaEfetiva: number
  impostoMensal: number
  impostoAnual: number
  liquido: number
}

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
}

export default function ImpostosPage() {
  const [faturamento, setFaturamento] = useState(30000)
  const [folhaPagamento, setFolhaPagamento] = useState(9000)

  const fatorR = faturamento > 0 ? folhaPagamento / faturamento : 0
  const fatorRPercent = fatorR * 100

  const simplesResult = useMemo<SimulacaoResult>(() => {
    const receitaAnual = faturamento * 12
    const anexoIII = fatorR >= 0.28
    let aliquota = anexoIII ? 0.06 : 0.155
    let deducao = 0

    if (anexoIII) {
      if (receitaAnual > 720000) { aliquota = 0.16; deducao = 35640 }
      else if (receitaAnual > 360000) { aliquota = 0.135; deducao = 17640 }
      else if (receitaAnual > 180000) { aliquota = 0.112; deducao = 9360 }
    } else {
      if (receitaAnual > 720000) { aliquota = 0.205; deducao = 17100 }
      else if (receitaAnual > 360000) { aliquota = 0.195; deducao = 9900 }
      else if (receitaAnual > 180000) { aliquota = 0.18; deducao = 4500 }
    }

    const aliquotaEfetiva = Math.max(((receitaAnual * aliquota - deducao) / receitaAnual) * 100, anexoIII ? 6 : 15.5)
    const impostoMensal = faturamento * (aliquotaEfetiva / 100)
    return {
      regime: anexoIII ? "Simples Nacional - Anexo III" : "Simples Nacional - Anexo V",
      aliquotaEfetiva,
      impostoMensal,
      impostoAnual: impostoMensal * 12,
      liquido: faturamento - impostoMensal,
    }
  }, [faturamento, fatorR])

  const presumidoResult = useMemo<SimulacaoResult>(() => {
    const baseCalculo = faturamento * 0.32
    const impostoMensal =
      baseCalculo * 0.15 +
      baseCalculo * 0.09 +
      faturamento * 0.0065 +
      faturamento * 0.03 +
      faturamento * 0.05
    return {
      regime: "Lucro Presumido",
      aliquotaEfetiva: faturamento > 0 ? (impostoMensal / faturamento) * 100 : 0,
      impostoMensal,
      impostoAnual: impostoMensal * 12,
      liquido: faturamento - impostoMensal,
    }
  }, [faturamento])

  const melhorOpcao = simplesResult.impostoMensal <= presumidoResult.impostoMensal ? simplesResult : presumidoResult
  const economia = Math.abs(simplesResult.impostoMensal - presumidoResult.impostoMensal)
  const comparisonData = [
    { name: "Simples", imposto: simplesResult.impostoMensal },
    { name: "Presumido", imposto: presumidoResult.impostoMensal },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Simulador Tributario</h1>
        <p className="text-muted-foreground">Compare Simples Nacional e Lucro Presumido com base no faturamento mensal.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" />Parametros</CardTitle>
            <CardDescription>Ajuste os valores para simular o imposto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <MoneyField label="Faturamento mensal" value={faturamento} onChange={setFaturamento} />
            <Slider value={[faturamento]} min={5000} max={200000} step={1000} onValueChange={(value) => setFaturamento(value[0])} />

            <MoneyField label="Folha / pro-labore mensal" value={folhaPagamento} onChange={setFolhaPagamento} />
            <Slider value={[folhaPagamento]} min={0} max={Math.max(faturamento * 0.6, 1000)} step={500} onValueChange={(value) => setFolhaPagamento(value[0])} />

            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Fator R</span>
                <Badge variant={fatorR >= 0.28 ? "default" : "secondary"}>{fatorRPercent.toFixed(1)}%</Badge>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${Math.min(fatorRPercent, 100)}%` }} />
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                {fatorR >= 0.28 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-amber-600" />}
                {fatorR >= 0.28 ? "Enquadramento estimado no Anexo III." : "Abaixo de 28%, tende ao Anexo V."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-emerald-600/10 p-3"><Lightbulb className="h-6 w-6 text-emerald-700" /></span>
                <div>
                  <h2 className="font-semibold text-emerald-950">Melhor estimativa: {melhorOpcao.regime}</h2>
                  <p className="text-sm text-emerald-800">Economia aproximada de {money(economia)} por mes.</p>
                </div>
              </div>
              <Badge className="bg-emerald-600">{((economia / Math.max(faturamento, 1)) * 100).toFixed(1)}% de diferenca</Badge>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <ResultCard result={simplesResult} highlighted={melhorOpcao === simplesResult} />
            <ResultCard result={presumidoResult} highlighted={melhorOpcao === presumidoResult} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Comparativo mensal</CardTitle>
              <CardDescription>Valores estimados de imposto por regime.</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `R$${(Number(value) / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => money(value)} />
                  <Bar dataKey="imposto" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard icon={Info} title="Estimativa" text="Os valores sao aproximados e servem para planejamento. A apuracao final depende do contador e da prefeitura." />
        <InfoCard icon={TrendingUp} title="Anexo III" text="Com Fator R igual ou acima de 28%, a empresa tende a pagar aliquotas menores no Simples." />
        <InfoCard icon={TrendingDown} title="Anexo V" text="Com Fator R abaixo de 28%, o Simples pode ficar mais caro e deve ser comparado com Lucro Presumido." />
      </div>
    </div>
  )
}

function MoneyField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
        <Input type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="pl-10" />
      </div>
    </div>
  )
}

function ResultCard({ result, highlighted }: { result: SimulacaoResult; highlighted: boolean }) {
  return (
    <Card className={highlighted ? "border-emerald-500 ring-1 ring-emerald-500" : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          {result.regime}
          {highlighted && <Badge className="bg-emerald-600">Melhor</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row label="Aliquota efetiva" value={`${result.aliquotaEfetiva.toFixed(2)}%`} />
        <Row label="Imposto mensal" value={money(result.impostoMensal)} />
        <Row label="Imposto anual" value={money(result.impostoAnual)} />
        <div className="border-t pt-3"><Row label="Liquido mensal" value={money(result.liquido)} strong /></div>
      </CardContent>
    </Card>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{label}</span><span className={strong ? "font-bold text-emerald-700" : "font-semibold"}>{value}</span></div>
}

function InfoCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-emerald-600" />{title}</CardTitle>
      </CardHeader>
      <CardContent><p className="text-sm text-muted-foreground">{text}</p></CardContent>
    </Card>
  )
}
