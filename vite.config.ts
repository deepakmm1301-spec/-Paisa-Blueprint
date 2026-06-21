import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          bpsc_salary: path.resolve(__dirname, 'bpsc-teacher-salary-calculator/index.html'),
          bihar_da: path.resolve(__dirname, 'bihar-da-calculator/index.html'),
          govt_sip: path.resolve(__dirname, 'government-employee-sip-calculator/index.html'),
          nps_govt: path.resolve(__dirname, 'nps-calculator-for-government-employees/index.html'),
          salary: path.resolve(__dirname, 'salary-calculator/index.html'),
          pension: path.resolve(__dirname, 'pension-calculator/index.html'),
          sip: path.resolve(__dirname, 'plan-sip/index.html'),
          learning: path.resolve(__dirname, 'paise-to-rupee-wisdom/index.html'),
          health: path.resolve(__dirname, 'health-scorecard/index.html'),
          retirement: path.resolve(__dirname, 'retirement-roadmap/index.html'),
          goals: path.resolve(__dirname, 'my-goal-planner/index.html'),
          tax: path.resolve(__dirname, 'tax-regime-optimizer/index.html'),
          networth: path.resolve(__dirname, 'my-wealth-tracker/index.html'),
          seohub: path.resolve(__dirname, 'cabinet-and-resources/index.html'),
          cibil: path.resolve(__dirname, 'cibil-credit-card/index.html'),
          debt: path.resolve(__dirname, 'debt-freedom-planner/index.html'),
          coach: path.resolve(__dirname, 'paisa-ai-coach/index.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
