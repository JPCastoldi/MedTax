import { NextResponse } from "next/server"
import { hasDatabaseUrl, prisma } from "@/lib/prisma"
import { empresasSeed, hospitalsSeed, notasSeed, plantoesSeed, settingsSeed } from "@/lib/mock-data"
import type { AppSettings, DashboardData, Empresa, Hospital, NotaFiscal, Plantao, PlantaoStatus } from "@/lib/types"

type Store = {
  hospitais: Hospital[]
  plantoes: Plantao[]
  notas: NotaFiscal[]
  empresas: Empresa[]
  settings: AppSettings
}

const globalStore = globalThis as unknown as { medtaxStore?: Store }

function store() {
  if (!globalStore.medtaxStore) {
    globalStore.medtaxStore = {
      hospitais: structuredClone(hospitalsSeed),
      plantoes: structuredClone(plantoesSeed),
      notas: structuredClone(notasSeed),
      empresas: structuredClone(empresasSeed),
      settings: structuredClone(settingsSeed),
    }
  }
  return globalStore.medtaxStore
}

function empresaSituacaoToDb(situacao: Empresa["situacao"]) {
  return situacao.toUpperCase() as "ATIVA" | "SUSPENSA" | "BAIXADA"
}

function empresaSituacaoFromDb(situacao: string) {
  return situacao.toLowerCase() as Empresa["situacao"]
}

function statusToDb(status: PlantaoStatus) {
  return status.toUpperCase() as "AGENDADO" | "REALIZADO" | "FATURADO" | "RECEBIDO"
}

function statusFromDb(status: string) {
  return status.toLowerCase() as PlantaoStatus
}

function isoDate(date: Date | string) {
  return new Date(date).toISOString().slice(0, 10)
}

function addHospitalStats(hospital: Omit<Hospital, "totalFaturado" | "plantoesRealizados" | "mediaAtraso" | "ultimoPagamento">, plantoes: Plantao[], notas: NotaFiscal[]): Hospital {
  const hospitalPlantoes = plantoes.filter((p) => p.hospitalId === hospital.id)
  const receivedPlantoes = hospitalPlantoes.filter((p) => p.status === "recebido")
  const paidNotes = notas.filter((n) => n.hospitalId === hospital.id && n.status === "emitida")
  return {
    ...hospital,
    totalFaturado: receivedPlantoes.reduce((sum, p) => sum + p.valor, 0),
    plantoesRealizados: hospitalPlantoes.length,
    mediaAtraso: 0,
    ultimoPagamento: paidNotes[0]?.dataEmissao ?? "-",
  }
}

export async function listHospitals(userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    const [hospitais, plantoes, notas] = await Promise.all([
      prisma.hospital.findMany({ where: { userId }, orderBy: { nome: "asc" } }),
      listPlantoes(userId),
      listNotas(userId),
    ])
    return hospitais.map((h) =>
      addHospitalStats(
        {
          id: h.id,
          nome: h.nome,
          cnpj: h.cnpj,
          cidade: h.cidade,
          estado: h.estado,
          contatoFinanceiro: h.contatoFinanceiro ?? "",
          telefone: h.telefone ?? "",
          prazoMedioPagamento: h.prazoMedioPagamento,
          cor: h.cor,
        },
        plantoes,
        notas
      )
    )
  }
  const data = store()
  return data.hospitais.map((h) => addHospitalStats(h, data.plantoes, data.notas))
}

export async function saveHospital(payload: Partial<Hospital>, userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    const data = {
      userId,
      nome: payload.nome ?? "",
      cnpj: payload.cnpj ?? "",
      cidade: payload.cidade ?? "",
      estado: payload.estado ?? "",
      contatoFinanceiro: payload.contatoFinanceiro ?? "",
      telefone: payload.telefone ?? "",
      prazoMedioPagamento: Number(payload.prazoMedioPagamento ?? 30),
      cor: payload.cor ?? "#10b981",
    }
    if (payload.id) return prisma.hospital.update({ where: { id: payload.id, userId }, data })
    return prisma.hospital.create({ data })
  }
  const data = store()
  if (payload.id) {
    data.hospitais = data.hospitais.map((h) => (h.id === payload.id ? { ...h, ...payload } as Hospital : h))
    return data.hospitais.find((h) => h.id === payload.id)
  }
  const hospital = { ...payload, id: crypto.randomUUID(), totalFaturado: 0, plantoesRealizados: 0, mediaAtraso: 0, ultimoPagamento: "-" } as Hospital
  data.hospitais.push(hospital)
  return hospital
}

