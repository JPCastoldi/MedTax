import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const steps = ["Cadastrar CNPJ e regime tributario", "Adicionar primeiro hospital", "Registrar primeiro plantao", "Gerar nota fiscal quando o plantao for realizado"]

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center p-6">
      <Card>
        <CardHeader><CardTitle>Onboarding MedTax</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">Configure a operacao fiscal do medico PJ em poucos passos.</p>
          <ol className="space-y-3">
            {steps.map((step, index) => <li key={step} className="rounded-md border p-3"><strong>{index + 1}.</strong> {step}</li>)}
          </ol>
          <Button asChild><Link href="/dashboard/hospitais">Comecar cadastro</Link></Button>
        </CardContent>
      </Card>
    </main>
  )
}
