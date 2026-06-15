"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatUf } from "@/lib/form-validation"
import type { Hospital } from "@/lib/types"

const emptyForm = {
  nome: "",
  cnpj: "",
  cidade: "",
  estado: "SP",
  contatoFinanceiro: "",
  telefone: "",
  prazoMedioPagamento: 30,
  cor: "#10b981",
}

export default function HospitaisPage() {
  const [hospitais, setHospitais] = useState<Hospital[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  async function load() {
    const response = await fetch("/api/hospitais")
    setHospitais(await response.json())
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(
    () => hospitais.filter((h) => `${h.nome} ${h.cidade}`.toLowerCase().includes(search.toLowerCase())),
    [hospitais, search]
  )
  const canSave = Boolean(form.nome.trim().length >= 3 && form.cidade.trim().length >= 2 && form.estado.length === 2)

  async function save() {
    if (!canSave) return
    const url = editingId ? `/api/hospitais/${editingId}` : "/api/hospitais"
    const payload = {
      ...form,
      cnpj: form.cnpj || `hospital-${editingId ?? Date.now()}`,
      contatoFinanceiro: "",
      telefone: "",
      prazoMedioPagamento: 30,
    }
    await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    setForm(emptyForm)
    setEditingId(null)
    await load()
  }

  async function remove(id: string) {
    await fetch(`/api/hospitais/${id}`, { method: "DELETE" })
    await load()
  }

  function edit(hospital: Hospital) {
    setEditingId(hospital.id)
    setForm({
      nome: hospital.nome,
      cnpj: hospital.cnpj,
      cidade: hospital.cidade,
      estado: hospital.estado,
      contatoFinanceiro: hospital.contatoFinanceiro,
      telefone: hospital.telefone,
      prazoMedioPagamento: hospital.prazoMedioPagamento,
      cor: hospital.cor,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hospitais</h1>
        <p className="text-muted-foreground">Cadastro persistido de hospitais e clinicas.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{editingId ? "Editar hospital" : "Novo hospital"}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Field label="Nome" value={form.nome} onChange={(nome) => setForm({ ...form, nome })} />
          <Field label="Cidade" value={form.cidade} onChange={(cidade) => setForm({ ...form, cidade })} />
          <Field label="UF" value={form.estado} onChange={(estado) => setForm({ ...form, estado: formatUf(estado) })} />
          <div className="space-y-2">
            <Label>Cor</Label>
            <Input type="color" value={form.cor} onChange={(event) => setForm({ ...form, cor: event.target.value })} />
          </div>
          <div className="flex gap-2 md:col-span-4">
            <Button disabled={!canSave} onClick={save}><Plus className="mr-2 h-4 w-4" />Salvar</Button>
            {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      <Input placeholder="Buscar hospital ou cidade" value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-sm" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((hospital) => (
          <Card key={hospital.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md" style={{ backgroundColor: `${hospital.cor}22` }}>
                  <Building2 className="h-5 w-5" style={{ color: hospital.cor }} />
                </span>
                <div>
                  <CardTitle className="text-base">{hospital.nome}</CardTitle>
                  <p className="text-sm text-muted-foreground">{hospital.cidade}, {hospital.estado}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(hospital.id)}><Trash2 className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <span>Recebido: R$ {hospital.totalFaturado.toLocaleString("pt-BR")}</span>
                <span>{hospital.plantoesRealizados} plantoes</span>
              </div>
              <Button variant="outline" className="w-full" onClick={() => edit(hospital)}>Editar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
