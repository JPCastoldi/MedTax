"use client"

import { useEffect, useMemo, useState } from "react"
import { addMonths, eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays, ChevronLeft, ChevronRight, FileText, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Hospital, NotaFiscal, Plantao, PlantaoStatus } from "@/lib/types"

type UiStatus = "pendente" | "faturado" | "recebido"

const today = new Date()
const statusLabels: Record<UiStatus, string> = {
  pendente: "Pendente",
  faturado: "Faturado",
  recebido: "Recebido",
}

const uiToApiStatus: Record<UiStatus, PlantaoStatus> = {
  pendente: "realizado",
  faturado: "faturado",
  recebido: "recebido",
}

function apiToUiStatus(status: PlantaoStatus): UiStatus {
  if (status === "recebido") return "recebido"
  if (status === "faturado") return "faturado"
  return "pendente"
}

const emptyForm = {
  hospitalId: "",
  data: format(today, "yyyy-MM-dd"),
  horaInicio: "19:00",
  horaFim: "07:00",
  especialidade: "Clinica Geral",
  valor: 1200,
  status: "pendente" as UiStatus,
}

export default function PlantoesPage() {
  const [hospitais, setHospitais] = useState<Hospital[]>([])
  const [plantoes, setPlantoes] = useState<Plantao[]>([])
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(startOfMonth(today))
  const [selectedDay, setSelectedDay] = useState(format(today, "yyyy-MM-dd"))
  const [billingHospitalId, setBillingHospitalId] = useState("")
  const [billingPlantaoIds, setBillingPlantaoIds] = useState<string[]>([])
  const [dataEmissao, setDataEmissao] = useState(format(today, "yyyy-MM-dd"))
  const [competencia, setCompetencia] = useState(format(today, "yyyy-MM"))
  const [bulkHospitalId, setBulkHospitalId] = useState("")
  const [bulkStatus, setBulkStatus] = useState<UiStatus>("faturado")
  const [billingMessage, setBillingMessage] = useState("")

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
    setBulkHospitalId((current) => current || hospitalsData[0]?.id || "")
  }

  useEffect(() => {
    load()
  }, [])

  const monthKey = format(currentDate, "yyyy-MM")
  const monthDays = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }),
    [currentDate]
  )
  const monthPlantoes = useMemo(() => plantoes.filter((plantao) => plantao.data.startsWith(monthKey)), [plantoes, monthKey])
  const selectedDayPlantoes = plantoes.filter((plantao) => plantao.data === selectedDay)

  const prontosParaNotaPorHospital = useMemo(() => {
    return hospitais
      .map((hospital) => ({
        hospital,
        plantoes: plantoes.filter((plantao) =>
          plantao.hospitalId === hospital.id &&
          !plantao.notaFiscalId &&
          (plantao.status === "realizado" || plantao.status === "faturado")
        ),
      }))
      .filter((item) => item.plantoes.length > 0)
  }, [hospitais, plantoes])

  const selectedBillingGroup = prontosParaNotaPorHospital.find((item) => item.hospital.id === billingHospitalId) ?? prontosParaNotaPorHospital[0]

  useEffect(() => {
    if (!selectedBillingGroup) {
      setBillingHospitalId("")
      setBillingPlantaoIds([])
      return
    }
    if (!billingHospitalId) setBillingHospitalId(selectedBillingGroup.hospital.id)
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
      body: JSON.stringify({ ...form, status: uiToApiStatus[form.status] }),
    })
    clearForm()
    await load()
  }

  function clearForm(date = selectedDay) {
    setEditingId(null)
    setForm({ ...emptyForm, data: date, hospitalId: hospitais[0]?.id || "" })
  }

  async function remove(id: string) {
    await fetch(`/api/plantoes/${id}`, { method: "DELETE" })
    await load()
  }

  async function gerarNota() {
    setBillingMessage("")
    if (!selectedBillingGroup || billingPlantaoIds.length === 0) return
    const [year, month] = competencia.split("-")
    const response = await fetch("/api/notas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hospitalId: selectedBillingGroup.hospital.id,
        plantaoIds: billingPlantaoIds,
        dataEmissao,
        competencia: `${month}/${year}`,
      }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setBillingMessage(data?.error ?? "Nao foi possivel gerar a nota.")
      return
    }
    const nota = await response.json()
    if (!nota) {
      setBillingMessage("Nenhum plantao disponivel para gerar nota neste hospital.")
      return
    }
    setBillingMessage("Nota gerada com sucesso. O valor fica como a receber ate marcar os plantoes como recebidos.")
    await load()
  }

  async function aplicarStatusNoMes() {
    const targets = monthPlantoes.filter((plantao) => plantao.hospitalId === bulkHospitalId)
    await Promise.all(targets.map((plantao) =>
      fetch(`/api/plantoes/${plantao.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...plantao, status: uiToApiStatus[bulkStatus] }),
      })
    ))
    await load()
  }

  function edit(plantao: Plantao) {
    setEditingId(plantao.id)
    setSelectedDay(plantao.data)
    setForm({
      hospitalId: plantao.hospitalId,
      data: plantao.data,
      horaInicio: plantao.horaInicio,
      horaFim: plantao.horaFim,
      especialidade: plantao.especialidade,
      valor: plantao.valor,
      status: apiToUiStatus(plantao.status),
    })
  }

  function createForDay(day: string) {
    setSelectedDay(day)
    clearForm(day)
  }

  function toggleBillingPlantao(id: string) {
    setBillingPlantaoIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const selectedTotal = selectedBillingGroup?.plantoes
    .filter((plantao) => billingPlantaoIds.includes(plantao.id))
    .reduce((sum, plantao) => sum + plantao.valor, 0) ?? 0
  const bulkTargets = monthPlantoes.filter((plantao) => plantao.hospitalId === bulkHospitalId)
  const selectedHospital = hospitais.find((hospital) => hospital.id === form.hospitalId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda de Plantoes</h1>
          <p className="text-muted-foreground">Clique no calendario para criar ou editar. Recebido so conta quando o status do plantao for recebido.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <Input
            type="month"
            value={monthKey}
            onChange={(event) => setCurrentDate(startOfMonth(parseISO(`${event.target.value}-01`)))}
            className="w-40"
          />
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <Card className={editingId ? "border-emerald-500" : undefined}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingId ? <Pencil className="h-5 w-5 text-emerald-600" /> : <Plus className="h-5 w-5 text-emerald-600" />}
            {editingId ? `Editando plantao de ${format(parseISO(form.data), "dd/MM/yyyy")}` : `Novo plantao em ${format(parseISO(form.data), "dd/MM/yyyy")}`}
          </CardTitle>
          {editingId && selectedHospital && <p className="text-sm text-muted-foreground">Voce esta alterando o plantao em {selectedHospital.nome}. Salve ou cancele para sair da edicao.</p>}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Hospital</Label>
            <Select value={form.hospitalId} onValueChange={(hospitalId) => setForm({ ...form, hospitalId })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{hospitais.map((h) => <SelectItem key={h.id} value={h.id}>{h.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Field label="Data" type="date" value={form.data} onChange={(data) => { setForm({ ...form, data }); setSelectedDay(data) }} />
          <Field label="Inicio" type="time" value={form.horaInicio} onChange={(horaInicio) => setForm({ ...form, horaInicio })} />
          <Field label="Fim" type="time" value={form.horaFim} onChange={(horaFim) => setForm({ ...form, horaFim })} />
          <Field label="Especialidade" value={form.especialidade} onChange={(especialidade) => setForm({ ...form, especialidade })} />
          <Field label="Valor" type="number" value={String(form.valor)} onChange={(valor) => setForm({ ...form, valor: Number(valor) })} />
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(status: UiStatus) => setForm({ ...form, status })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="faturado">Faturado</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={save}><Plus className="mr-2 h-4 w-4" />Salvar</Button>
            {editingId && <Button variant="outline" onClick={() => clearForm()}>Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Atualizar status do mes por hospital</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Hospital</Label>
            <Select value={bulkHospitalId} onValueChange={setBulkHospitalId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{hospitais.map((h) => <SelectItem key={h.id} value={h.id}>{h.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Novo status</Label>
            <Select value={bulkStatus} onValueChange={(status: UiStatus) => setBulkStatus(status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="faturado">Faturado</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end md:col-span-2">
            <Button disabled={!bulkTargets.length} onClick={aplicarStatusNoMes}>
              Aplicar em {bulkTargets.length} plantoes de {format(currentDate, "MMMM", { locale: ptBR })}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Faturamento por hospital</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {prontosParaNotaPorHospital.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum plantao pendente ou faturado sem nota. A nota emitida nao considera pagamento.</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Hospital</Label>
                  <Select value={selectedBillingGroup?.hospital.id} onValueChange={(hospitalId) => { setBillingHospitalId(hospitalId); setBillingPlantaoIds([]) }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {prontosParaNotaPorHospital.map(({ hospital, plantoes }) => (
                        <SelectItem key={hospital.id} value={hospital.id}>{hospital.nome} ({plantoes.length})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Data de emissao da nota" type="date" value={dataEmissao} onChange={setDataEmissao} />
                <Field label="Competencia dos servicos" type="month" value={competencia} onChange={setCompetencia} />
                <div className="flex items-end">
                  <Button className="w-full" disabled={!billingPlantaoIds.length} onClick={gerarNota}><FileText className="mr-2 h-4 w-4" />Gerar nota</Button>
                </div>
              </div>
              {billingMessage && <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{billingMessage}</p>}

              <div className="rounded-md border">
                {selectedBillingGroup?.plantoes.map((plantao) => (
                  <label key={plantao.id} className="flex cursor-pointer items-center justify-between gap-3 border-b p-3 last:border-b-0">
                    <span className="flex items-center gap-3">
                      <input type="checkbox" checked={billingPlantaoIds.includes(plantao.id)} onChange={() => toggleBillingPlantao(plantao.id)} />
                      <span>
                        <strong>{format(parseISO(plantao.data), "dd/MM/yyyy")}</strong>
                        <span className="ml-2 text-sm text-muted-foreground">{plantao.especialidade} | {plantao.horaInicio}-{plantao.horaFim} | {statusLabels[apiToUiStatus(plantao.status)]}</span>
                      </span>
                    </span>
                    <span className="font-semibold">R$ {plantao.valor.toLocaleString("pt-BR")}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Total da nota: <strong>R$ {selectedTotal.toLocaleString("pt-BR")}</strong>. Para considerar pago, altere os plantoes para recebido.
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />{format(currentDate, "MMMM yyyy", { locale: ptBR })}</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-7">
            {monthDays.map((day) => {
              const date = format(day, "yyyy-MM-dd")
              const dayPlantoes = plantoes.filter((p) => p.data === date)
              const isSelected = selectedDay === date
              return (
                <button key={date} className={`min-h-28 rounded-md border p-2 text-left transition hover:border-emerald-500 ${isSelected ? "border-emerald-500 bg-emerald-50" : ""}`} onClick={() => createForDay(date)}>
                  <p className="mb-2 text-sm font-medium">{format(day, "d EEE", { locale: ptBR })}</p>
                  <div className="space-y-1">
                    {dayPlantoes.map((plantao) => (
                      <span key={plantao.id} className="block w-full rounded px-2 py-1 text-xs text-white" style={{ backgroundColor: plantao.hospitalCor }} onClick={(event) => { event.stopPropagation(); edit(plantao) }}>
                        {plantao.horaInicio} {plantao.hospitalNome} ({statusLabels[apiToUiStatus(plantao.status)]})
                      </span>
                    ))}
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{format(parseISO(selectedDay), "dd/MM/yyyy")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {selectedDayPlantoes.length === 0 && <p className="text-sm text-muted-foreground">Sem plantoes neste dia. Clique em salvar no formulario para criar.</p>}
            {selectedDayPlantoes.map((plantao) => (
              <button key={plantao.id} className="block w-full rounded-md border p-3 text-left hover:border-emerald-500" onClick={() => edit(plantao)}>
                <p className="font-medium">{plantao.hospitalNome}</p>
                <p className="text-sm text-muted-foreground">{plantao.horaInicio}-{plantao.horaFim} | {statusLabels[apiToUiStatus(plantao.status)]}</p>
                <p className="text-sm font-semibold">R$ {plantao.valor.toLocaleString("pt-BR")}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Lista de plantoes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {plantoes.map((plantao) => (
            <div key={plantao.id} className="flex items-center justify-between rounded-md border p-3">
              <button className="text-left" onClick={() => edit(plantao)}>
                <p className="font-medium">{plantao.hospitalNome} - {format(parseISO(plantao.data), "dd/MM/yyyy")}</p>
                <p className="text-sm text-muted-foreground">{plantao.especialidade} | {plantao.horaInicio}-{plantao.horaFim} | {statusLabels[apiToUiStatus(plantao.status)]}</p>
              </button>
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

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></div>
}
