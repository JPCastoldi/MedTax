"use client"

import { useEffect, useMemo, useState } from "react"
import { addMonths, eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays, ChevronLeft, ChevronRight, FileText, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Hospital, NotaFiscal, Plantao, PlantaoStatus } from "@/lib/types"

const today = new Date()

const emptyForm = {
  hospitalId: "",
  data: format(today, "yyyy-MM-dd"),
  horaInicio: "19:00",
  horaFim: "07:00",
  especialidade: "Clinica Geral",
  valor: 1200,
  status: "agendado" as PlantaoStatus,
}

export default function PlantoesPage() {
  const [hospitais, setHospitais] = useState<Hospital[]>([])
  const [plantoes, setPlantoes] = useState<Plantao[]>([])
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(startOfMonth(today))
  const [billingHospitalId, setBillingHospitalId] = useState("")
  const [billingPlantaoIds, setBillingPlantaoIds] = useState<string[]>([])
  const [dataEmissao, setDataEmissao] = useState(format(today, "yyyy-MM-dd"))
  const [competencia, setCompetencia] = useState(format(today, "yyyy-MM"))

  async function load() {
    const [hospitaisResponse, plantoesResponse, notasResponse] = await Promise.all([
      fetch("/api/hospitais"),
      fetch("/api/plantoes"),
      fetch("/api/notas"),
    ])
    const hospitalsData = await hospitaisResponse.json()
    const plantoesData = await plantoesResponse.json()
    setHospitais(hospitalsData)
    setPlantoes(plantoesData)
    setNotas(await notasResponse.json())
    setForm((current) => ({ ...current, hospitalId: current.hospitalId || hospitalsData[0]?.id || "" }))
  }

  useEffect(() => {
    load()
  }, [])

  const monthDays = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }),
    [currentDate]
  )

  const pendentesPorHospital = useMemo(() => {
    return hospitais
      .map((hospital) => ({
        hospital,
        plantoes: plantoes.filter((plantao) => plantao.hospitalId === hospital.id && plantao.status === "realizado"),
      }))
      .filter((item) => item.plantoes.length > 0)
  }, [hospitais, plantoes])

  const selectedBillingGroup = pendentesPorHospital.find((item) => item.hospital.id === billingHospitalId) ?? pendentesPorHospital[0]

  useEffect(() => {
    if (!selectedBillingGroup) {
      setBillingHospitalId("")
      setBillingPlantaoIds([])
      return
    }
    if (!billingHospitalId) {
      setBillingHospitalId(selectedBillingGroup.hospital.id)
    }
    setBillingPlantaoIds((current) => {
      const validIds = selectedBillingGroup.plantoes.map((plantao) => plantao.id)
      const currentValid = current.filter((id) => validIds.includes(id))
      return currentValid.length > 0 ? currentValid : validIds
    })
  }, [billingHospitalId, selectedBillingGroup])

  async function save() {
    const url = editingId ? `/api/plantoes/${editingId}` : "/api/plantoes"
    await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setEditingId(null)
    setForm({ ...emptyForm, hospitalId: hospitais[0]?.id || "" })
    await load()
  }

  async function remove(id: string) {
    await fetch(`/api/plantoes/${id}`, { method: "DELETE" })
    await load()
  }

  async function gerarNota() {
    if (!selectedBillingGroup || billingPlantaoIds.length === 0) return
    const [year, month] = competencia.split("-")
    await fetch("/api/notas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hospitalId: selectedBillingGroup.hospital.id,
        plantaoIds: billingPlantaoIds,
        dataEmissao,
        competencia: `${month}/${year}`,
      }),
    })
    await load()
  }

  function edit(plantao: Plantao) {
    setEditingId(plantao.id)
    setForm({
      hospitalId: plantao.hospitalId,
      data: plantao.data,
      horaInicio: plantao.horaInicio,
      horaFim: plantao.horaFim,
      especialidade: plantao.especialidade,
      valor: plantao.valor,
      status: plantao.status,
    })
  }

  function toggleBillingPlantao(id: string) {
    setBillingPlantaoIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const monthPlantoes = plantoes.filter((plantao) => plantao.data.startsWith(format(currentDate, "yyyy-MM")))
  const monthNotas = notas.filter((nota) => nota.dataEmissao.startsWith(format(currentDate, "yyyy-MM")))
  const stats = {
    total: monthPlantoes.length,
    previsto: monthPlantoes.reduce((sum, p) => sum + p.valor, 0),
    faturado: monthNotas.filter((nota) => nota.status === "emitida").reduce((sum, nota) => sum + nota.valor, 0),
    recebidos: monthNotas.filter((nota) => nota.status === "emitida").reduce((sum, nota) => sum + nota.valor, 0),
  }

  const selectedTotal = selectedBillingGroup?.plantoes
    .filter((plantao) => billingPlantaoIds.includes(plantao.id))
    .reduce((sum, plantao) => sum + plantao.valor, 0) ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda de Plantoes</h1>
          <p className="text-muted-foreground">Navegue por qualquer mes/ano e fature plantoes quando a nota sair.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Input
            type="month"
            value={format(currentDate, "yyyy-MM")}
            onChange={(event) => setCurrentDate(startOfMonth(parseISO(`${event.target.value}-01`)))}
            className="w-40"
          />
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Plantoes no mes" value={String(stats.total)} />
        <Metric title="Previsto no mes" value={`R$ ${stats.previsto.toLocaleString("pt-BR")}`} />
        <Metric title="Notas emitidas no mes" value={`R$ ${stats.faturado.toLocaleString("pt-BR")}`} />
        <Metric title="Recebimento previsto" value={`R$ ${stats.recebidos.toLocaleString("pt-BR")}`} />
      </div>

      <Card>
        <CardHeader><CardTitle>{editingId ? "Editar plantao" : "Novo plantao"}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Hospital</Label>
            <Select value={form.hospitalId} onValueChange={(hospitalId) => setForm({ ...form, hospitalId })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{hospitais.map((h) => <SelectItem key={h.id} value={h.id}>{h.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Field label="Data" type="date" value={form.data} onChange={(data) => setForm({ ...form, data })} />
          <Field label="Inicio" type="time" value={form.horaInicio} onChange={(horaInicio) => setForm({ ...form, horaInicio })} />
          <Field label="Fim" type="time" value={form.horaFim} onChange={(horaFim) => setForm({ ...form, horaFim })} />
          <Field label="Especialidade" value={form.especialidade} onChange={(especialidade) => setForm({ ...form, especialidade })} />
          <Field label="Valor" type="number" value={String(form.valor)} onChange={(valor) => setForm({ ...form, valor: Number(valor) })} />
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(status: PlantaoStatus) => setForm({ ...form, status })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
                <SelectItem value="faturado">Faturado</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={save}><Plus className="mr-2 h-4 w-4" />Salvar</Button>
            {editingId && <Button variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Faturamento por hospital</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {pendentesPorHospital.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum plantao realizado pendente de nota.</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Hospital</Label>
                  <Select value={selectedBillingGroup?.hospital.id} onValueChange={(hospitalId) => { setBillingHospitalId(hospitalId); setBillingPlantaoIds([]) }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {pendentesPorHospital.map(({ hospital, plantoes }) => (
                        <SelectItem key={hospital.id} value={hospital.id}>{hospital.nome} ({plantoes.length})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Data de emissao" type="date" value={dataEmissao} onChange={setDataEmissao} />
                <Field label="Competencia da nota" type="month" value={competencia} onChange={setCompetencia} />
                <div className="flex items-end">
                  <Button className="w-full" onClick={gerarNota}><FileText className="mr-2 h-4 w-4" />Gerar nota</Button>
                </div>
              </div>

              <div className="rounded-md border">
                {selectedBillingGroup?.plantoes.map((plantao) => (
                  <label key={plantao.id} className="flex cursor-pointer items-center justify-between gap-3 border-b p-3 last:border-b-0">
                    <span className="flex items-center gap-3">
                      <input type="checkbox" checked={billingPlantaoIds.includes(plantao.id)} onChange={() => toggleBillingPlantao(plantao.id)} />
                      <span>
                        <strong>{format(parseISO(plantao.data), "dd/MM/yyyy")}</strong>
                        <span className="ml-2 text-sm text-muted-foreground">{plantao.especialidade} | {plantao.horaInicio}-{plantao.horaFim}</span>
                      </span>
                    </span>
                    <span className="font-semibold">R$ {plantao.valor.toLocaleString("pt-BR")}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Total selecionado: <strong>R$ {selectedTotal.toLocaleString("pt-BR")}</strong>. O valor entra no mês da data de emissão/recebimento, mesmo que os plantões sejam de meses anteriores.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />{format(currentDate, "MMMM yyyy", { locale: ptBR })}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-7">
          {monthDays.map((day) => {
            const dayPlantoes = plantoes.filter((p) => p.data === format(day, "yyyy-MM-dd"))
            return (
              <div key={day.toISOString()} className="min-h-28 rounded-md border p-2">
                <p className="mb-2 text-sm font-medium">{format(day, "d EEE", { locale: ptBR })}</p>
                <div className="space-y-1">
                  {dayPlantoes.map((plantao) => (
                    <button key={plantao.id} className="block w-full rounded px-2 py-1 text-left text-xs text-white" style={{ backgroundColor: plantao.hospitalCor }} onClick={() => edit(plantao)}>
                      {plantao.horaInicio} {plantao.hospitalNome} ({plantao.status})
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lista de plantoes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {plantoes.map((plantao) => (
            <div key={plantao.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{plantao.hospitalNome} - {format(parseISO(plantao.data), "dd/MM/yyyy")}</p>
                <p className="text-sm text-muted-foreground">{plantao.especialidade} | {plantao.horaInicio}-{plantao.horaFim} | {plantao.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">R$ {plantao.valor.toLocaleString("pt-BR")}</span>
                <Button variant="ghost" size="icon" onClick={() => remove(plantao.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{value}</CardContent></Card>
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></div>
}
