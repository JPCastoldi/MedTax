export type PlantaoStatus = "agendado" | "realizado" | "faturado" | "recebido"
export type NotaStatus = "emitida" | "cancelada"

export type Hospital = {
  id: string
  nome: string
  cnpj: string
  cidade: string
  estado: string
  contatoFinanceiro: string
  telefone: string
  prazoMedioPagamento: number
  cor: string
  totalFaturado: number
  plantoesRealizados: number
  mediaAtraso: number
  ultimoPagamento: string
}

export type Plantao = {
  id: string
  hospitalId: string
  hospitalNome: string
  hospitalCor: string
  data: string
  horaInicio: string
  horaFim: string
  especialidade: string
  valor: number
  status: PlantaoStatus
  notaFiscalId?: string | null
}

export type NotaFiscal = {
  id: string
  numero: string
  tomador: string
  cnpjTomador: string
  hospitalId: string
  valor: number
  dataEmissao: string
  dataRecebimento?: string | null
  competencia: string
  status: NotaStatus
  empresa: string
}

export type DashboardData = {
  kpis: {
    plantoesMes: number
    valorPrevisto: number
    valorFaturado: number
    valorRecebido: number
    valorAReceber: number
    pendenteNota: number
    impostosEstimados: number
    liquidoEstimado: number
    tributoLabel: string
  }
  revenueData: Array<{ month: string; faturamento: number; impostos: number }>
  pieData: Array<{ name: string; value: number; color: string }>
  proximosPlantoes: Plantao[]
  notasPendentes: NotaFiscal[]
  hospitalRanking: Array<{ nome: string; faturado: number; plantoes: number; cor: string }>
}

export type Empresa = {
  id: string
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  regimeTributario: string
  cnae: string
  fatorR: number
  situacao: "ativa" | "suspensa" | "baixada"
  dataAbertura: string
}

export type AppSettings = {
  nome: string
  email: string
  telefone: string
  crm: string
  endereco: string
  especialidade: string
  atuacao: string
  darkMode: boolean
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    vencimentos: boolean
    relatorios: boolean
    alertas: boolean
  }
}
