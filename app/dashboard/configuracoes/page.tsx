"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCrm, formatPhone, isValidCrm, isValidEmail } from "@/lib/form-validation"
import type { AppSettings } from "@/lib/types"

const notificationOptions: Array<{ key: keyof AppSettings["notifications"]; title: string; description: string }> = [
  { key: "alertas", title: "Alertas financeiros", description: "Mostra plantões pendentes, faturados e valores a receber." },
  { key: "vencimentos", title: "Impostos e vencimentos", description: "Avisa quando existir imposto ou DAS estimado no mês." },
  { key: "relatorios", title: "Notas e relatórios", description: "Mostra notas emitidas recentemente e resumo fiscal." },
  { key: "email", title: "Resumo por e-mail", description: "Preferência salva para futuros envios por e-mail." },
  { key: "push", title: "Notificações no app", description: "Mantém o sino do topo ativo para alertas dentro do sistema." },
  { key: "sms", title: "SMS", description: "Preferência salva para futuros lembretes por SMS." },
]

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
  const canSaveProfile = Boolean(settings.nome.trim().length >= 3 && isValidEmail(settings.email) && isValidCrm(settings.crm))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Configuracoes</h1>
          <p className="text-muted-foreground">Perfil e notificacoes persistidos.</p>
        </div>
        {saved && <span className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" />Salvo</span>}
      </div>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificacoes</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Dados pessoais e profissionais</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Nome" value={settings.nome} onChange={(nome) => setSettings({ ...settings, nome })} />
              <Field label="Email" type="email" value={settings.email} onChange={(email) => setSettings({ ...settings, email })} />
              <Field label="Telefone" placeholder="(11) 99999-9999" value={settings.telefone} onChange={(telefone) => setSettings({ ...settings, telefone: formatPhone(telefone) })} />
              <Field label="CRM" placeholder="123456-SP" value={settings.crm} onChange={(crm) => setSettings({ ...settings, crm: formatCrm(crm) })} />
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
              {settings.email && !isValidEmail(settings.email) && <p className="text-xs text-red-600 md:col-span-2">Digite um e-mail valido.</p>}
              {settings.crm && !isValidCrm(settings.crm) && <p className="text-xs text-red-600 md:col-span-2">Use um CRM como 123456-SP.</p>}
              <Button disabled={!canSaveProfile} className="md:col-span-2" onClick={save}><Save className="mr-2 h-4 w-4" />Salvar alteracoes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader><CardTitle>Preferencias de notificacao</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {notificationOptions.map((option) => (
                <div key={option.key} className="flex items-center justify-between gap-4 rounded-md border p-3">
                  <div>
                    <Label>{option.title}</Label>
                    <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  <Switch checked={settings.notifications[option.key]} onCheckedChange={(checked) => setSettings({ ...settings, notifications: { ...settings.notifications, [option.key]: checked } })} />
                </div>
              ))}
              <Button onClick={save}><Save className="mr-2 h-4 w-4" />Salvar notificacoes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></div>
}
