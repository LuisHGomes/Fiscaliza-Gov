import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Portal from "./pages/portal";
import Obras from "./pages/obras";
import ObraDetalhe from "./pages/obra-detalhe";
import Visitas from "./pages/visitas";
import NaoConformidades from "./pages/nao-conformidades";
import Medicoes from "./pages/medicoes";
import Documentos from "./pages/documentos";
import Notificacoes from "./pages/notificacoes";
import IAAssistente from "./pages/ia-assistente";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppLayout } from "./components/layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

setAuthTokenGetter(() => localStorage.getItem("fiscaliza_token"));

function Router() {
  const [location] = useLocation();

  if (location.startsWith("/portal")) {
    return (
      <Switch>
        <Route path="/portal" component={Portal} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  if (location === "/login") {
    return <Route path="/login" component={Login} />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/obras" component={Obras} />
        <Route path="/obras/:id" component={ObraDetalhe} />
        <Route path="/visitas" component={Visitas} />
        <Route path="/nao-conformidades" component={NaoConformidades} />
        <Route path="/medicoes" component={Medicoes} />
        <Route path="/documentos" component={Documentos} />
        <Route path="/notificacoes" component={Notificacoes} />
        <Route path="/ia-assistente" component={IAAssistente} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <SidebarProvider>
            <Router />
          </SidebarProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
