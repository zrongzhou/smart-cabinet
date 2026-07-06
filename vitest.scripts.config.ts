import { defineConfig } from 'vitest/config';

// 临时配置：仅用于运行 scripts/import 下的数据契约单测（纯 node 逻辑，无需 jsdom）。
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['scripts/**/*.test.ts'],
  },
});
