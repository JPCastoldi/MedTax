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
  const displayName = doctorName(user.name)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then(setUser)
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

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
