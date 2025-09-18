import { renderHook, act } from '@testing-library/react'
import { useWindowSize } from '../useWindowSize'

describe('useWindowSize', () => {
  // Helper function to set window dimensions for testing
  const setWindowSize = (width: number, height: number) => {
    window.innerWidth = width
    window.innerHeight = height
    // Dispatch a resize event to trigger the hook's effect
    window.dispatchEvent(new Event('resize'))
  }

  it('should return the initial window size', () => {
    // Set an initial size for the test environment
    act(() => {
      setWindowSize(1024, 768)
    })

    const { result } = renderHook(() => useWindowSize())

    expect(result.current.width).toBe(1024)
    expect(result.current.height).toBe(768)
  })

  it('should update the size when the window is resized', () => {
    // Set initial size
    act(() => {
      setWindowSize(1024, 768)
    })
    const { result } = renderHook(() => useWindowSize())

    // Check initial size
    expect(result.current.width).toBe(1024)
    expect(result.current.height).toBe(768)

    // Simulate a window resize
    act(() => {
      setWindowSize(800, 600)
    })

    // Check if the hook has updated to the new size
    expect(result.current.width).toBe(800)
    expect(result.current.height).toBe(600)
  })
})
