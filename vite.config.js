import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the ThromboGuard project.
// This enables React and ensures consistent builds for development and production.
export default defineConfig({
  plugins: [react()],
});