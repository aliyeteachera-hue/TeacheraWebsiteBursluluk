import { describe, expect, it } from 'vitest'
import { isValidTrMobilePhone, normalizeTrMobileInput } from './phoneUtils'

describe('phoneUtils', () => {
  it('normalizes +90 input into 5XX XXX XX XX format', () => {
    expect(normalizeTrMobileInput('+90 (532) 123 45 67')).toBe('532 123 45 67')
  })

  it('keeps only first 10 mobile digits and formats with spaces', () => {
    expect(normalizeTrMobileInput('05321234567899')).toBe('532 123 45 67')
  })

  it('rejects non-mobile prefixes during normalization', () => {
    expect(normalizeTrMobileInput('3121234567')).toBe('')
  })

  it('validates correct mobile format', () => {
    expect(isValidTrMobilePhone('532 123 45 67')).toBe(true)
  })

  it('invalidates wrong format', () => {
    expect(isValidTrMobilePhone('5321234567')).toBe(false)
    expect(isValidTrMobilePhone('312 123 45 67')).toBe(false)
  })
})
