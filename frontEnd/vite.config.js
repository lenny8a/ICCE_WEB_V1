// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import dotenv from 'dotenv';

// dotenv.config({path: '../../.env'});

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   define: {
//     // 'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
//   },
  
// })



import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',         // Esto asegura que Vite escuche en todas las interfaces
    port: 5173,              // El puerto donde quieres que Vite corra
    allowedHosts: [
      'iccewms.loca.lt'     // Permitir todos los subdominios de ngrok
    ]
  },
  base: './',
  define: {
    // 'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
});


