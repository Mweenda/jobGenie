import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useLocalStorage } from '../useLocalStorage'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns initial value when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))

    expect(result.current[0]).toBe('initial-value')
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
  })

  it('returns stored value when localStorage has data', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('stored-value'))

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))

    expect(result.current[0]).toBe('stored-value')
  })

  it('handles complex objects', () => {
    const storedObject = { name: 'John', age: 30 }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedObject))

    const { result } = renderHook(() => useLocalStorage('test-key', {}))

    expect(result.current[0]).toEqual(storedObject)
  })

  it('updates localStorage when value changes', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new-value')
    })

    expect(result.current[0]).toBe('new-value')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'))
  })

  it('supports functional updates', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(5))

    const { result } = renderHook(() => useLocalStorage('test-key', 0))

    act(() => {
      result.current[1]((prev: number) => prev + 1)
    })

    expect(result.current[0]).toBe(6)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(6))
  })

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'))

    expect(result.current[0]).toBe('fallback')
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error reading localStorage key "test-key":',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('handles JSON parse errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json')

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'))

    expect(result.current[0]).toBe('fallback')
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('handles localStorage setItem errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage setItem error')
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new-value')
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error setting localStorage key "test-key":',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('works with different data types', () => {
    // Test with boolean
    localStorageMock.getItem.mockReturnValue(JSON.stringify(true))
    const { result: boolResult } = renderHook(() => useLocalStorage('bool-key', false))
    expect(boolResult.current[0]).toBe(true)

    // Test with number
    localStorageMock.getItem.mockReturnValue(JSON.stringify(42))
    const { result: numberResult } = renderHook(() => useLocalStorage('number-key', 0))
    expect(numberResult.current[0]).toBe(42)

    // Test with array
    const testArray = [1, 2, 3]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(testArray))
    const { result: arrayResult } = renderHook(() => useLocalStorage('array-key', []))
    expect(arrayResult.current[0]).toEqual(testArray)
  })

  it('persists state across re-renders', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const { result, rerender } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    rerender()

    expect(result.current[0]).toBe('updated')
  })
})