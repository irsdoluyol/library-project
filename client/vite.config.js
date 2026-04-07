import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.VITE_DEV_PORT || 5174);

  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: "jsdom",
    },
    server: {
      port,
      strictPort: false,
      proxy: {
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err) => {
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
    preview: {
      port: 4173,
      strictPort: true,
    },
  };
});
