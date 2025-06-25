import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  base: "/react-deploy-web-reservation/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["firebase/app", "firebase/auth", "firebase/firestore"],
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          vendor: ["react", "react-dom"],
          icons: ["react-icons", "lucide-react"],
        },
      },
    },
  },
})
