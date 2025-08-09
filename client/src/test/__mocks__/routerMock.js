// Mock router for tests
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  currentRoute: {
    value: {
      name: 'home',
      path: '/',
      params: {},
      query: {}
    }
  }
}

export default mockRouter 