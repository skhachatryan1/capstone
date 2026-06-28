import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Run test files sequentially — integration tests share a DB
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    env: {
      NODE_ENV:               'test',
      PORT:                   '5099',
      FRONTEND_PORT:          '5002',
      DB_HOST:                process.env.DB_HOST  || 'localhost',
      DB_USER:                process.env.DB_USER  || 'dev_user',
      DB_PASS:                process.env.DB_PASS  || 'pass',
      DB_NAME:                process.env.TEST_DB_NAME || 'test_db',
      DB_PORT:                process.env.DB_PORT  || '5432',
      SALT:                   '4',           // low rounds = fast tests
      JWT_ACCESS_SECRET:      'test_access_secret_apex',
      JWT_REFRESH_SECRET:     'test_refresh_secret_apex',
      JWT_ACCESS_EXPIRES_IN:  '1h',
      JWT_REFRESH_EXPIRES_IN: '14d',
    },
  },
});
