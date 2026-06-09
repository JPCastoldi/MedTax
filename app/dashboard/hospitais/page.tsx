"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

  async function save() {
    const url = editingId ? `/api/hospitais/${editingId}` : "/api/hospitais"
    await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Total</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{hospitais.length}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Faturamento</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">R$ {hospitais.reduce((s, h) => s + h.totalFaturado, 0).toLocaleString("pt-BR")}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Plantoes</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{hospitais.reduce((s, h) => s + h.plantoesRealizados, 0)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{editingId ? "Editar hospital" : "Novo hospital"}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Field label="Nome" value={form.nome} onChange={(nome) => setForm({ ...form, nome })} />
          <Field label="CNPJ" value={form.cnpj} onChange={(cnpj) => setForm({ ...form, cnpj })} />
          <Field label="Cidade" value={form.cidade} onChange={(cidade) => setForm({ ...form, cidade })} />
          <Field label="UF" value={form.estado} onChange={(estado) => setForm({ ...form, estado })} />
          <Field label="Contato financeiro" value={form.contatoFinanceiro} onChange={(contatoFinanceiro) => setForm({ ...form, contatoFinanceiro })} />
          <Field label="Telefone" value={form.telefone} onChange={(telefone) => setForm({ ...form, telefone })} />
          <Field label="Prazo pagamento" type="number" value={String(form.prazoMedioPagamento)} onChange={(prazoMedioPagamento) => setForm({ ...form, prazoMedioPagamento: Number(prazoMedioPagamento) })} />
          <div className="space-y-2">
            <Label>Cor</Label>
            <Input type="color" value={form.cor} onChange={(event) => setForm({ ...form, cor: event.target.value })} />
          </div>
          <div className="flex gap-2 md:col-span-4">
            <Button onClick={save}><Plus className="mr-2 h-4 w-4" />Salvar</Button>
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
              <p className="text-sm text-muted-foreground">{hospital.cnpj}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <span>R$ {hospital.totalFaturado.toLocaleString("pt-BR")}</span>
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
