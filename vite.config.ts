import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // default is 'dist'
  },
  base: './' // optional for relative paths if needed
});
