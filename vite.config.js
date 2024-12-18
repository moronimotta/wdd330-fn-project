import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/index.html"),
        profile: resolve(__dirname, "src/profile/index.html"),
        login: resolve(__dirname, "src/authentication/login.html"),
        register: resolve(__dirname, "src/authentication/register.html"),
        mealPlan: resolve(__dirname, "src/meal-plan/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"), 
    },
  },
});
