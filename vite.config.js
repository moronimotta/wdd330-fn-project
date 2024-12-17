import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        profile: resolve(__dirname, "src/profile/index.html"),
        authentication: resolve(__dirname, "src/authentication/index.html"),
      },
    },
  },
});