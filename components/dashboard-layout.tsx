"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  BarChart3,
  Bell,
  Building2,
  Calculator,
  CalendarDays,
  ChevronLeft,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Stethoscope,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type CurrentUser = {
  name: string
  email: string
  crm?: string | null
}

type AppNotification = {
  id: string
  title: string
  description: string
  href: string
  level: "info" | "warning" | "success"
  createdAt: string
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Plantoes", href: "/dashboard/plantoes", icon: CalendarDays },
  { name: "Hospitais", href: "/dashboard/hospitais", icon: Stethoscope },
  { name: "Empresas", href: "/dashboard/empresas", icon: Building2 },
  { name: "Notas Fiscais", href: "/dashboard/notas", icon: FileText },
  { name: "Impostos", href: "/dashboard/impostos", icon: Calculator },
  { name: "Relatorios", href: "/dashboard/relatorios", icon: BarChart3 },
  { name: "Configuracoes", href: "/dashboard/configuracoes", icon: Settings },
]

function initials(name: string) {
  return name
    .replace(/^dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U"
}

function doctorName(name: string) {
  const cleanName = name.trim()
  if (!cleanName || cleanName === "Carregando...") return cleanName
  return /^dr\.?\s+/i.test(cleanName) ? cleanName : `Dr. ${cleanName}`
}

function SidebarContent({
  collapsed,
  onToggle,
  user,
}: {
  collapsed: boolean
  onToggle?: () => void
  user: CurrentUser
}) {
  const pathname = usePathname()
  const displayName = doctorName(user.name)

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">M</span>
          </div>
          {!collapsed && <span className="text-lg font-semibold text-sidebar-foreground">MedTax</span>}
        </Link>
        {onToggle && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="hidden text-sidebar-foreground hover:bg-sidebar-accent lg:flex">
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn("w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent", collapsed && "justify-center px-0")}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials(user.name)}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-sidebar-foreground/60">{user.email}</span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/configuracoes">
                <Settings className="mr-2 h-4 w-4" />
                Configuracoes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<CurrentUser>({ name: "Carregando...", email: "" })
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([])
  const displayName = doctorName(user.name)
  const activeNotificationIds = notifications.filter((notification) => notification.id !== "sem-pendencias").map((notification) => notification.id)
  const unreadCount = activeNotificationIds.filter((id) => !seenNotificationIds.includes(id)).length

  async function loadNotifications() {
    const response = await fetch("/api/notificacoes")
    if (!response.ok) return []
    const data = await response.json()
    setNotifications(data)
    return data as AppNotification[]
  }

  function markNotificationsSeen(ids = activeNotificationIds) {
    const nextSeen = Array.from(new Set([...seenNotificationIds, ...ids]))
    setSeenNotificationIds(nextSeen)
    window.localStorage.setItem("medtax_seen_notifications", JSON.stringify(nextSeen))
  }

  async function openNotifications(open: boolean) {
    if (!open) return
    const freshNotifications = await loadNotifications()
    markNotificationsSeen(freshNotifications.filter((notification) => notification.id !== "sem-pendencias").map((notification) => notification.id))
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then(setUser)
    const storedSeen = window.localStorage.getItem("medtax_seen_notifications")
    if (storedSeen) {
      try {
        setSeenNotificationIds(JSON.parse(storedSeen))
      } catch {
        setSeenNotificationIds([])
      }
    }
    loadNotifications()
  }, [])

  return (
    <div className="flex min-h-screen">
      <aside className={cn("hidden flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 lg:flex", collapsed ? "w-16" : "w-64")}>
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} user={user} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <SidebarContent collapsed={false} user={user} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
          <div className="flex items-center gap-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">Bem-vindo, {displayName}</h1>
              <p className="text-sm text-muted-foreground">Gerencie sua vida fiscal com simplicidade</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" title="Ajuda">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 p-0">
                <div className="border-b px-4 py-3">
                  <p className="font-semibold">Guia rapido do mes piloto</p>
                  <p className="text-xs text-muted-foreground">Fluxo recomendado para usar o MedTax no teste.</p>
                </div>
                <div className="space-y-3 p-4 text-sm">
                  <HelpStep step="1" text="Cadastre os hospitais onde trabalha." />
                  <HelpStep step="2" text="Lance os plantoes no calendario com valor e hospital." />
                  <HelpStep step="3" text="Quando for cobrar, mude o plantao para faturado e gere a nota por hospital." />
                  <HelpStep step="4" text="Quando o pagamento cair, marque como recebido e informe a data de recebimento." />
                  <div className="rounded-md bg-emerald-50 p-3 text-xs text-emerald-800">
                    Imposto a pagar segue o mes de emissao da nota. Recebido no mes segue a data de pagamento informada.
                  </div>
                </div>
                <div className="flex gap-2 border-t p-3">
                  <Button asChild size="sm" className="flex-1"><Link href="/dashboard/plantoes">Abrir agenda</Link></Button>
                  <Button asChild size="sm" variant="outline" className="flex-1"><Link href="/dashboard/notas">Ver notas</Link></Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu onOpenChange={openNotifications}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <p className="font-semibold">Notificacoes</p>
                    <p className="text-xs text-muted-foreground">Alertas gerados pelos seus dados</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={loadNotifications}>Atualizar</Button>
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} asChild className="cursor-pointer rounded-md p-0">
                      <Link href={notification.href} className="flex w-full gap-3 p-3">
                        <span className={cn(
                          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                          notification.level === "warning" && "bg-amber-500",
                          notification.level === "success" && "bg-emerald-500",
                          notification.level === "info" && "bg-sky-500"
                        )} />
                        <span>
                          <span className="block text-sm font-medium">{notification.title}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{notification.description}</span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
                <div className="border-t px-4 py-3">
                  <Link href="/dashboard/configuracoes" className="text-xs font-medium text-emerald-600">
                    Ajustar preferencias de notificacao
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

function HelpStep({ step, text }: { step: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">{step}</span>
      <span className="leading-6">{text}</span>
    </div>
  )
}
