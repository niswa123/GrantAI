import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Prevent duplicate React instances (caused by framer-motion or other libs using require('react'))
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Exclude legacy CommonJS test scripts — they use module.exports runner pattern
    exclude: [
      '**/node_modules/**',
      'src/__tests__/01_webhook_github.test.js',
      'src/__tests__/02_email_verification.test.js',
      'src/__tests__/02_webhook_jira_linear.test.js',
      'src/__tests__/03_ai_pipeline.test.js',
      'src/__tests__/04_financial_engine.test.js',
    ],
  },
})
