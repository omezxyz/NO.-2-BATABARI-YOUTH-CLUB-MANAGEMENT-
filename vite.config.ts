// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from 'path';

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'), // <-- make sure this points to your src folder
//     },
//   },
//   build: {
//     outDir: 'dist',
//   },
//   base: '/',
// });
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "127.0.0.1", // 👈 force IPv4 (fixes ::1 issue)
    port: 3000,        // 👈 avoid blocked 5173
    strictPort: true,
  },
  build: {
    outDir: "dist",
  },
  base: "/",
});
