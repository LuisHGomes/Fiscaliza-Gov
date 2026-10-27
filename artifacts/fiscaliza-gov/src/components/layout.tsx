import React from "react";
import { Link, useLocation } from "wouter";
import {
  Building2, LayoutDashboard, HardHat, FileText, ClipboardList,
  AlertTriangle, MessageSquare, Bell, LogOut, User, ChevronDown,
  HardHat as MyObrasIcon, Shield
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarFooter, useSidebar
} from "@/components/ui/sidebar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useGetMe, useLogout } from "@workspace/api-client-react";

const PERFIL_LABELS: Record<string, string> = {
  administrador: "Administrador",
  gestor: "Gestor Municipal",
  fiscal: "Fiscal de Obras",
  engenheiro: "Engenheiro",
  auditor: "Auditor",
  cidadao: "Cidadão",
};

const PERFIL_BADGE_COLORS: Record<string, string> = {
  administrador: "bg-red-100 text-red-700",
  gestor: "bg-blue-100 text-blue-700",
  fiscal: "bg-green-100 text-green-700",
  engenheiro: "bg-yellow-100 text-yellow-700",
  auditor: "bg-indigo-100 text-indigo-700",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe();
  const logout = useLogout();

  React.useEffect(() => {
    if (!isLoading && isError) {
      setLocation("/login");
    }
  }, [isLoading, isError, setLocation]);

  if (isLoading || isError) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("fiscaliza_token");
        setLocation("/login");
      }
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar user={user} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function TopBar({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [, setLocation] = useLocation();

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-end px-6 gap-4 flex-shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 hover:bg-muted rounded-md px-2 py-1.5 transition-colors outline-none">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
            {getInitials(user?.nome ?? "US")}
          </div>
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-sm font-medium leading-tight">{user?.nome}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PERFIL_BADGE_COLORS[user?.perfil ?? ""] ?? "bg-muted text-muted-foreground"}`}>
              {PERFIL_LABELS[user?.perfil ?? ""] ?? user?.perfil}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate">{user?.nome}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLocation("/perfil")} className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation("/minhas-obras")} className="cursor-pointer">
            <Building2 className="w-4 h-4 mr-2" />
            Minhas Obras
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sair do Sistema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function AppSidebar({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [location] = useLocation();

  const isAdmin = user?.perfil === "administrador" || user?.perfil === "gestor";

  const menu = [
    { name: "Painel Principal", icon: LayoutDashboard, path: "/" },
    { name: "Minhas Obras", icon: Building2, path: "/minhas-obras" },
    { name: "Obras", icon: Building2, path: "/obras", adminOnly: false },
    { name: "Visitas", icon: HardHat, path: "/visitas" },
    { name: "Medições", icon: ClipboardList, path: "/medicoes" },
    { name: "Não Conformidades", icon: AlertTriangle, path: "/nao-conformidades" },
    { name: "Documentos", icon: FileText, path: "/documentos" },
    { name: "Notificações", icon: Bell, path: "/notificacoes" },
    ];

  return (
    <Sidebar className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight">FISCALIZA.GOV</span>
            <span className="text-xs text-sidebar-foreground/60">{user?.municipioNome || "Município"}</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarMenu>
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
            
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                  <Link href={item.path} className="flex items-center gap-3 w-full">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex flex-col gap-1">
          <Link href="/perfil" className="flex items-center gap-3 px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors rounded-md hover:bg-sidebar-accent w-full">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {getInitials(user?.nome ?? "US")}
            </div>
            <div className="flex flex-col text-sm truncate">
              <span className="font-medium truncate">{user?.nome}</span>
              <span className="text-xs text-sidebar-foreground/60">{PERFIL_LABELS[user?.perfil ?? ""] ?? user?.perfil}</span>
            </div>
          </Link>
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do sistema</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
