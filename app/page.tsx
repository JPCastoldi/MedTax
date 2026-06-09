export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 p-8">
        <div className="max-w-3xl space-y-6">
          <p className="font-medium text-primary">MedTax</p>
          <h1 className="text-5xl font-bold tracking-tight">Gestao fiscal para medicos PJ plantonistas</h1>
          <p className="text-xl text-muted-foreground">
            Controle hospitais, plantoes, faturamento por tomador, notas fiscais e indicadores financeiros em um so lugar.
          </p>
          <div className="flex gap-3">
            <a href="/login" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Entrar</a>
            <a href="/cadastro" className="rounded-md border px-4 py-2">Criar conta</a>
          </div>
        </div>
      </div>
    </main>
  )
}
