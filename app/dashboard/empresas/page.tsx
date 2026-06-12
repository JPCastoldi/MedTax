"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, Pencil, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Empresa } from "@/lib/types"

const emptyForm: Omit<Empresa, "id"> = {
  cnpj: "",
  razaoSocial: "",
  nomeFantasia: "",
  regimeTributario: "Simples Nacional",
  cnae: "",
  fatorR: 28,
  situacao: "ativa",
  dataAbertura: new Date().toISOString().slice(0, 10),
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  async function load() {
    const response = await fetch("/api/empresas")
    setEmpresas(await response.json())
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(
    () => empresas.filter((empresa) => `${empresa.razaoSocial} ${empresa.nomeFantasia} ${empresa.cnpj}`.toLowerCase().includes(search.toLowerCase())),
    [empresas, search]
  )

  async function save() {
    const url = editingId ? `/api/empresas/${editingId}` : "/api/empresas"
    await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setEditingId(null)
    setForm(emptyForm)
    await load()
  }

  async function remove(id: string) {
    await fetch(`/api/empresas/${id}`, { method: "DELETE" })
    await load()
  }

  function edit(empresa: Empresa) {
    setEditingId(empresa.id)
    setForm({
      cnpj: empresa.cnpj,
      razaoSocial: empresa.razaoSocial,
      nomeFantasia: empresa.nomeFantasia,
      regimeTributario: empresa.regimeTributario,
      cnae: empresa.cnae,
      fatorR: empresa.fatorR,
      situacao: empresa.situacao,
      dataAbertura: empresa.dataAbertura,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Empresas</h1>
        <p className="text-muted-foreground">Cadastre CNPJs, regimes tributarios e Fator R.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{editingId ? "Editar empresa" : "Nova empresa"}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Field label="CNPJ" value={form.cnpj} onChange={(cnpj) => setForm({ ...form, cnpj })} />
          <Field label="Razao social" value={form.razaoSocial} onChange={(razaoSocial) => setForm({ ...form, razaoSocial })} />
          <Field label="Nome fantasia" value={form.nomeFantasia} onChange={(nomeFantasia) => setForm({ ...form, nomeFantasia })} />
          <div className="space-y-2">
            <Label>Regime</Label>
            <Select value={form.regimeTributario} onValueChange={(regimeTributario) => setForm({ ...form, regimeTributario })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                <SelectItem value="Lucro Real">Lucro Real</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label="CNAE" value={form.cnae} onChange={(cnae) => setForm({ ...form, cnae })} />
          <Field label="Fator R (%)" type="number" value={String(form.fatorR)} onChange={(fatorR) => setForm({ ...form, fatorR: Number(fatorR) })} />
          <Field label="Abertura" type="date" value={form.dataAbertura} onChange={(dataAbertura) => setForm({ ...form, dataAbertura })} />
          <div className="space-y-2">
            <Label>Situacao</Label>
            <Select value={form.situacao} onValueChange={(situacao: Empresa["situacao"]) => setForm({ ...form, situacao })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="suspensa">Suspensa</SelectItem>
                <SelectItem value="baixada">Baixada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 md:col-span-4">
            <Button onClick={save}><Plus className="mr-2 h-4 w-4" />Salvar</Button>
            {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancelar</Button>}
          </div>
        </CardContent>
      </Card>

      <Input className="max-w-sm" placeholder="Buscar por CNPJ ou empresa" value={search} onChange={(event) => setSearch(event.target.value)} />

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((empresa) => (
          <Card key={empresa.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-primary/10 p-2"><Building2 className="h-5 w-5 text-primary" /></span>
                <div>
                  <CardTitle className="text-lg">{empresa.nomeFantasia}</CardTitle>
                  <p className="text-sm text-muted-foreground">{empresa.razaoSocial}</p>
                </div>
              </div>
              <Badge>{empresa.situacao}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><strong>CNPJ:</strong> {empresa.cnpj}</p>
              <p><strong>Regime:</strong> {empresa.regimeTributario}</p>
              <p><strong>CNAE:</strong> {empresa.cnae}</p>
              <p><strong>Fator R:</strong> {empresa.fatorR}%</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => edit(empresa)}><Pencil className="mr-2 h-4 w-4" />Editar</Button>
                <Button variant="outline" onClick={() => remove(empresa.id)}><Trash2 className="mr-2 h-4 w-4" />Excluir</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></div>
}
