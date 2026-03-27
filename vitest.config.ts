import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // ใช้ node environment
    environment: 'node',
    // รัน tests แบบ isolated
    isolate: true,
    // timeout สำหรับแต่ละ test
    testTimeout: 10000,
    // แสดง coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/generated/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})