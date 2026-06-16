import React from "react";
import { Link, useLocation } from "wouter";
import { Building2, LayoutDashboard, HardHat, FileText, ClipboardList, AlertTriangle, MessageSquare, Bell, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { useGetMe, useLogout } from "@workspace/api-client-react";

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
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}

function AppSidebar({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [location] = useLocation();

  const menu = [
    { name: "Painel Principal", icon: LayoutDashboard, path: "/" },
    { name: "Obras", icon: Building2, path: "/obras" },
    { name: "Visitas", icon: HardHat, path: "/visitas" },
    { name: "Medições", icon: ClipboardList, path: "/medicoes" },
    { name: "Não Conformidades", icon: AlertTriangle, path: "/nao-conformidades" },
    { name: "Documentos", icon: FileText, path: "/documentos" },
    { name: "Notificações", icon: Bell, path: "/notificacoes" },
    { name: "IA Assistente", icon: MessageSquare, path: "/ia-assistente" },
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
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium">
              {user?.nome?.substring(0, 2).toUpperCase() || "US"}
            </div>
            <div className="flex flex-col text-sm truncate">
              <span className="font-medium truncate">{user?.nome}</span>
              <span className="text-xs text-sidebar-foreground/60 capitalize">{user?.perfil}</span>
            </div>
          </div>
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