export async function deleteHospital(id: string, userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    return prisma.hospital.delete({ where: { id, userId } })
  }
  const data = store()
  data.hospitais = data.hospitais.filter((h) => h.id !== id)
  data.plantoes = data.plantoes.filter((p) => p.hospitalId !== id)
}

export async function listPlantoes(userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    const plantoes = await prisma.plantao.findMany({ where: { hospital: { userId } }, include: { hospital: true }, orderBy: { data: "asc" } })
    return plantoes.map((p) => ({
      id: p.id,
      hospitalId: p.hospitalId,
      hospitalNome: p.hospital.nome,
      hospitalCor: p.hospital.cor,
      data: isoDate(p.data),
      horaInicio: p.horaInicio,
      horaFim: p.horaFim,
      especialidade: p.especialidade,
      valor: Number(p.valor),
      status: statusFromDb(p.status),
      notaFiscalId: p.notaFiscalId,
    }))
  }
  return store().plantoes
}

export async function savePlantao(payload: Partial<Plantao>, userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    const hospital = await prisma.hospital.findFirst({ where: { id: payload.hospitalId ?? "", userId } })
    if (!hospital) throw new Error("Hospital nao encontrado.")
    const data = {
      hospitalId: payload.hospitalId ?? "",
      data: new Date(`${payload.data}T12:00:00`),
      horaInicio: payload.horaInicio ?? "19:00",
      horaFim: payload.horaFim ?? "07:00",
      especialidade: payload.especialidade ?? "",
      valor: payload.valor ?? 0,
      status: statusToDb(payload.status ?? "agendado"),
    }
    if (payload.id) {
      const plantao = await prisma.plantao.findFirst({ where: { id: payload.id, hospital: { userId } }, select: { id: true } })
      if (!plantao) throw new Error("Plantao nao encontrado.")
      return prisma.plantao.update({ where: { id: plantao.id }, data })
    }
    return prisma.plantao.create({ data })
  }
  const data = store()
  const hospital = data.hospitais.find((h) => h.id === payload.hospitalId)
  if (!hospital) throw new Error("Hospital nao encontrado")
  if (payload.id) {
    data.plantoes = data.plantoes.map((p) => (p.id === payload.id ? { ...p, ...payload, hospitalNome: hospital.nome, hospitalCor: hospital.cor } as Plantao : p))
    return data.plantoes.find((p) => p.id === payload.id)
  }
  const plantao = { ...payload, id: crypto.randomUUID(), hospitalNome: hospital.nome, hospitalCor: hospital.cor } as Plantao
  data.plantoes.push(plantao)
  return plantao
}

export async function deletePlantao(id: string, userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    const plantao = await prisma.plantao.findFirst({ where: { id, hospital: { userId } }, select: { id: true } })
    if (!plantao) throw new Error("Plantao nao encontrado.")
    return prisma.plantao.delete({ where: { id } })
  }
  store().plantoes = store().plantoes.filter((p) => p.id !== id)
}

export async function listNotas(userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    const notas = await prisma.notaFiscal.findMany({ where: { userId }, include: { hospital: true }, orderBy: { dataEmissao: "desc" } })
    return notas.map((n) => ({
      id: n.id,
      numero: n.numero,
      tomador: n.hospital.nome,
      cnpjTomador: n.hospital.cnpj,
      hospitalId: n.hospitalId,
      valor: Number(n.valor),
      dataEmissao: isoDate(n.dataEmissao),
      competencia: n.competencia,
      status: n.status.toLowerCase() as "emitida" | "cancelada",
      empresa: "MedTax",
    }))
  }
  return store().notas
}

export async function gerarNotaPorHospital(
  hospitalId: string,
  competencia: string,
  userId?: string | null,
  options?: { plantaoIds?: string[]; dataEmissao?: string }
) {
  const plantoes = (await listPlantoes(userId)).filter((p) => {
    const belongsToHospital = p.hospitalId === hospitalId
    const isReadyToBill = p.status === "realizado" || p.status === "faturado"
    const hasNoInvoice = !p.notaFiscalId
    const wasSelected = !options?.plantaoIds?.length || options.plantaoIds.includes(p.id)
    return belongsToHospital && isReadyToBill && hasNoInvoice && wasSelected
  })
  if (plantoes.length === 0) return null
  const hospital = (await listHospitals(userId)).find((h) => h.id === hospitalId)
  if (!hospital) return null
  const valor = plantoes.reduce((sum, p) => sum + p.valor, 0)
  const numero = `${new Date().getFullYear()}${String(Date.now()).slice(-6)}`
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    const nota = await prisma.notaFiscal.create({
      data: {
        numero,
        userId,
        hospitalId,
        valor,
        competencia,
        dataEmissao: new Date(`${options?.dataEmissao ?? isoDate(new Date())}T12:00:00`),
      },
    })
    await prisma.plantao.updateMany({ where: { id: { in: plantoes.map((p) => p.id) } }, data: { status: "FATURADO", notaFiscalId: nota.id } })
    return nota
  }
  const data = store()
  const nota: NotaFiscal = { id: crypto.randomUUID(), numero, tomador: hospital.nome, cnpjTomador: hospital.cnpj, hospitalId, valor, dataEmissao: options?.dataEmissao ?? isoDate(new Date()), competencia, status: "emitida", empresa: "MedTax" }
  data.notas.unshift(nota)
  data.plantoes = data.plantoes.map((p) => (plantoes.some((item) => item.id === p.id) ? { ...p, status: "faturado", notaFiscalId: nota.id } : p))
  return nota
}

