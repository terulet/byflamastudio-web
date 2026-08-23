import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx', 'tests/content/**/*.test.ts'],
    // Les proves de UI declaren `// @vitest-environment jsdom` al capçal.
    environment: 'node',
    restoreMocks: true,
  },
})
