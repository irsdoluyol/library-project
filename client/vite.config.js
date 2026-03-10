import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, req, res) => {
            if (err.code === "ECONNREFUSED") {
              console.log(
                "\n⚠️  [Vite proxy] Backend недоступен. Запустите сервер:\n   cd server && npm run dev\n"
              );
            }
          });
        },
      },
    },
  },
})
