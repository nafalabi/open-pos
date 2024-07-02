import path from "path";
import react from "@vitejs/plugin-react-swc";
import { UserConfig } from "vite";

// https://vitejs.dev/config/
export default {
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/images": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/websocket": {
        target: "ws://localhost:8080",
        rewrite: (path) => path.replace(/^\/websocket/, ""),
        ws: true,
      },
    },
  },
} as UserConfig;
