import { describe, expect, test } from '@jest/globals'

import { isSpecificRange } from './semver'

describe('semver', () => {
  for (const version of ['1.0.0', '0.11.0', '0.0.1']) {
    test(`yes ${version}`, () => {
      expect(isSpecificRange(version)).toBeTruthy()
    })
  }

  for (const version of [
    '^1.0.0',
    '~1.0.0',
    '1.0.x',
    '1.x.x',
    '1.0',
    '1',
    ''
  ]) {
    test(`no ${version}`, () => {
      expect(isSpecificRange(version)).toBeFalsy()
    })
  }
})
