import { cn } from '../utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('handles conditional classes', () => {
    const hasBorder = true
    const hasShadow = false
    expect(cn('base-class', hasBorder && 'border', hasShadow && 'shadow')).toBe(
      'base-class border',
    )
  })

  it('merges conflicting tailwind classes correctly', () => {
    // `tailwind-merge` should resolve the conflict, keeping the last one.
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })

  it('handles a mix of strings, objects, and arrays', () => {
    expect(
      cn('p-4', { 'font-bold': true, 'text-lg': false }, ['m-2', 'block']),
    ).toBe('p-4 font-bold m-2 block')
  })
})
