"use client"
import { ThemeProvider } from "@/components/theme-provider"

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
            {children}
        </ThemeProvider>
    )
}