import { vi, beforeEach } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

global.localStorage = localStorageMock

// Mock document.documentElement.classList
const classListMock = {
  add: vi.fn(),
  remove: vi.fn(),
  toggle: vi.fn(),
  contains: vi.fn(),
}

Object.defineProperty(document.documentElement, 'classList', {
  value: classListMock,
  writable: true,
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})
