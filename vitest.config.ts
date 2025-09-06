import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'android/**',
        'ios/**',
        'bin/**',
        'docs/**',
        'examples/**',
        '.github/**',
        'coverage/**',
        'src/test-setup.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    },
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules/**', 'dist/**', 'android/**', 'ios/**', 'bin/**', 'docs/**', 'examples/**', '.github/**'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@providers': resolve(__dirname, './src/providers'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@react': resolve(__dirname, './src/react'),
      '@capacitor': resolve(__dirname, './src/capacitor'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
});