export async function dashboardData(userId?: string | null): Promise<DashboardData> {
  const [plantoes, notas, hospitais, empresas] = await Promise.all([listPlantoes(userId), listNotas(userId), listHospitals(userId), listEmpresas(userId)])
  const nowMonth = isoDate(new Date()).slice(0, 7)
  const plantoesMes = plantoes.filter((p) => p.data.startsWith(nowMonth))
  const notasMes = notas.filter((n) => n.dataEmissao.startsWith(nowMonth) && n.status === "emitida")
  const recebidosMes = plantoesMes.filter((p) => p.status === "recebido")
  const faturadosMes = plantoesMes.filter((p) => p.status === "faturado")
  const pendentesMes = plantoesMes.filter((p) => p.status === "realizado")
  const valorPrevisto = plantoesMes.reduce((sum, p) => sum + p.valor, 0)
  const valorFaturado = notasMes.reduce((sum, n) => sum + n.valor, 0)
  const valorRecebido = recebidosMes.reduce((sum, p) => sum + p.valor, 0)
  const valorAReceber = faturadosMes.reduce((sum, p) => sum + p.valor, 0)
  const pendenteNota = pendentesMes.reduce((sum, p) => sum + p.valor, 0)
  const regime = empresas[0]?.regimeTributario ?? "Simples Nacional"
  const isSimples = regime.toLowerCase().includes("simples")
  const tributoLabel = isSimples ? "DAS estimado" : "Impostos estimados"
  const taxRate = isSimples ? 0.06 : 0.1333
  const impostosEstimados = valorRecebido * taxRate
  const ranking = hospitais.map((h) => ({ nome: h.nome, faturado: h.totalFaturado, plantoes: h.plantoesRealizados, cor: h.cor })).sort((a, b) => b.faturado - a.faturado)
  return {
      kpis: { plantoesMes: plantoesMes.length, valorPrevisto, valorFaturado, valorRecebido, valorAReceber, pendenteNota, impostosEstimados, liquidoEstimado: valorRecebido - impostosEstimados, tributoLabel },
      revenueData: [{ month: nowMonth, faturamento: valorRecebido, impostos: impostosEstimados }],
    pieData: [
      { name: "Recebido no mes", value: valorRecebido, color: "#10b981" },
      { name: "A receber", value: valorAReceber, color: "#f59e0b" },
    ],
    proximosPlantoes: plantoes.filter((p) => p.status === "realizado").slice(0, 4),
    notasPendentes: notas.filter((n) => n.status === "emitida").slice(0, 4),
    hospitalRanking: ranking,
  }
}

export async function listEmpresas(userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    const empresas = await prisma.empresa.findMany({ where: { userId }, orderBy: { razaoSocial: "asc" } })
    return empresas.map((empresa) => ({
      id: empresa.id,
      cnpj: empresa.cnpj,
      razaoSocial: empresa.razaoSocial,
      nomeFantasia: empresa.nomeFantasia,
      regimeTributario: empresa.regimeTributario,
      cnae: empresa.cnae,
      fatorR: Number(empresa.fatorR),
      situacao: empresaSituacaoFromDb(empresa.situacao),
      dataAbertura: isoDate(empresa.dataAbertura),
    }))
  }
  return store().empresas
}

