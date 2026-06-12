"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, FileSpreadsheet, RefreshCw } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DashboardData, Empresa, Hospital, NotaFiscal, Plantao } from "@/lib/types"

type Report = {
  dashboard: DashboardData
  hospitais: Hospital[]
  plantoes: Plantao[]
  notas: NotaFiscal[]
  empresas: Empresa[]
}

export default function RelatoriosPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [tipo, setTipo] = useState("plantoes")

  async function load() {
    const response = await fetch("/api/relatorios")
    setReport(await response.json())
  }

  useEffect(() => {
    load()
  }, [])

  const chartData = useMemo(() => {
    if (!report) return []
    return report.hospitais.map((hospital) => ({
      name: hospital.nome,
      faturado: hospital.totalFaturado,
      plantoes: hospital.plantoesRealizados,
    }))
  }, [report])

  function download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  function exportCsv() {
    if (!report) return
    const rows = tipo === "notas"
      ? report.notas.map((nota) => [nota.numero, nota.tomador, nota.dataEmissao, nota.competencia, nota.valor, nota.status])
      : tipo === "empresas"
        ? report.empresas.map((empresa) => [empresa.cnpj, empresa.razaoSocial, empresa.regimeTributario, empresa.fatorR, empresa.situacao])
        : report.plantoes.map((plantao) => [plantao.data, plantao.hospitalNome, plantao.especialidade, plantao.valor, labelStatus(plantao.status)])
    const header = tipo === "notas"
      ? ["numero", "tomador", "dataEmissao", "competencia", "valor", "status"]
      : tipo === "empresas"
        ? ["cnpj", "razaoSocial", "regime", "fatorR", "situacao"]
        : ["data", "hospital", "especialidade", "valor", "status"]
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")
    download(`medtax-${tipo}.csv`, csv, "text/csv;charset=utf-8")
  }

  function exportJson() {
    if (!report) return
    download("medtax-relatorio-completo.json", JSON.stringify(report, null, 2), "application/json")
  }

  if (!report) return <p>Carregando relatorios...</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatorios</h1>
          <p className="text-muted-foreground">Indicadores e exportacoes baseados no banco/dados do app.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="plantoes">Plantoes</SelectItem>
              <SelectItem value="notas">Notas</SelectItem>
              <SelectItem value="empresas">Empresas</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load}><RefreshCw className="mr-2 h-4 w-4" />Atualizar</Button>
          <Button onClick={exportCsv}><Download className="mr-2 h-4 w-4" />CSV</Button>
          <Button variant="outline" onClick={exportJson}><FileSpreadsheet className="mr-2 h-4 w-4" />JSON</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Hospitais" value={String(report.hospitais.length)} />
        <Metric title="Plantoes" value={String(report.plantoes.length)} />
        <Metric title="Notas" value={String(report.notas.length)} />
        <Metric title="Recebido no mes" value={`R$ ${report.dashboard.kpis.valorRecebido.toLocaleString("pt-BR")}`} />
      </div>

      <Card>
        <CardHeader><CardTitle>Faturamento por hospital</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
              <Bar dataKey="faturado" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Resumo operacional</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {report.hospitais.map((hospital) => (
            <div key={hospital.id} className="rounded-md border p-3">
              <p className="font-medium">{hospital.nome}</p>
              <p className="text-sm text-muted-foreground">{hospital.plantoesRealizados} plantoes | R$ {hospital.totalFaturado.toLocaleString("pt-BR")} recebidos</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Previa do relatorio</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {tipo === "plantoes" && (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left"><th className="py-2">Data</th><th>Hospital</th><th>Especialidade</th><th>Valor</th><th>Status</th></tr></thead>
              <tbody>
                {report.plantoes.map((plantao) => (
                  <tr key={plantao.id} className="border-b last:border-0">
                    <td className="py-2">{plantao.data}</td>
                    <td>{plantao.hospitalNome}</td>
                    <td>{plantao.especialidade}</td>
                    <td>R$ {plantao.valor.toLocaleString("pt-BR")}</td>
                    <td>{labelStatus(plantao.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tipo === "notas" && (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left"><th className="py-2">Numero</th><th>Tomador</th><th>Emissao</th><th>Competencia</th><th>Valor</th></tr></thead>
              <tbody>
                {report.notas.map((nota) => (
                  <tr key={nota.id} className="border-b last:border-0">
                    <td className="py-2">{nota.numero}</td>
                    <td>{nota.tomador}</td>
                    <td>{nota.dataEmissao}</td>
                    <td>{nota.competencia}</td>
                    <td>R$ {nota.valor.toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tipo === "empresas" && (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left"><th className="py-2">CNPJ</th><th>Razao social</th><th>Regime</th><th>Fator R</th><th>Situacao</th></tr></thead>
              <tbody>
                {report.empresas.map((empresa) => (
                  <tr key={empresa.id} className="border-b last:border-0">
                    <td className="py-2">{empresa.cnpj}</td>
                    <td>{empresa.razaoSocial}</td>
                    <td>{empresa.regimeTributario}</td>
                    <td>{empresa.fatorR}%</td>
                    <td>{empresa.situacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{value}</CardContent></Card>
}

function labelStatus(status: Plantao["status"]) {
  if (status === "recebido") return "Recebido"
  if (status === "faturado") return "Faturado"
  return "Pendente"
}
