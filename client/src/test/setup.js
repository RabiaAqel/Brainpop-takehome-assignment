// mock import.meta for Jest
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        BASE_URL: '/'
      }
    }
  },
  writable: true
})

// mock console 
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} 