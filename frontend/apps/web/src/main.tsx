import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "@workspace/ui/globals.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { AuthProvider } from "@workspace/ui/context/AuthContext"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
