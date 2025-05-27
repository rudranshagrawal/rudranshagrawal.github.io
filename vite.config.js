import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // ✅ This is the fix for blank screen on Netlify
  plugins: [react()],
});
