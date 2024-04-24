import { UserConfig, defineConfig } from "vite";
import base from "./vite.config.base";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  root: "frontend/maindesk",
  envDir: '../../',
  build: {
    rollupOptions: {
      output: {
        dir: path.resolve(__dirname, "dist/maindesk"),
      },
    },
  },
  ...base,
}) as UserConfig;
