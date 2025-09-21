"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Sun, Moon, Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/lib/useToast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex-1 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{t("settings")}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {t("settingsDescription")}
        </p>
      </header>

      <div className="max-w-md mx-auto space-y-6">
        <section aria-label="Appearance settings">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("appearance")}</CardTitle>
              <CardDescription>{t("appearanceDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-4">
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Sun className="h-5 w-5" aria-hidden="true" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium">{t("darkMode")}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("darkModeDescription")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? "dark" : "light");
                    toast.success(
                      checked ? t("darkThemeEnabled") : t("lightThemeEnabled"),
                    );
                  }}
                  aria-label={`Toggle dark mode. Currently ${theme === "dark" ? "enabled" : "disabled"}`}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-label="Language settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("language")}</CardTitle>
              <CardDescription>{t("languageDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-4">
                  <Languages className="h-5 w-5" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-medium">
                      {locale === "en" ? "Language: EN/RU" : "Язык: RU/EN"}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("toggleLanguage")}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={locale === "en"}
                  onCheckedChange={(checked) => {
                    const newLocale = checked ? "en" : "ru";
                    setLocale(newLocale);
                    toast.success(
                      checked ? t("englishEnabled") : t("russianEnabled"),
                    );
                  }}
                  aria-label={`Toggle language. Currently ${locale === "en" ? "English" : "Russian"}`}
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
