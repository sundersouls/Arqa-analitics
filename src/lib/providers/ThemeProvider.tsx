"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps as NextThemesProviderProps,
} from "next-themes";

interface ThemeProviderProps
  extends Omit<NextThemesProviderProps, "attribute"> {
  children: React.ReactNode;
  attribute?: NextThemesProviderProps["attribute"];
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" {...props}>
      {children}
    </NextThemesProvider>
  );
}