export async function saveEmpresa(payload: Partial<Empresa>, userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    const data = {
      userId,
      cnpj: payload.cnpj ?? "",
      razaoSocial: payload.razaoSocial ?? "",
      nomeFantasia: payload.nomeFantasia ?? "",
      regimeTributario: payload.regimeTributario ?? "Simples Nacional",
      cnae: payload.cnae ?? "",
      fatorR: payload.fatorR ?? 28,
      situacao: empresaSituacaoToDb(payload.situacao ?? "ativa"),
      dataAbertura: new Date(`${payload.dataAbertura ?? isoDate(new Date())}T12:00:00`),
    }
    if (payload.id) return prisma.empresa.update({ where: { id: payload.id, userId }, data })
    return prisma.empresa.create({ data })
  }
  const data = store()
  if (payload.id) {
    data.empresas = data.empresas.map((empresa) => (empresa.id === payload.id ? { ...empresa, ...payload } as Empresa : empresa))
    return data.empresas.find((empresa) => empresa.id === payload.id)
  }
  const empresa = {
    id: crypto.randomUUID(),
    cnpj: payload.cnpj ?? "",
    razaoSocial: payload.razaoSocial ?? "",
    nomeFantasia: payload.nomeFantasia ?? "",
    regimeTributario: payload.regimeTributario ?? "Simples Nacional",
    cnae: payload.cnae ?? "",
    fatorR: payload.fatorR ?? 28,
    situacao: payload.situacao ?? "ativa",
    dataAbertura: payload.dataAbertura ?? isoDate(new Date()),
  } satisfies Empresa
  data.empresas.push(empresa)
  return empresa
}

export async function deleteEmpresa(id: string, userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    return prisma.empresa.delete({ where: { id, userId } })
  }
  store().empresas = store().empresas.filter((empresa) => empresa.id !== id)
}

export async function getSettings(userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, crm: true } })
    const settings = await prisma.appSettings.upsert({
      where: { userId },
      create: {
        userId,
        nome: user?.name ?? settingsSeed.nome,
        email: user?.email ?? settingsSeed.email,
        telefone: settingsSeed.telefone,
        crm: user?.crm ?? settingsSeed.crm,
        endereco: settingsSeed.endereco,
        especialidade: settingsSeed.especialidade,
        atuacao: settingsSeed.atuacao,
        darkMode: settingsSeed.darkMode,
        emailAlerts: settingsSeed.notifications.email,
        pushAlerts: settingsSeed.notifications.push,
        smsAlerts: settingsSeed.notifications.sms,
        vencimentos: settingsSeed.notifications.vencimentos,
        relatorios: settingsSeed.notifications.relatorios,
        alertas: settingsSeed.notifications.alertas,
      },
      update: {},
    })
    return {
      nome: settings.nome,
      email: settings.email,
      telefone: settings.telefone ?? "",
      crm: settings.crm ?? "",
      endereco: settings.endereco ?? "",
      especialidade: settings.especialidade,
      atuacao: settings.atuacao,
      darkMode: settings.darkMode,
      notifications: {
        email: settings.emailAlerts,
        push: settings.pushAlerts,
        sms: settings.smsAlerts,
        vencimentos: settings.vencimentos,
        relatorios: settings.relatorios,
        alertas: settings.alertas,
      },
    } satisfies AppSettings
  }
  return store().settings
}

export async function saveSettings(payload: AppSettings, userId?: string | null) {
  if (hasDatabaseUrl()) {
    if (!userId) throw new Error("Usuario nao autenticado.")
    await prisma.appSettings.upsert({
      where: { userId },
      create: {
        userId,
        nome: payload.nome,
        email: payload.email,
        telefone: payload.telefone,
        crm: payload.crm,
        endereco: payload.endereco,
        especialidade: payload.especialidade,
        atuacao: payload.atuacao,
        darkMode: payload.darkMode,
        emailAlerts: payload.notifications.email,
        pushAlerts: payload.notifications.push,
        smsAlerts: payload.notifications.sms,
        vencimentos: payload.notifications.vencimentos,
        relatorios: payload.notifications.relatorios,
        alertas: payload.notifications.alertas,
      },
      update: {
        nome: payload.nome,
        email: payload.email,
        telefone: payload.telefone,
        crm: payload.crm,
        endereco: payload.endereco,
        especialidade: payload.especialidade,
        atuacao: payload.atuacao,
        darkMode: payload.darkMode,
        emailAlerts: payload.notifications.email,
        pushAlerts: payload.notifications.push,
        smsAlerts: payload.notifications.sms,
        vencimentos: payload.notifications.vencimentos,
        relatorios: payload.notifications.relatorios,
        alertas: payload.notifications.alertas,
      },
    })
    await prisma.user.update({
      where: { id: userId },
      data: { name: payload.nome, email: payload.email, crm: payload.crm || null },
    })
    return payload
  }
  store().settings = payload
  return payload
}

export async function reportData(userId?: string | null) {
  const [dashboard, hospitais, plantoes, notas, empresas] = await Promise.all([
    dashboardData(userId),
    listHospitals(userId),
    listPlantoes(userId),
    listNotas(userId),
    listEmpresas(userId),
  ])
  return { dashboard, hospitais, plantoes, notas, empresas }
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro interno"
  return NextResponse.json({ error: message }, { status: 500 })
}
