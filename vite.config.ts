import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // <-- make sure this points to your src folder
    },
  },
  build: {
    outDir: 'dist',
  },
  base: '/',
});
