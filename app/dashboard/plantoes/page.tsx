"use client"

import { useEffect, useMemo, useState } from "react"
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays, FileText, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Hospital, Plantao, PlantaoStatus } from "@/lib/types"

const emptyForm = {
  hospitalId: "",
  data: format(new Date(), "yyyy-MM-dd"),
  horaInicio: "19:00",
  horaFim: "07:00",
  especialidade: "Clinica Geral",
  valor: 1200,
  status: "agendado" as PlantaoStatus,
}

export default function PlantoesPage() {
  const [hospitais, setHospitais] = useState<Hospital[]>([])
  const [plantoes, setPlantoes] = useState<Plantao[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const currentDate = new Date(2026, 5, 1)

  async function load() {
    const [hospitaisResponse, plantoesResponse] = await Promise.all([
      fetch("/api/hospitais"),
      fetch("/api/plantoes"),
    ])
    const hospitalsData = await hospitaisResponse.json()
    setHospitais(hospitalsData)
    setPlantoes(await plantoesResponse.json())
    setForm((current) => ({ ...current, hospitalId: current.hospitalId || hospitalsData[0]?.id || "" }))
  }

  useEffect(() => {
    load()
  }, [])

  const monthDays = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }), [])
  const realizadosPorHospital = useMemo(() => {
    return hospitais
      .map((hospital) => ({
        hospital,
        plantoes: plantoes.filter((p) => p.hospitalId === hospital.id && p.status === "realizado"),
      }))
      .filter((item) => item.plantoes.length > 0)
  }, [hospitais, plantoes])

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

  async function gerarNota(hospitalId: string) {
    await fetch("/api/notas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hospitalId, competencia: "06/2026" }),
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

  const stats = {
    total: plantoes.length,
    previsto: plantoes.reduce((sum, p) => sum + p.valor, 0),
    faturado: plantoes.filter((p) => ["faturado", "recebido"].includes(p.status)).reduce((sum, p) => sum + p.valor, 0),
    recebidos: plantoes.filter((p) => p.status === "recebido").reduce((sum, p) => sum + p.valor, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda de Plantoes</h1>
          <p className="text-muted-foreground">Plantoes persistidos e calendario funcional.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Plantoes" value={String(stats.total)} />
        <Metric title="Previsto" value={`R$ ${stats.previsto.toLocaleString("pt-BR")}`} />
        <Metric title="Faturado" value={`R$ ${stats.faturado.toLocaleString("pt-BR")}`} />
        <Metric title="Recebido" value={`R$ ${stats.recebidos.toLocaleString("pt-BR")}`} />
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

      {realizadosPorHospital.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Geracao de faturamento por hospital</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {realizadosPorHospital.map(({ hospital, plantoes }) => (
              <div key={hospital.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{hospital.nome}</p>
                  <p className="text-sm text-muted-foreground">{plantoes.length} plantoes, R$ {plantoes.reduce((s, p) => s + p.valor, 0).toLocaleString("pt-BR")}</p>
                </div>
                <Button onClick={() => gerarNota(hospital.id)}><FileText className="mr-2 h-4 w-4" />Gerar nota</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />Junho 2026</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-7">
          {monthDays.map((day) => {
            const dayPlantoes = plantoes.filter((p) => p.data === format(day, "yyyy-MM-dd"))
            return (
              <div key={day.toISOString()} className="min-h-28 rounded-md border p-2">
                <p className="mb-2 text-sm font-medium">{format(day, "d EEE", { locale: ptBR })}</p>
                <div className="space-y-1">
                  {dayPlantoes.map((plantao) => (
                    <button key={plantao.id} className="block w-full rounded px-2 py-1 text-left text-xs text-white" style={{ backgroundColor: plantao.hospitalCor }} onClick={() => edit(plantao)}>
                      {plantao.horaInicio} {plantao.hospitalNome}
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
