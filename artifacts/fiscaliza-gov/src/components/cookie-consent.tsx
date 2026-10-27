import React, { useState, useEffect } from "react";
import { Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

type CookiePreferences = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

export default function CookieConsent() {
  const [, setLocation] = useLocation();
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
  const [showConsent, setShowConsent] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("cookie_preferences");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CookiePreferences;
        setPreferences({ ...preferences, ...parsed });
        setShowConsent(false);
      } catch {
        setShowConsent(true);
      }
    }
  }, []);

  const savePreferences = () => {
    localStorage.setItem("cookie_preferences", JSON.stringify(preferences));
    setShowConsent(false);
    const event = new CustomEvent("cookie_preferences_saved", { detail: preferences });
    window.dispatchEvent(event);
  };

  const handleChange = (key: keyof CookiePreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <CardTitle className="text-sm font-semibold">Gerenciamento de Cookies</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowConsent(false)}>
            Fechar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Este site usa cookies para funcionalidades essenciais, análise de uso e serviços de terceiros. Você pode escolher quais cookies aceitar.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Necessários</span>
              <input
                type="checkbox"
                checked={preferences.necessary}
                onChange={() => handleChange("necessary")}
                className="rounded border-border text-primary focus:ring-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Essenciais para o funcionamento do sistema. Sempre ativados.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm">Funcionais</span>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={() => handleChange("functional")}
                className="rounded border-border text-primary focus:ring-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Para funcionalidades específicas do sistema.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm">Analytics</span>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={() => handleChange("analytics")}
                className="rounded border-border text-primary focus:ring-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Para medir o uso e melhorar a experiência.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm">Marketing</span>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={() => handleChange("marketing")}
                className="rounded border-border text-primary focus:ring-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Para exibir anúncios personalizados.
            </p>
          </div>

          <Button
            className="w-full mt-2"
            onClick={savePreferences}
            disabled={preferences.necessary === false}
          >
            Salvar preferências
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Ao utilizar o site, você concorda com o uso de cookies conforme descrito na{" "}
              <a href="/privacidade" className="underline underline-offset-2">Política de Privacidade</a>
              .
            </span>
          </div>
        </CardContent>
      </Card>
      {preferences.analytics && (
        <Card className="mt-2 border-primary">
          <CardContent className="pt-3">
            <div id="google-analytics"></div>
            <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
            <script>
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: window.location.pathname,
              });`}
            </script>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
