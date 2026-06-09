"use client"

import { useEffect, useMemo, useState } from "react"
import { FileText, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { NotaFiscal } from "@/lib/types"

export default function NotasPage() {
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/notas").then((response) => response.json()).then(setNotas)
  }, [])

  const filtered = useMemo(
    () => notas.filter((nota) => `${nota.numero} ${nota.tomador}`.toLowerCase().includes(search.toLowerCase())),
    [notas, search]
  )

  const total = filtered.filter((n) => n.status === "emitida").reduce((sum, n) => sum + n.valor, 0)
  const ticket = filtered.length ? total / filtered.length : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notas Fiscais</h1>
        <p className="text-muted-foreground">Notas emitidas a partir do faturamento por hospital.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Total faturado" value={`R$ ${total.toLocaleString("pt-BR")}`} />
        <Metric title="Notas emitidas" value={String(filtered.length)} />
        <Metric title="Ticket medio" value={`R$ ${ticket.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por numero ou tomador" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      <Card>
        <CardHeader><CardTitle>Historico de notas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Tomador</TableHead>
                <TableHead>Competencia</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell className="font-mono"><FileText className="mr-2 inline h-4 w-4" />{nota.numero}</TableCell>
                  <TableCell>{nota.tomador}<p className="text-xs text-muted-foreground">{nota.cnpjTomador}</p></TableCell>
                  <TableCell>{nota.competencia}</TableCell>
                  <TableCell className="text-right">R$ {nota.valor.toLocaleString("pt-BR")}</TableCell>
                  <TableCell><Badge>{nota.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{value}</CardContent></Card>
}
