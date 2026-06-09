import type { AppSettings, Empresa, Hospital, NotaFiscal, Plantao } from "@/lib/types"

export const hospitalsSeed: Hospital[] = [
  { id: "h1", nome: "Hospital Sao Lucas", cnpj: "12.345.678/0001-90", cidade: "Sao Paulo", estado: "SP", contatoFinanceiro: "Maria Santos", telefone: "(11) 3456-7890", prazoMedioPagamento: 30, cor: "#10b981", totalFaturado: 0, plantoesRealizados: 0, mediaAtraso: 0, ultimoPagamento: "-" },
  { id: "h2", nome: "Clinica Santa Maria", cnpj: "98.765.432/0001-10", cidade: "Sao Paulo", estado: "SP", contatoFinanceiro: "Joao Pereira", telefone: "(11) 2345-6789", prazoMedioPagamento: 45, cor: "#3b82f6", totalFaturado: 0, plantoesRealizados: 0, mediaAtraso: 0, ultimoPagamento: "-" },
  { id: "h3", nome: "UPA Centro", cnpj: "45.678.901/0001-23", cidade: "Campinas", estado: "SP", contatoFinanceiro: "Ana Costa", telefone: "(19) 3456-7890", prazoMedioPagamento: 15, cor: "#8b5cf6", totalFaturado: 0, plantoesRealizados: 0, mediaAtraso: 0, ultimoPagamento: "-" },
]

export const plantoesSeed: Plantao[] = [
  { id: "p1", hospitalId: "h1", hospitalNome: "Hospital Sao Lucas", hospitalCor: "#10b981", data: "2026-06-05", horaInicio: "19:00", horaFim: "07:00", especialidade: "UTI", valor: 1500, status: "recebido", notaFiscalId: "n1" },
  { id: "p2", hospitalId: "h1", hospitalNome: "Hospital Sao Lucas", hospitalCor: "#10b981", data: "2026-06-12", horaInicio: "19:00", horaFim: "07:00", especialidade: "UTI", valor: 1500, status: "realizado" },
  { id: "p3", hospitalId: "h2", hospitalNome: "Clinica Santa Maria", hospitalCor: "#3b82f6", data: "2026-06-14", horaInicio: "07:00", horaFim: "19:00", especialidade: "Clinica Geral", valor: 1200, status: "faturado", notaFiscalId: "n2" },
  { id: "p4", hospitalId: "h3", hospitalNome: "UPA Centro", hospitalCor: "#8b5cf6", data: "2026-06-20", horaInicio: "19:00", horaFim: "07:00", especialidade: "Emergencia", valor: 1000, status: "agendado" },
]

export const notasSeed: NotaFiscal[] = [
  { id: "n1", numero: "202600001", tomador: "Hospital Sao Lucas", cnpjTomador: "12.345.678/0001-90", hospitalId: "h1", valor: 1500, dataEmissao: "2026-06-06", competencia: "06/2026", status: "emitida", empresa: "MedTax Demo" },
  { id: "n2", numero: "202600002", tomador: "Clinica Santa Maria", cnpjTomador: "98.765.432/0001-10", hospitalId: "h2", valor: 1200, dataEmissao: "2026-06-15", competencia: "06/2026", status: "emitida", empresa: "MedTax Demo" },
]

export const empresasSeed: Empresa[] = [
  { id: "e1", cnpj: "12.345.678/0001-90", razaoSocial: "Rafael Silva Servicos Medicos LTDA", nomeFantasia: "Dr. Rafael Silva", regimeTributario: "Simples Nacional", cnae: "8630-5/03 - Atividade medica ambulatorial", fatorR: 32.5, situacao: "ativa", dataAbertura: "2020-03-15" },
  { id: "e2", cnpj: "98.765.432/0001-10", razaoSocial: "RS Plantoes Medicos ME", nomeFantasia: "RS Plantoes", regimeTributario: "Simples Nacional", cnae: "8630-5/04 - Atividade medica em regime de plantao", fatorR: 28, situacao: "ativa", dataAbertura: "2022-08-22" },
]

export const settingsSeed: AppSettings = {
  nome: "Dr. Rafael Silva",
  email: "rafael.silva@email.com",
  telefone: "(11) 99999-9999",
  crm: "123456-SP",
  endereco: "Av. Paulista, 1000 - Sao Paulo, SP",
  especialidade: "clinica",
  atuacao: "plantao",
  darkMode: false,
  notifications: {
    email: true,
    push: true,
    sms: false,
    vencimentos: true,
    relatorios: true,
    alertas: true,
  },
}
