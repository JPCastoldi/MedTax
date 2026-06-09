-- CreateEnum
CREATE TYPE "EmpresaSituacao" AS ENUM ('ATIVA', 'SUSPENSA', 'BAIXADA');

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "regimeTributario" TEXT NOT NULL,
    "cnae" TEXT NOT NULL,
    "fatorR" DECIMAL(5,2) NOT NULL,
    "situacao" "EmpresaSituacao" NOT NULL DEFAULT 'ATIVA',
    "dataAbertura" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "crm" TEXT,
    "endereco" TEXT,
    "especialidade" TEXT NOT NULL,
    "atuacao" TEXT NOT NULL,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "pushAlerts" BOOLEAN NOT NULL DEFAULT true,
    "smsAlerts" BOOLEAN NOT NULL DEFAULT false,
    "vencimentos" BOOLEAN NOT NULL DEFAULT true,
    "relatorios" BOOLEAN NOT NULL DEFAULT true,
    "alertas" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");
