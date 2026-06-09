"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Moon, Save, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AppSettings } from "@/lib/types"

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/configuracoes").then((response) => response.json()).then(setSettings)
  }, [])

  async function save() {
    if (!settings) return
    await fetch("/api/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  if (!settings) return <p>Carregando configuracoes...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Configuracoes</h1>
          <p className="text-muted-foreground">Perfil, notificacoes e aparencia persistidos.</p>
        </div>
        {saved && <span className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" />Salvo</span>}
      </div>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificacoes</TabsTrigger>
          <TabsTrigger value="aparencia">Aparencia</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Dados pessoais e profissionais</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Nome" value={settings.nome} onChange={(nome) => setSettings({ ...settings, nome })} />
              <Field label="Email" value={settings.email} onChange={(email) => setSettings({ ...settings, email })} />
              <Field label="Telefone" value={settings.telefone} onChange={(telefone) => setSettings({ ...settings, telefone })} />
              <Field label="CRM" value={settings.crm} onChange={(crm) => setSettings({ ...settings, crm })} />
              <div className="space-y-2">
                <Label>Especialidade</Label>
                <Select value={settings.especialidade} onValueChange={(especialidade) => setSettings({ ...settings, especialidade })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinica">Clinica Medica</SelectItem>
                    <SelectItem value="emergencia">Medicina de Emergencia</SelectItem>
                    <SelectItem value="pediatria">Pediatria</SelectItem>
                    <SelectItem value="cardiologia">Cardiologia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Area de atuacao</Label>
                <Select value={settings.atuacao} onValueChange={(atuacao) => setSettings({ ...settings, atuacao })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plantao">Plantao</SelectItem>
                    <SelectItem value="consultorio">Consultorio</SelectItem>
                    <SelectItem value="ambos">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Field label="Endereco" value={settings.endereco} onChange={(endereco) => setSettings({ ...settings, endereco })} />
              </div>
              <Button className="md:col-span-2" onClick={save}><Save className="mr-2 h-4 w-4" />Salvar alteracoes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader><CardTitle>Preferencias de notificacao</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-md border p-3">
                  <Label className="capitalize">{key}</Label>
                  <Switch checked={value} onCheckedChange={(checked) => setSettings({ ...settings, notifications: { ...settings.notifications, [key]: checked } })} />
                </div>
              ))}
              <Button onClick={save}><Save className="mr-2 h-4 w-4" />Salvar notificacoes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia">
          <Card>
            <CardHeader><CardTitle>Tema</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <button className={`rounded-md border p-6 text-left ${!settings.darkMode ? "border-primary bg-primary/5" : ""}`} onClick={() => setSettings({ ...settings, darkMode: false })}>
                <Sun className="mb-3 h-6 w-6" />
                <strong>Claro</strong>
              </button>
              <button className={`rounded-md border p-6 text-left ${settings.darkMode ? "border-primary bg-primary/5" : ""}`} onClick={() => setSettings({ ...settings, darkMode: true })}>
                <Moon className="mb-3 h-6 w-6" />
                <strong>Escuro</strong>
              </button>
              <Button className="md:col-span-2" onClick={save}><Save className="mr-2 h-4 w-4" />Salvar aparencia</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="space-y-2"><Label>{label}</Label><Input value={value} onChange={(event) => onChange(event.target.value)} /></div>
}
