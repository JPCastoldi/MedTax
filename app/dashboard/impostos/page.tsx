"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
  Lightbulb,
} from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts"

interface SimulacaoResult {
  regime: string
  aliquotaEfetiva: number
  impostoMensal: number
  impostoAnual: number
  liquido: number
}

export default function ImpostosPage() {
  const [faturamento, setFaturamento] = useState(67000)
  const [folhaPagamento, setFolhaPagamento] = useState(21000)
  const [regime, setRegime] = useState("simples")
  const [anexo, setAnexo] = useState("anexo3")

  const fatorR = folhaPagamento / faturamento
  const fatorRPercent = (fatorR * 100).toFixed(1)

  // Cálculos do Simples Nacional
  const calcularSimplesNacional = (): SimulacaoResult => {
    let aliquota = 0
    let deducao = 0
    
    if (fatorR >= 0.28) {
      // Anexo III
      if (faturamento * 12 <= 180000) {
        aliquota = 0.06
        deducao = 0
      } else if (faturamento * 12 <= 360000) {
        aliquota = 0.112
        deducao = 9360
      } else if (faturamento * 12 <= 720000) {
        aliquota = 0.135
        deducao = 17640
      } else {
        aliquota = 0.16
        deducao = 35640
      }
    } else {
      // Anexo V
      if (faturamento * 12 <= 180000) {
        aliquota = 0.155
        deducao = 0
      } else if (faturamento * 12 <= 360000) {
        aliquota = 0.18
        deducao = 4500
      } else if (faturamento * 12 <= 720000) {
        aliquota = 0.195
        deducao = 9900
      } else {
        aliquota = 0.205
        deducao = 17100
      }
    }

    const aliquotaEfetiva = (((faturamento * 12 * aliquota) - deducao) / (faturamento * 12)) * 100
    const impostoMensal = faturamento * (aliquotaEfetiva / 100)
    const impostoAnual = impostoMensal * 12

    return {
      regime: "Simples Nacional",
      aliquotaEfetiva: Math.max(aliquotaEfetiva, 6),
      impostoMensal,
      impostoAnual,
      liquido: faturamento - impostoMensal,
    }
  }

  // Cálculos do Lucro Presumido
  const calcularLucroPresumido = (): SimulacaoResult => {
    const baseCalculo = faturamento * 0.32 // 32% para serviços
    const irpj = baseCalculo * 0.15
    const csll = baseCalculo * 0.09
    const pis = faturamento * 0.0065
    const cofins = faturamento * 0.03
    const iss = faturamento * 0.05 // 5% ISS

    const impostoMensal = irpj + csll + pis + cofins + iss
    const aliquotaEfetiva = (impostoMensal / faturamento) * 100

    return {
      regime: "Lucro Presumido",
      aliquotaEfetiva,
      impostoMensal,
      impostoAnual: impostoMensal * 12,
      liquido: faturamento - impostoMensal,
    }
  }

  const simplesResult = calcularSimplesNacional()
  const presumidoResult = calcularLucroPresumido()

  const comparisonData = [
    {
      name: "Simples Nacional",
      imposto: simplesResult.impostoMensal,
      aliquota: simplesResult.aliquotaEfetiva,
    },
    {
      name: "Lucro Presumido",
      imposto: presumidoResult.impostoMensal,
      aliquota: presumidoResult.aliquotaEfetiva,
    },
  ]

  const melhorOpcao = simplesResult.impostoMensal <= presumidoResult.impostoMensal ? "simples" : "presumido"
  const economia = Math.abs(simplesResult.impostoMensal - presumidoResult.impostoMensal)

  const projecaoAnual = [
    { mes: "Jan", simples: simplesResult.impostoMensal, presumido: presumidoResult.impostoMensal },
    { mes: "Fev", simples: simplesResult.impostoMensal * 1.05, presumido: presumidoResult.impostoMensal * 1.05 },
    { mes: "Mar", simples: simplesResult.impostoMensal * 0.95, presumido: presumidoResult.impostoMensal * 0.95 },
    { mes: "Abr", simples: simplesResult.impostoMensal * 1.1, presumido: presumidoResult.impostoMensal * 1.1 },
    { mes: "Mai", simples: simplesResult.impostoMensal * 1.02, presumido: presumidoResult.impostoMensal * 1.02 },
    { mes: "Jun", simples: simplesResult.impostoMensal, presumido: presumidoResult.impostoMensal },
    { mes: "Jul", simples: simplesResult.impostoMensal * 1.08, presumido: presumidoResult.impostoMensal * 1.08 },
    { mes: "Ago", simples: simplesResult.impostoMensal * 0.98, presumido: presumidoResult.impostoMensal * 0.98 },
    { mes: "Set", simples: simplesResult.impostoMensal * 1.12, presumido: presumidoResult.impostoMensal * 1.12 },
    { mes: "Out", simples: simplesResult.impostoMensal * 1.05, presumido: presumidoResult.impostoMensal * 1.05 },
    { mes: "Nov", simples: simplesResult.impostoMensal * 1.15, presumido: presumidoResult.impostoMensal * 1.15 },
    { mes: "Dez", simples: simplesResult.impostoMensal * 1.2, presumido: presumidoResult.impostoMensal * 1.2 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Simulador Tributário</h1>
        <p className="text-muted-foreground">Compare regimes e planeje seus impostos</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Parâmetros
            </CardTitle>
            <CardDescription>Configure os valores para simulação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Faturamento Mensal</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  type="number"
                  value={faturamento}
                  onChange={(e) => setFaturamento(Number(e.target.value))}
                  className="pl-10"
                />
              </div>
              <Slider
                value={[faturamento]}
                onValueChange={(value) => setFaturamento(value[0])}
                max={200000}
                min={5000}
                step={1000}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>R$ 5.000</span>
                <span>R$ 200.000</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Folha de Pagamento (Pró-labore + Salários)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  type="number"
                  value={folhaPagamento}
                  onChange={(e) => setFolhaPagamento(Number(e.target.value))}
                  className="pl-10"
                />
              </div>
              <Slider
                value={[folhaPagamento]}
                onValueChange={(value) => setFolhaPagamento(value[0])}
                max={faturamento * 0.5}
                min={1412}
                step={100}
              />
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Fator R</span>
                <Badge variant={fatorR >= 0.28 ? "default" : "destructive"} className={fatorR >= 0.28 ? "bg-success/10 text-success" : ""}>
                  {fatorRPercent}%
                </Badge>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all ${fatorR >= 0.28 ? "bg-success" : "bg-warning"}`}
                  style={{ width: `${Math.min(fatorR * 100, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {fatorR >= 0.28 ? (
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    Enquadrado no Anexo III (alíquotas menores)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-warning">
                    <AlertCircle className="h-3 w-3" />
                    Enquadrado no Anexo V (aumente a folha para 28%)
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommendation Card */}
          <Card className={`border-2 ${melhorOpcao === "simples" ? "border-success/50 bg-success/5" : "border-primary/50 bg-primary/5"}`}>
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-3 ${melhorOpcao === "simples" ? "bg-success/10" : "bg-primary/10"}`}>
                  <Lightbulb className={`h-6 w-6 ${melhorOpcao === "simples" ? "text-success" : "text-primary"}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Recomendação</h3>
                  <p className="text-sm text-muted-foreground">
                    O <span className="font-semibold">{melhorOpcao === "simples" ? "Simples Nacional" : "Lucro Presumido"}</span> é mais vantajoso. 
                    Economia de <span className="font-semibold text-success">R$ {economia.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês</span>
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                {((economia / faturamento) * 100).toFixed(1)}% de economia
              </Badge>
            </CardContent>
          </Card>

          {/* Comparison Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className={melhorOpcao === "simples" ? "ring-2 ring-success" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Simples Nacional</CardTitle>
                  {melhorOpcao === "simples" && (
                    <Badge className="bg-success/10 text-success">Melhor opção</Badge>
                  )}
                </div>
                <CardDescription>
                  {fatorR >= 0.28 ? "Anexo III" : "Anexo V"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Alíquota Efetiva</span>
                  <span className="text-xl font-bold">{simplesResult.aliquotaEfetiva.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Imposto Mensal</span>
                  <span className="text-xl font-bold text-warning">
                    R$ {simplesResult.impostoMensal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Imposto Anual</span>
                  <span className="font-semibold">
                    R$ {simplesResult.impostoAnual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Líquido Mensal</span>
                    <span className="text-xl font-bold text-success">
                      R$ {simplesResult.liquido.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={melhorOpcao === "presumido" ? "ring-2 ring-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Lucro Presumido</CardTitle>
                  {melhorOpcao === "presumido" && (
                    <Badge className="bg-primary/10 text-primary">Melhor opção</Badge>
                  )}
                </div>
                <CardDescription>Base 32% + Tributos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Alíquota Efetiva</span>
                  <span className="text-xl font-bold">{presumidoResult.aliquotaEfetiva.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Imposto Mensal</span>
                  <span className="text-xl font-bold text-warning">
                    R$ {presumidoResult.impostoMensal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Imposto Anual</span>
                  <span className="font-semibold">
                    R$ {presumidoResult.impostoAnual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Líquido Mensal</span>
                    <span className="text-xl font-bold text-success">
                      R$ {presumidoResult.liquido.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Impostos</CardTitle>
              <CardDescription>Visualização mensal dos valores por regime</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`, "Imposto"]}
                    />
                    <Bar dataKey="imposto" radius={[4, 4, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === "Simples Nacional" ? "oklch(0.55 0.15 160)" : "oklch(0.65 0.12 200)"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-chart-2" />
              Fator R
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O Fator R determina em qual anexo do Simples Nacional sua empresa se enquadra. 
              Se for maior ou igual a 28%, você fica no Anexo III com alíquotas menores.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Anexo III
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Alíquotas iniciais a partir de 6%. Ideal para empresas com folha de pagamento 
              representativa (28% ou mais do faturamento).
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              Anexo V
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Alíquotas iniciais a partir de 15,5%. Aplicado quando o Fator R é menor que 28%. 
              Pode ser menos vantajoso que o Lucro Presumido.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
